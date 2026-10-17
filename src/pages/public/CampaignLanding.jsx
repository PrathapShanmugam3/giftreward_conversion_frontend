import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Gift, Lock, Phone, Send, Smartphone, User, Users, XCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useSite, usePageTitle } from '../../context/SiteContext';
import { BrandMark } from '../../layouts/AppShell';
import OfferThumb from '../../components/OfferThumb';
import Loader from '../../components/Loader';
import { Alert, Button, Field, Input } from '../../components/ui';
import { errorMessage } from '../../utils/format';

const MOBILE_RE = /^[0-9]{10}$/;
const UPI_RE = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;

// Public cashback landing page — replaces o/index.php. Collects name,
// mobile and UPI, records a campaign_clicks row, then sends the visitor to
// /go (p1 = UPI, p2 = referrer UPI, sub1 = mobile) and on to the advertiser.
export default function CampaignLanding() {
  const [params] = useSearchParams();
  const { banner } = useSite();
  const o = params.get('o');
  const pid = params.get('pid');
  const cid = params.get('cid');
  const as = params.get('as');

  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(!o || !pid || !cid ? 'This link is incomplete. Please use the full link you were given.' : '');
  const [form, setForm] = useState({ name: '', mobile: '', upi_id: '' });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  usePageTitle(data ? `${data.offerName} — claim ₹${Number(data.totalUserCashback).toFixed(2)}` : 'Claim your cashback');

  useEffect(() => {
    if (!o || !pid || !cid) return;
    apiClient
      .get('/o', { params: { o, pid, cid, as: as || undefined } })
      .then(({ data: res }) => setData(res))
      .catch((err) => setLoadError(errorMessage(err, 'This offer is not available right now.')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    if (!/^[A-Za-z ]+$/.test(form.name.trim())) return setSubmitError('Please enter a valid name (letters and spaces only).');
    if (!MOBILE_RE.test(form.mobile)) return setSubmitError('Please enter a valid 10-digit mobile number.');
    if (!UPI_RE.test(form.upi_id)) return setSubmitError('Please enter a valid UPI ID, e.g. name@upi.');

    setSubmitting(true);
    try {
      const { data: res } = await apiClient.post('/o', form, { params: { o, pid, cid, as: as || undefined } });
      window.location.href = res.redirectTo;
    } catch (err) {
      setSubmitError(errorMessage(err, 'Submission failed'));
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-sidebar">
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-brand-600/40 blur-[110px]" />
      <div className="absolute -right-32 bottom-0 h-[380px] w-[380px] rounded-full bg-accent-600/30 blur-[110px]" />

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6">
        <div className="mb-6">
          <BrandMark />
        </div>

        {loadError ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-pop">
            <XCircle className="mx-auto h-12 w-12 text-rose-500" />
            <p className="mt-4 text-lg font-extrabold text-ink-900">Offer unavailable</p>
            <p className="mt-1 text-sm text-ink-500">{loadError}</p>
          </div>
        ) : !data ? (
          <div className="rounded-3xl bg-white shadow-pop">
            <Loader label="Loading your offer…" />
          </div>
        ) : (
          <div className="animate-slide-up space-y-4">
            {banner && <img src={banner} alt="" className="w-full rounded-3xl object-cover shadow-pop ring-1 ring-white/10" />}

            <div className="glow-border rounded-3xl bg-white shadow-pop">
              <div className="rounded-3xl bg-white p-6">
                {data.errorMessage && <Alert tone="warning" className="mb-4">{data.errorMessage}</Alert>}
                {data.referrer?.upiId && (
                  <p className="mb-4 flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
                    <Users className="h-4 w-4" /> Invited by {data.referrer.upiId}
                  </p>
                )}
                <div className="flex items-center gap-4">
                  <OfferThumb offer={{ name: data.offerName, image: data.offerImage }} size="lg" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold tracking-wider text-brand-600 uppercase">Cashback offer</p>
                    <h1 className="truncate text-xl font-extrabold tracking-tight text-ink-900">{data.offerName}</h1>
                  </div>
                </div>

                <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-center text-white">
                  <div className="bg-grid absolute inset-0 opacity-30" />
                  <p className="relative flex items-center justify-center gap-1.5 text-xs font-bold tracking-wider uppercase opacity-90">
                    <Gift className="h-4 w-4" /> Your cashback reward
                  </p>
                  <p className="relative mt-1 text-5xl font-extrabold tracking-tight tabular-nums">₹{Number(data.totalUserCashback).toFixed(2)}</p>
                  <p className="relative mt-1 text-xs opacity-90">Paid to your UPI after the task is verified</p>
                </div>

                {submitError && <Alert tone="danger" className="mt-5">{submitError}</Alert>}

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <Field label="Your name" required>
                    <Input icon={User} required autoComplete="name" placeholder="e.g. Rahul Sharma" value={form.name} onChange={update('name')} inputClassName="h-12" />
                  </Field>
                  <Field label="Mobile number" required>
                    <Input icon={Phone} required inputMode="numeric" maxLength={10} autoComplete="tel-national" placeholder="10-digit mobile" value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value.replace(/\D/g, '') }))} inputClassName="h-12" />
                  </Field>
                  <Field label="UPI ID" required hint="Cashback is sent to this UPI ID.">
                    <Input icon={Smartphone} required autoCapitalize="none" placeholder="yourname@upi" value={form.upi_id} onChange={update('upi_id')} inputClassName="h-12" />
                  </Field>
                  <Button type="submit" size="lg" className="h-14 w-full text-base" loading={submitting} iconRight={ArrowRight}>
                    Claim your ₹{Number(data.totalUserCashback).toFixed(2)}
                  </Button>
                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
                    <Lock className="h-3 w-3" /> Your details are only used to track and pay your cashback.
                  </p>
                </form>
              </div>
            </div>

            {data.steps?.length > 0 && (
              <div className="rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur">
                <p className="mb-4 flex items-center gap-2 text-sm font-extrabold text-white">
                  <BadgeCheck className="h-5 w-5 text-emerald-400" /> How to complete
                </p>
                <ol className="space-y-3">
                  {data.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-200">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-accent-600 text-xs font-extrabold text-white">{i + 1}</span>
                      <span className="pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <p className="pt-2 text-center text-xs text-slate-400">
              Already claimed?{' '}
              <Link to="/tracking" className="font-semibold text-white underline-offset-2 hover:underline">
                Track your cashback
              </Link>
            </p>
          </div>
        )}
      </div>

      {data?.referrer?.telegram && (
        <a
          href={data.referrer.telegram}
          target="_blank"
          rel="noreferrer"
          className="fixed right-5 bottom-5 flex items-center gap-2 rounded-full bg-sky-500 px-4 py-3 text-sm font-bold text-white shadow-pop transition hover:bg-sky-600"
        >
          <Send className="h-4 w-4" /> Join Telegram
        </a>
      )}
    </div>
  );
}
