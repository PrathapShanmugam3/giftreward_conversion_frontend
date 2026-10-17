import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useSite } from '../context/SiteContext';

// Google reCAPTCHA v2 checkbox, as on the legacy publisher login/register
// pages. Renders only when the backend exposes a site key (it does whenever
// RECAPTCHA_SECRET_KEY is set, i.e. when the server will actually verify);
// with no key the backend skips verification and nothing is shown.
let scriptPromise = null;
function loadScript() {
  if (window.grecaptcha?.render) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      window.__onRecaptchaLoad = () => resolve();
      const s = document.createElement('script');
      s.src = 'https://www.google.com/recaptcha/api.js?onload=__onRecaptchaLoad&render=explicit';
      s.async = true;
      s.defer = true;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

const Recaptcha = forwardRef(function Recaptcha({ onChange }, ref) {
  const { recaptchaSiteKey } = useSite();
  const box = useRef(null);
  const widgetId = useRef(null);

  useImperativeHandle(ref, () => ({
    reset() {
      if (widgetId.current !== null) window.grecaptcha?.reset(widgetId.current);
      onChange?.('');
    },
  }));

  useEffect(() => {
    if (!recaptchaSiteKey || !box.current) return;
    let cancelled = false;
    loadScript().then(() => {
      if (cancelled || widgetId.current !== null || !box.current) return;
      widgetId.current = window.grecaptcha.render(box.current, {
        sitekey: recaptchaSiteKey,
        callback: (token) => onChange?.(token),
        'expired-callback': () => onChange?.(''),
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recaptchaSiteKey]);

  if (!recaptchaSiteKey) return null;
  return <div ref={box} className="min-h-[78px]" />;
});

export default Recaptcha;
