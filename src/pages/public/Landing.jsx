import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BadgeIndianRupee,
  CheckCircle2,
  Clock,
  Download,
  Headphones,
  Mail,
  MapPin,
  MousePointerClick,
  Phone,
  Send,
  ShieldCheck,
  Smartphone,
  Target,
  TrendingUp,
  UserPlus,
  Zap,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import { BRAND } from '../../config/brand';
import { PublicFooter, PublicNav } from '../../layouts/PublicLayout';
import OfferThumb from '../../components/OfferThumb';
import { Alert, Badge, Button, Field, Input, Textarea } from '../../components/ui';
import { errorMessage, formatCurrency } from '../../utils/format';

// Copy carried over from the legacy marketing SPA (index.html) and index.php
// (3 latest active offers), rebuilt as one page.
const MODELS = [
  { code: 'CPA', name: 'Cost Per Action', text: 'Earn when users complete specific actions like registrations, sign-ups or purchases.', icon: Target },
  { code: 'CPC', name: 'Cost Per Click', text: 'Get paid for every valid click on ads. Simple and effective monetisation.', icon: MousePointerClick },
  { code: 'CPD', name: 'Cost Per Download', text: 'Earn commissions when users download apps or software through your links.', icon: Download },
  { code: 'CPR', name: 'Cost Per Registration', text: 'Get rewarded for each successful user registration you drive to offers.', icon: UserPlus },
  { code: 'CPI', name: 'Cost Per Install', text: 'Maximise earnings with app install campaigns and strong payouts.', icon: Smartphone },
];

const FEATURES = [
  { title: 'INR payments', text: 'Get paid directly in Indian Rupees — no currency conversion hassles or hidden fees.', icon: BadgeIndianRupee },
  { title: 'Instant tracking', text: 'Real-time click and conversion tracking with detailed analytics.', icon: Zap },
  { title: 'Fraud protection', text: 'VPN / proxy filtering keeps traffic clean and protects your earnings.', icon: ShieldCheck },
  { title: 'High payouts', text: 'Competitive rates across verticals so every click works harder.', icon: TrendingUp },
  { title: 'Dedicated support', text: 'Affiliate managers on Telegram, WhatsApp and email.', icon: Headphones },
  { title: 'India-focused', text: 'Offers curated for Indian traffic with localised landing pages.', icon: MapPin },
];

const STEPS = [
  { title: 'Register', text: 'Sign up for free and get instant access to your publisher dashboard.' },
  { title: 'Browse offers', text: 'Explore high-converting offers across multiple verticals.' },
  { title: 'Promote', text: 'Grab your unique tracking link and share it with your audience.' },
  { title: 'Get paid', text: 'Earn commissions and withdraw straight to UPI or bank in INR.' },
];

