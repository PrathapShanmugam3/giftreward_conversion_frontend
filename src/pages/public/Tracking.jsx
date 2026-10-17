import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, IndianRupee, MousePointerClick, Search, SearchX, Smartphone } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import { PublicFooter, PublicNav } from '../../layouts/PublicLayout';
import OfferThumb from '../../components/OfferThumb';
import { Alert, Button, Input, Skeleton, StatusBadge } from '../../components/ui';
import { errorMessage, formatCurrency, formatDateTime } from '../../utils/format';

// Replaces tracking/index.php: look up every click recorded for a UPI ID
// (as p1, or as p2 when it was the referrer) with its conversion status and
// cashback. The URL keeps the legacy shape: /tracking?q=<upi>.
export default function Tracking() {
  usePageTitle('Track your cashback');
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [input, setInput] = useState(q);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!q) {
      setResults(null);
      return;
    }
    setLoading(true);
    setError('');
    apiClient
      .get('/tracking', { params: { q } })
      .then(({ data }) => setResults(data.results))
      .catch((err) => setError(errorMessage(err, 'Lookup failed')))
      .finally(() => setLoading(false));
  }, [q]);

  const summary = useMemo(() => {
    const list = results || [];
    return {
      clicks: list.length,
      completed: list.filter((r) => r.status === 'approved').length,
      pending: list.filter((r) => r.status === 'pending').length,
      earned: list.filter((r) => r.status === 'approved').reduce((s, r) => s + Number(r.payout || 0), 0),
    };
  }, [results]);

  function submit(e) {
    e.preventDefault();
    const v = input.trim();
    setParams(v ? { q: v } : {});
  }

  return (
    <div className="min-h-screen bg-canvas">
      <PublicNav />
      <section className="relative overflow-hidden bg-sidebar pt-[72px]">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="absolute -top-32 right-1/4 h-80 w-80 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-accent-600 text-white shadow-glow">
            <Smartphone className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Track your cashback</h1>
          <p className="mx-auto mt-3 max-w-lg text-slate-300">Enter the UPI ID you used on an offer page to see every task you started and whether it was approved.</p>
          <form onSubmit={submit} className="mx-auto mt-8 flex max-w-xl flex-col gap-2 rounded-2xl bg-white/10 p-2 ring-1 ring-white/15 backdrop-blur sm:flex-row">
            <Input icon={Search} placeholder="yourname@upi" value={input} onChange={(e) => setInput(e.target.value)} className="flex-1" inputClassName="h-12 text-base" />
            <Button type="submit" size="lg" loading={loading}>
              Track
            </Button>
          </form>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {error && <Alert tone="danger">{error}</Alert>}

        {loading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        )}

        {!loading && results && results.length === 0 && (
          <div className="rounded-3xl bg-white p-12 text-center shadow-card ring-1 ring-line">
            <SearchX className="mx-auto h-10 w-10 text-ink-400" />
            <p className="mt-4 text-lg font-extrabold text-ink-900">No activity found</p>
            <p className="mt-1 text-sm text-ink-500">
              We couldn't find any tasks for <span className="font-mono font-semibold">{q}</span>. Check the UPI ID and try again.
            </p>
          </div>
        )}

        {!loading && results?.length > 0 && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: 'Tasks started', value: summary.clicks, icon: MousePointerClick, cls: 'bg-sky-50 text-sky-600' },
                { label: 'Approved', value: summary.completed, icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-600' },
                { label: 'Pending', value: summary.pending, icon: Clock, cls: 'bg-amber-50 text-amber-600' },
                { label: 'Approved payout', value: formatCurrency(summary.earned), icon: IndianRupee, cls: 'bg-brand-50 text-brand-600' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-line">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.cls}`}>
                    <s.icon className="h-4.5 w-4.5" />
                  </span>
                  <p className="mt-3 text-xs font-semibold text-ink-500">{s.label}</p>
                  <p className="text-xl font-extrabold text-ink-900 tabular-nums">{s.value}</p>
                </div>
              ))}
            </div>

            <ul className="space-y-3">
              {results.map((r) => (
                <li key={r.clickId} className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-line sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <OfferThumb offer={{ name: r.offerName || '?', image: r.offerImage }} />
                    <div className="min-w-0">
                      <p className="truncate font-extrabold text-ink-900">{r.offerName || `Offer #${r.offerId}`}</p>
                      <p className="text-xs text-ink-500">
                        Started {formatDateTime(r.clickTime)}
                        {r.p2 === q && r.p1 !== q && <span className="ml-1 font-semibold text-violet-600">· as referrer</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-6 sm:justify-end">
                    <div className="text-left sm:text-right">
                      {r.status ? <StatusBadge status={r.status} /> : <StatusBadge status="pending" label="Not completed yet" />}
                      {r.conversionTime && <p className="mt-1 text-[11px] text-ink-400">Completed {formatDateTime(r.conversionTime)}</p>}
                    </div>
                    <p className="w-24 text-right text-lg font-extrabold text-ink-900 tabular-nums">{r.payout != null ? formatCurrency(r.payout) : '—'}</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {!q && !loading && (
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['1', 'Use the same UPI', 'Enter exactly the UPI ID you typed on the offer page.'],
              ['2', 'See every task', 'Each offer you started appears with the time you started it.'],
              ['3', 'Check the status', 'Approved tasks show the payout recorded for them.'],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-line">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-extrabold text-white">{n}</span>
                <p className="mt-3 font-extrabold text-ink-900">{t}</p>
                <p className="mt-1 text-sm text-ink-500">{d}</p>
              </div>
            ))}
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
