import axios from 'axios';

// Same-origin in dev via the Vite proxy (see vite.config.js), same-origin in
// prod via the Vercel rewrites — so cookies set by the backend are always
// first-party. axios resolves '/api/...' relative to the page origin.
export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Publisher and admin sessions can be open in the same browser at once, so
// each role keeps its own access token; which one a request uses is decided
// by its path (/admin/*, /auth/admin/* vs /publisher/*, /auth/publisher/*).
// Requests to anything else (public pages, /o, /refer, /tracking) carry no
// token.
const tokens = { publisher: null, admin: null };
const unauthorizedHandlers = { publisher: null, admin: null };

function roleFor(url = '') {
  const path = url.replace(/^\/api/, '');
  if (path.startsWith('/admin') || path.startsWith('/auth/admin')) return 'admin';
  if (path.startsWith('/publisher') || path.startsWith('/auth/publisher')) return 'publisher';
  return null;
}

export function setAccessToken(role, token) {
  tokens[role] = token;
}

export function getAccessToken(role) {
  return tokens[role];
}

// Registered by AuthContext so a failed refresh can clear that role's
// session without this module importing React/router directly.
export function setUnauthorizedHandler(role, handler) {
  unauthorizedHandlers[role] = handler;
}

apiClient.interceptors.request.use((config) => {
  const role = roleFor(config.url);
  if (role && tokens[role]) {
    config.headers.Authorization = `Bearer ${tokens[role]}`;
  }
  return config;
});

const refreshPromises = { publisher: null, admin: null };

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const role = roleFor(config?.url);
    // Never try to refresh the refresh/login/logout calls themselves.
    const isAuthCall = /\/auth\/(publisher|admin)\/(refresh|login|logout)/.test(config?.url || '');

    if (response?.status === 401 && role && !isAuthCall && !config._retried) {
      config._retried = true;
      try {
        // Single in-flight refresh per role, shared across concurrent 401s.
        refreshPromises[role] = refreshPromises[role] || apiClient.post(`/auth/${role}/refresh`);
        const { data } = await refreshPromises[role];
        refreshPromises[role] = null;
        tokens[role] = data.accessToken;
        config.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(config);
      } catch (refreshError) {
        refreshPromises[role] = null;
        tokens[role] = null;
        unauthorizedHandlers[role]?.();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// File downloads (CSV / Excel / PDF exports) must go through axios so the
// Bearer token is attached — a plain <a href> can't send it and gets 401.
export async function downloadFile(url, params, fallbackName = 'download') {
  const res = await apiClient.get(url, { params, responseType: 'blob' });
  const disposition = res.headers['content-disposition'] || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const name = match ? match[1] : fallbackName;
  const href = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
