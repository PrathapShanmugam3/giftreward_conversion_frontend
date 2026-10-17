import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Gift, MessageCircle, Send, Smartphone, Users, XCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import { BrandMark } from '../../layouts/AppShell';
import Loader from '../../components/Loader';
import { Alert, Button, CopyField, Field, Input } from '../../components/ui';
import { errorMessage } from '../../utils/format';

const UPI_RE = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/i;

// Public referral-code generator — replaces refer/index.php. A user who
// completed the offer gets a personal link; friends who claim through it
// are credited back to this UPI ID on the /o landing page.
export default function Referral() {
  usePageTitle('Refer & earn');
  const [params] = useSearchParams();
  const o = params.get('o');
  const pid = params.get('pid');
  const cid = params.get('cid');

  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(!o || !pid || !cid ? 'This referral link is incomplete.' : '');
  const [form, setForm] = useState({ upi_id: '', telegram_channel: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!o || !pid || !cid) return;
    apiClient
      .get('/refer', { params: { o, cid } })
      .then(({ data: res }) => setData(res))
      .catch((err) => setLoadError(errorMessage(err, 'This referral program is not available.')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!UPI_RE.test(form.upi_id)) return setError('Please enter a valid UPI ID (e.g. 1234567890@upi).');
    setSubmitting(true);
    try {
      const { data: res } = await apiClient.post('/refer', form, { params: { o, pid, cid } });
      setResult(res);
    } catch (err) {
      setError(errorMessage(err, 'Submission failed'));
    } finally {
      setSubmitting(false);
    }
  }

  const referralLink = result ? `${window.location.origin}/o?o=${o}&pid=${pid}&cid=${cid}&as=${result.referralCode}` : '';
  const shareText = `Earn cashback on ${data?.offerName || 'this offer'} with my link: ${referralLink}`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-sidebar">
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="absolute -top-40 -right-32 h-[420px] w-[420px] rounded-full bg-accent-600/40 blur-[110px]" />
      <div className="absolute -bottom-32 -left-32 h-[380px] w-[380px] rounded-full bg-brand-600/30 blur-[110px]" />

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6">
        <div className="mb-6">
          <BrandMark />
        </div>

        {loadError ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-pop">
            <XCircle className="mx-auto h-12 w-12 text-rose-500" />
            <p className="mt-4 text-lg font-extrabold text-ink-900">Referral unavailable</p>
            <p className="mt-1 text-sm text-ink-500">{loadError}</p>
          </div>
        ) : !data ? (
          <div className="rounded-3xl bg-white shadow-pop">
            <Loader />
          </div>
        ) : (
          <div className="glow-border animate-slide-up rounded-3xl bg-white shadow-pop">
            <div className="rounded-3xl bg-white p-6">
              <p className="text-[11px] font-bold tracking-wider text-violet-600 uppercase">Refer & earn</p>
              <h1 className="mt-1 text-xl font-extrabold tracking-tight text-ink-900">{data.offerName}</h1>

              <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-brand-600 p-5 text-center text-white">
                <div className="bg-grid absolute inset-0 opacity-30" />
                <p className="relative flex items-center justify-center gap-1.5 text-xs font-bold tracking-wider uppercase opacity-90">
                  <Gift className="h-4 w-4" /> You earn per friend
                </p>
                <p className="relative mt-1 text-5xl font-extrabold tracking-tight tabular-nums">₹{Number(data.totalReferralCashback).toFixed(2)}</p>
                <p className="relative mt-1 text-xs opacity-90">When a friend completes the offer through your link</p>
              </div>

              {error && <Alert tone="danger" className="mt-5">{error}</Alert>}

              {result ? (
                <div className="mt-5 space-y-4">
                  <Alert tone="success" title={result.alreadyExists ? 'Welcome back' : 'Your link is ready'}>
                    {result.message}
                  </Alert>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-ink-700">Your referral link</p>
                    <CopyField value={referralLink} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" variant="success" icon={MessageCircle}>
                      WhatsApp
                    </Button>
                    <Button href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" variant="telegram" icon={Send}>
                      Telegram
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <Field label="Your UPI ID" required hint="Referral cashback is paid here.">
                    <Input icon={Smartphone} required autoCapitalize="none" placeholder="yourname@upi" value={form.upi_id} onChange={(e) => setForm((f) => ({ ...f, upi_id: e.target.value }))} inputClassName="h-12" />
                  </Field>
                  <Field label="Telegram channel" hint="Optional — shown to friends who open your link.">
                    <Input icon={Send} placeholder="https://t.me/yourchannel" value={form.telegram_channel} onChange={(e) => setForm((f) => ({ ...f, telegram_channel: e.target.value }))} inputClassName="h-12" />
                  </Field>
                  <Button type="submit" size="lg" className="h-14 w-full text-base" loading={submitting} icon={Users}>
                    Get my referral link
                  </Button>
                </form>
              )}

              {data.steps?.length > 0 && (
                <ol className="mt-6 space-y-3 border-t border-line pt-5">
                  {data.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-ink-700">
                      <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-500" />
                      {step}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