function HeroMock() {
  const bars = [32, 48, 40, 64, 56, 78, 70, 92, 84, 100];
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-tr from-brand-600/40 via-accent-600/30 to-cyan-400/20 blur-2xl" />
      <div className="relative rounded-3xl bg-white/[0.06] p-3 ring-1 ring-white/15 backdrop-blur-xl">
        <div className="rounded-2xl bg-white p-5 shadow-pop">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ink-500">Example dashboard · earnings</p>
              <p className="mt-1 text-2xl font-extrabold text-ink-900 tabular-nums">₹48,920.00</p>
            </div>
            <Badge tone="success">+24.6%</Badge>
          </div>
          <div className="mt-5 flex h-28 items-end gap-1.5">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-brand-600 to-accent-500" style={{ height: `${h}%`, opacity: 0.45 + i * 0.055 }} />
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ['Clicks', '12.4k'],
              ['Conversions', '1,862'],
              ['CR', '15.0%'],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-line">
                <p className="text-[10px] font-semibold text-ink-500">{l}</p>
                <p className="text-sm font-extrabold text-ink-900">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 -left-6 hidden animate-slide-up items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-pop sm:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-bold text-ink-900">Conversion approved</p>
          <p className="text-[11px] text-ink-500">+₹120.00 credited to wallet</p>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  usePageTitle(`${BRAND.name} — India's affiliate network`);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    apiClient
      .get('/public/offers')
      .then(({ data }) => setOffers(data.offers))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white">
      <PublicNav dark />

      {/* Hero */}
      <section className="relative overflow-hidden bg-sidebar pt-[72px]">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-brand-600/40 blur-[120px]" />
        <div className="absolute top-20 -right-40 h-[480px] w-[480px] rounded-full bg-accent-600/30 blur-[120px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div className="animate-slide-up">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-brand-100 ring-1 ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> India's performance affiliate network
            </p>
            <h1 className="mt-6 text-4xl leading-[1.05] font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Monetise your traffic with
              <span className="block bg-gradient-to-r from-brand-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">high-converting offers.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              Access CPA, CPC, CPD, CPR and CPI campaigns, track every click in real time, and get paid in INR — straight to your UPI or bank.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button to="/publisher/register" size="lg" iconRight={ArrowRight}>
                Start earning — it's free
              </Button>
              <Button to="/publisher/login" size="lg" variant="outline-light">
                Publisher login
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
              {['No joining fee', 'INR payouts', 'Real-time reports'].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {t}
                </span>
              ))}
            </div>
          </div>
          <HeroMock />
        </div>
      </section>

      {/* Payment models */}
      <section id="models" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Payment models" title="Earn the way your traffic converts" text="Choose the payout model that suits your audience and maximise your revenue." />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {MODELS.map((m) => (
              <div key={m.code} className="group rounded-3xl bg-white p-6 ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:ring-brand-200">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 text-white shadow-glow transition group-hover:scale-105">
                  <m.icon className="h-6 w-6" />
                </span>
                <p className="mt-5 text-xs font-extrabold tracking-wider text-brand-600">{m.code}</p>
                <p className="mt-1 text-base font-extrabold text-ink-900">{m.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 bg-canvas py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Why choose us" title="Built for Indian publishers" text="Everything you need to succeed in affiliate marketing, designed for the Indian market." />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 rounded-3xl bg-white p-6 shadow-card ring-1 ring-line">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-extrabold text-ink-900">{f.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Getting started" title="Start earning in four steps" text="It's easy, fast and completely free to join." />
          <div className="relative mt-14 grid gap-6 md:grid-cols-4">
            <div className="absolute top-7 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 md:block" />
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative text-center">
                <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-extrabold text-brand-600 shadow-card-hover ring-1 ring-brand-200">
                  0{i + 1}
                </span>
                <p className="mt-5 text-base font-extrabold text-ink-900">{s.title}</p>
                <p className="mx-auto mt-2 max-w-[240px] text-sm leading-relaxed text-ink-500">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest offers */}
      {offers.length > 0 && (
        <section id="offers" className="scroll-mt-20 bg-canvas py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading eyebrow="Live now" title="Latest offers on the network" text="Sign in to grab your tracking link and start promoting." />
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {offers.map((o) => (
                <div key={o.id} className="flex flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-line transition hover:-translate-y-1 hover:shadow-card-hover">
                  <div className="flex items-start justify-between">
                    <OfferThumb offer={o} size="lg" />
                    <Badge tone="brand">{o.payoutType}</Badge>
                  </div>
                  <p className="mt-5 text-lg font-extrabold text-ink-900">{o.name}</p>
                  <p className="text-xs font-semibold text-ink-500">{o.category || 'General'}</p>
                  <p className="mt-3 line-clamp-2 flex-1 text-sm text-ink-500">{o.description}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                    <div>
                      <p className="text-[11px] font-semibold text-ink-500">Payout</p>
                      <p className="text-lg font-extrabold text-emerald-600 tabular-nums">{formatCurrency(o.totalPayout)}</p>
                    </div>
                    <Button to={`/publisher/offers/${o.id}`} size="sm" iconRight={ArrowRight}>
                      Promote
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-4 py-24 sm:px-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 px-6 py-16 text-center shadow-pop sm:px-16">
          <div className="bg-grid absolute inset-0 opacity-40" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Ready to start earning?</h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-100">Sign up today and get access to exclusive, high-paying offers for Indian traffic.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button to="/publisher/register" size="lg" variant="white" iconRight={ArrowRight}>
                Create free account
              </Button>
              <Button to="/publisher/login" size="lg" variant="outline-light">
                I already have one
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ContactSection />
      <PublicFooter />
    </div>
  );
}

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-extrabold tracking-[0.18em] text-brand-600 uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base text-ink-500">{text}</p>
    </div>
  );
}

// Replaces ajax/handle-form.php (lead form → emails the team).
function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [state, setState] = useState({ status: 'idle', error: '' });

  async function submit(e) {
    e.preventDefault();
    setState({ status: 'sending', error: '' });
    try {
      await apiClient.post('/contact', { ...form, subject: 'Website enquiry', source: 'landing_page' });
      setState({ status: 'sent', error: '' });
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setState({ status: 'error', error: errorMessage(err, 'Could not send your message.') });
    }
  }

  const info = [
    { icon: Mail, label: 'Email', value: BRAND.email, href: `mailto:${BRAND.email}` },
    { icon: Phone, label: 'Phone', value: BRAND.phone },
    { icon: MapPin, label: 'Address', value: BRAND.address },
    { icon: Clock, label: 'Support hours', value: BRAND.hours },
  ];

  return (
    <section id="contact" className="scroll-mt-20 pb-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-extrabold tracking-[0.18em] text-brand-600 uppercase">Get in touch</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">Talk to our affiliate team</h2>
          <p className="mt-4 max-w-md text-ink-500">Questions about offers, payouts or integrations? We're here to help you succeed.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {info.map((i) => (
              <div key={i.label} className="flex gap-3 rounded-2xl bg-canvas p-4 ring-1 ring-line">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-card">
                  <i.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink-500">{i.label}</p>
                  {i.href ? (
                    <a href={i.href} className="text-sm font-bold break-words text-ink-900 hover:text-brand-700">
                      {i.value}
                    </a>
                  ) : (
                    <p className="text-sm font-bold text-ink-900">{i.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-3xl bg-white p-6 shadow-pop ring-1 ring-line sm:p-8">
          {state.status === 'sent' && <Alert tone="success">Thanks! We'll get back to you shortly.</Alert>}
          {state.status === 'error' && <Alert tone="danger">{state.error}</Alert>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required>
              <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </Field>
          </div>
          <Field label="Email" required>
            <Input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </Field>
          <Field label="Message">
            <Textarea rows={5} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={state.status === 'sending'} icon={Send}>
            Send message
          </Button>
        </form>
      </div>
    </section>
  );
}

