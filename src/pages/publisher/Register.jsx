import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Lock, Mail, MailCheck, Phone, User } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import AuthShell from '../../layouts/AuthShell';
import Recaptcha from '../../components/Recaptcha';
import { Alert, Button, Field, Input } from '../../components/ui';
import { errorMessage } from '../../utils/format';

export default function PublisherRegister() {
  usePageTitle('Create account');
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '', contactNumber: '' });
  const [agree, setAgree] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const captcha = useRef(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await apiClient.post('/auth/publisher/register', { ...form, recaptchaToken });
      setMessage(data.message);
    } catch (err) {
      setError(errorMessage(err, 'Registration failed'));
      captcha.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  if (message) {
    return (
      <AuthShell title="Check your inbox" subtitle="One more step to activate your account.">
        <div className="text-center">
          <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-[0_12px_30px_-10px_rgba(16,185,129,0.7)]">
            <MailCheck className="h-8 w-8" />
          </span>
          <p className="text-sm leading-relaxed text-ink-700">{message}</p>
          <Button to="/publisher/login" variant="secondary" className="mt-6 w-full">
            Back to sign in
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join free and start promoting offers today."
      footer={
        <>
          Already a publisher?{' '}
          <Link to="/publisher/login" className="font-bold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      {error && (
        <Alert tone="danger" className="mb-5">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name">
          <Input icon={User} required placeholder="Rahul Sharma" value={form.name} onChange={update('name')} autoComplete="name" />
        </Field>
        <Field label="Email address">
          <Input icon={Mail} type="email" required placeholder="you@company.com" value={form.email} onChange={update('email')} autoComplete="email" />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <Input icon={Lock} type="password" required minLength={8} placeholder="••••••••" value={form.password} onChange={update('password')} autoComplete="new-password" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company">
            <Input icon={Building2} required placeholder="Company name" value={form.companyName} onChange={update('companyName')} />
          </Field>
          <Field label="Contact number">
            <Input icon={Phone} required placeholder="98765 43210" value={form.contactNumber} onChange={update('contactNumber')} autoComplete="tel" />
          </Field>
        </div>
        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-500">
          <input type="checkbox" required checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-600" />
          <span>
            I agree to the{' '}
            <Link to="/terms-conditions" target="_blank" className="font-semibold text-brand-600">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/affiliate-agreement" target="_blank" className="font-semibold text-brand-600">
              Affiliate Agreement
            </Link>
            .
          </span>
        </label>
        <Recaptcha ref={captcha} onChange={setRecaptchaToken} />
        <Button type="submit" size="lg" className="w-full" loading={submitting} iconRight={ArrowRight}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
