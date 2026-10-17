import { useState } from 'react';
import { ArrowUpRight, ChevronDown, Clock, Mail, MessageCircle, Send } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePublisherAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../context/SiteContext';
import { BRAND } from '../../config/brand';
import { Alert, Button, Card, CardHeader, Field, Input, PageHeader, Textarea } from '../../components/ui';
import { cn, errorMessage } from '../../utils/format';

const FAQS = [
  { q: 'How do I track my conversions?', a: 'Open Reports for click-level data or Conversions for every credited conversion, including the UPI, referrer and mobile captured on the click.' },
  { q: 'When do I get paid?', a: 'Approved conversions credit your wallet immediately. Request a withdrawal from the Wallet page once you pass the minimum payout; our team reviews and processes it.' },
  { q: 'How do I get access to an offer?', a: 'Open the offer in the marketplace and click Request access. Some offers approve instantly, others are reviewed by an admin.' },
  { q: 'Why was my withdrawal rejected?', a: 'Check the note on the invoice. Rejected withdrawals are refunded to your wallet automatically, so you can correct the details and request again.' },
  { q: 'How do postbacks work?', a: 'Add a URL on the Postbacks page or inside an offer. We call it with the conversion details whenever that offer and event convert.' },
];

const CHANNELS = [
  { icon: Send, title: 'Telegram', desc: 'Fastest replies from the affiliate team', href: BRAND.telegram, label: 'Message us', cls: 'from-sky-400 to-blue-600' },
  { icon: MessageCircle, title: 'WhatsApp', desc: 'Chat with us directly', href: BRAND.whatsapp, label: BRAND.phone, cls: 'from-emerald-400 to-green-600' },
  { icon: Mail, title: 'Email', desc: 'For account and payout questions', href: `mailto:${BRAND.email}`, label: BRAND.email, cls: 'from-rose-400 to-pink-600' },
];

// publisher/support.php: contact channels, FAQ and a contact form (the
// legacy form had no handler; this one posts to /api/contact).
export default function PublisherSupport() {
  usePageTitle('Support');
  const { user } = usePublisherAuth();
  const [openFaq, setOpenFaq] = useState(0);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await apiClient.post('/contact', { ...form, source: 'publisher_support' });
      setStatus('sent');
      setForm((f) => ({ ...f, subject: '', message: '' }));
    } catch (err) {
      setStatus('error');
      setError(errorMessage(err, 'Something went wrong sending your message.'));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Account" title="We're here to help" subtitle={`Our affiliate team is available ${BRAND.hours}.`} />

      <div className="grid gap-5 md:grid-cols-3">
        {CHANNELS.map((c) => (
          <a key={c.title} href={c.href} target="_blank" rel="noreferrer" className="group">
            <Card hover className="h-full p-6">
              <span className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-card-hover', c.cls)}>
                <c.icon className="h-6 w-6" />
              </span>
              <p className="mt-4 text-base font-extrabold text-ink-900">{c.title}</p>
              <p className="mt-1 text-sm text-ink-500">{c.desc}</p>
              <p className="mt-4 flex items-center gap-1.5 text-sm font-bold text-brand-600 group-hover:text-brand-700">
                <span className="truncate">{c.label}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </p>
            </Card>
          </a>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="h-fit xl:col-span-2">
          <CardHeader title="Frequently asked" />
          <div className="divide-y divide-line">
            {FAQS.map((faq, i) => (
              <div key={faq.q}>
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="text-sm font-bold text-ink-900">{faq.q}</span>
                  <ChevronDown className={cn('h-4 w-4 shrink-0 text-ink-400 transition-transform', openFaq === i && 'rotate-180')} />
                </button>
                <div className={cn('grid transition-all duration-200', openFaq === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                  <p className="overflow-hidden px-5 text-sm leading-relaxed text-ink-500">
                    <span className="block pb-4">{faq.a}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader title="Send us a message" subtitle="We usually reply within one business day." icon={Clock} />
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            {status === 'sent' && <Alert tone="success">Thanks! We received your message and will get back to you shortly.</Alert>}
            {status === 'error' && <Alert tone="danger">{error}</Alert>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name" required>
                <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </Field>
              <Field label="Email" required>
                <Input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </Field>
            </div>
            <Field label="Subject">
              <Input placeholder="e.g. Payout for withdrawal WD-123" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
            </Field>
            <Field label="Message">
              <Textarea rows={6} placeholder="Tell us what's going on…" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" loading={status === 'sending'} icon={Send}>
                Send message
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
