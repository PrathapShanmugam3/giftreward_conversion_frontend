import { useState } from 'react';
import { Mail, MessageCircle, Send } from 'lucide-react';
import { apiClient } from '../../api/client';

// Mirrors publisher/support.php: contact cards (Telegram/WhatsApp/email),
// an FAQ accordion, and a contact form that now actually submits (the
// legacy page's form had no action/handler at all — see /api/contact).
const FAQS = [
  {
    q: 'How do I track my conversions?',
    a: 'Open Reports or Conversions from the sidebar to see your click and conversion activity in real time.',
  },
  {
    q: 'When do I get paid?',
    a: 'Approved conversions add to your wallet balance immediately. Request a withdrawal any time from the Wallet page once you meet the minimum payout threshold.',
  },
  {
    q: 'How do I request access to a new offer?',
    a: 'Browse Offers, open the one you want, and click Request Access. An admin will review and approve it.',
  },
];

export default function PublisherSupport() {
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      await apiClient.post('/contact', { ...form, source: 'publisher_support' });
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">We're Here to Help</h1>
        <p className="max-w-2xl text-gray-600">
          Our support team is available to assist you with any questions or issues you may have.
        </p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <ContactCard
          icon={<Send className="h-7 w-7 text-blue-500" />}
          iconBg="bg-blue-50"
          title="Telegram Support"
          desc="Get instant help from our team via Telegram"
          href="https://telegram.me/G5KyZ"
          label="Message Us"
          hoverBorder="hover:border-l-[#0088cc]"
        />
        <ContactCard
          icon={<MessageCircle className="h-7 w-7 text-green-500" />}
          iconBg="bg-green-50"
          title="WhatsApp Chat"
          desc="Chat with us directly on WhatsApp"
          href="https://wa.me/917725891584"
          label="+91 77258 91584"
          hoverBorder="hover:border-l-[#25D366]"
        />
        <ContactCard
          icon={<Mail className="h-7 w-7 text-red-500" />}
          iconBg="bg-red-50"
          title="Email Support"
          desc="Send us an email and we'll respond quickly"
          href="mailto:support@gskloots.xyz"
          label="support@gskloots.xyz"
          hoverBorder="hover:border-l-[#EA4335]"
        />
      </div>

      <div className="mb-12 overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b p-6">
          <h2 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {FAQS.map((faq, i) => (
            <div key={faq.q} className="cursor-pointer p-6 transition hover:bg-gray-50" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800">{faq.q}</h3>
                <span className={`text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▾</span>
              </div>
              {openFaq === i && <p className="mt-2 text-gray-600">{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Send Us a Message</h2>
        {status === 'sent' && (
          <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Thanks! We received your message and will get back to you shortly.
          </p>
        )}
        {status === 'error' && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            Something went wrong sending your message. Please try again or email us directly.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Your Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Subject</label>
            <input
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow transition hover:bg-blue-700 disabled:opacity-60 md:w-auto"
          >
            <Send className="h-4 w-4" />
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ContactCard({ icon, iconBg, title, desc, href, label, hoverBorder }) {
  return (
    <div className={`rounded-xl border-l-4 border-l-transparent bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${hoverBorder}`}>
      <div className="flex flex-col items-center text-center">
        <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${iconBg}`}>{icon}</div>
        <h2 className="mb-2 text-xl font-bold text-gray-800">{title}</h2>
        <p className="mb-4 text-gray-600">{desc}</p>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-50 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
        >
          {label}
        </a>
      </div>
    </div>
  );
}
