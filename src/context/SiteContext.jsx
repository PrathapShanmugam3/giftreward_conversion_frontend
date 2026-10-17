import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { BRAND } from '../config/brand';

// Public site settings from /api/public/site (admin-uploaded favicon/banner,
// currency, min withdrawal, reCAPTCHA site key). Loaded once for the whole
// app; pages fall back to sensible defaults until it arrives.
const SiteCtx = createContext({ siteName: BRAND.name, recaptchaSiteKey: '', loaded: false });

export function SiteProvider({ children }) {
  const [site, setSite] = useState({ siteName: BRAND.name, recaptchaSiteKey: '', loaded: false });

  useEffect(() => {
    apiClient
      .get('/public/site')
      .then(({ data }) => setSite({ ...data.site, loaded: true }))
      .catch(() => setSite((s) => ({ ...s, loaded: true })));
  }, []);

  useEffect(() => {
    if (!site.favicon) return;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.removeAttribute('type');
    link.href = site.favicon;
  }, [site.favicon]);

  return <SiteCtx.Provider value={site}>{children}</SiteCtx.Provider>;
}

export function useSite() {
  return useContext(SiteCtx);
}

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${BRAND.name}` : BRAND.name;
  }, [title]);
}
