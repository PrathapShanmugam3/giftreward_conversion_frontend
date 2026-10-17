import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, setAccessToken, setUnauthorizedHandler } from '../api/client';

// One context, parameterized by `role` ('publisher' | 'admin'), so the
// publisher and admin apps each get their own isolated auth state even
// though they share the same backend token mechanism.
function createAuthContext(role) {
  const Ctx = createContext(null);

  function Provider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(async () => {
      try {
        await apiClient.post(`/auth/${role}/logout`);
      } catch {
        // ignore — we're clearing local state regardless
      }
      setAccessToken(role, null);
      setUser(null);
    }, []);

    useEffect(() => {
      setUnauthorizedHandler(role, () => setUser(null));
      (async () => {
        try {
          const { data } = await apiClient.post(`/auth/${role}/refresh`);
          setAccessToken(role, data.accessToken);
          setUser(data.user);
        } catch {
          setUser(null);
        } finally {
          setLoading(false);
        }
      })();
    }, []);

    const login = useCallback((accessToken, userData) => {
      setAccessToken(role, accessToken);
      setUser(userData);
    }, []);

    // Lets pages (e.g. Profile) reflect edits in the header without a reload.
    const updateUser = useCallback((patch) => setUser((u) => (u ? { ...u, ...patch } : u)), []);

    const value = useMemo(() => ({ user, loading, login, logout, updateUser }), [user, loading, login, logout, updateUser]);

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
  }

  function useAuth() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error(`use${role}Auth must be used within its Provider`);
    return ctx;
  }

  return { Provider, useAuth };
}

export const { Provider: PublisherAuthProvider, useAuth: usePublisherAuth } = createAuthContext('publisher');
export const { Provider: AdminAuthProvider, useAuth: useAdminAuth } = createAuthContext('admin');
