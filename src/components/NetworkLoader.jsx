import { useEffect, useState } from 'react';
import Loader from './Loader';
import { getPendingRequestCount } from '../api/client';

// One shared indicator for API-backed page loads, filters, and refreshes.
export default function NetworkLoader() {
  const [pending, setPending] = useState(getPendingRequestCount);

  useEffect(() => {
    const sync = (event) => setPending(event.detail || 0);
    window.addEventListener('api:pending', sync);
    return () => window.removeEventListener('api:pending', sync);
  }, []);

  if (!pending) return null;
  return (
    <div className="fixed top-3 right-3 z-[1000] rounded-xl bg-white/95 px-3 shadow-lg ring-1 ring-line" aria-live="polite">
      <Loader className="!flex-row !gap-2 !py-2 [&>div]:!h-5 [&>div]:!w-5 [&>div>div]:!border-2" label="Loading" />
    </div>
  );
}
