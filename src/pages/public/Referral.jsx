import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Gift, Landmark, MessageCircle, Send, Users, XCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import { BrandMark } from '../../layouts/AppShell';
import Loader from '../../components/Loader';
import { Alert, Button, CopyField, Field, Input } from '../../components/ui';
import { errorMessage } from '../../utils/format';

const IFSC_RE = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/;

// Public referral-code generator — replaces refer/index.php. A user who
// completed the offer gets a personal link; friends who claim through it
// referral cashback is sent to the bank account supplied here after review.
export default function Referral() {
  usePageTitle('Refer & earn');
  const [params] = useSearchParams();
  const o = params.get('o');
  const pid = params.get('pid');
  const cid = params.get('cid');

  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(!o || !pid || !cid ? 'This referral link is incomplete.' : '');
  const [form, setForm] = useState({ account_number: '', ifsc: '', account_holder: '', telegram_channel: '' });
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
    if (!/^[0-9]{6,20}$/.test(form.account_number)) return setError('Enter a valid bank account number.');
    if (!IFSC_RE.test(form.ifsc)) return setError('Enter a valid 11-character IFSC code.');
    if (!form.account_holder.trim()) return setError('Enter the account holder name.');
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
                  <Field label="Bank account number" required hint="Referral cashback is sent by bank transfer after review.">
                    <Input icon={Landmark} required inputMode="numeric" pattern="[0-9]{6,20}" maxLength={20} placeholder="Bank account number" value={form.account_number} onChange={(e) => setForm((f) => ({ ...f, account_number: e.target.value.replace(/\D/g, '').slice(0, 20) }))} inputClassName="h-12" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="IFSC" required><Input required maxLength={11} pattern="[A-Za-z]{4}0[A-Za-z0-9]{6}" placeholder="ABCD0123456" value={form.ifsc} onChange={(e) => setForm((f) => ({ ...f, ifsc: e.target.value.toUpperCase() }))} inputClassName="h-12" /></Field>
                    <Field label="Account holder" required><Input required maxLength={50} autoComplete="name" placeholder="Name on account" value={form.account_holder} onChange={(e) => setForm((f) => ({ ...f, account_holder: e.target.value }))} inputClassName="h-12" /></Field>
                  </div>
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
