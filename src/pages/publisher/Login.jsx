import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePublisherAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../context/SiteContext';
import AuthShell from '../../layouts/AuthShell';
import Recaptcha from '../../components/Recaptcha';
import { Alert, Button, Field, Input } from '../../components/ui';
import { errorMessage } from '../../utils/format';

export default function PublisherLogin() {
  usePageTitle('Publisher login');
  const { login } = usePublisherAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const captcha = useRef(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await apiClient.post('/auth/publisher/login', { ...form, recaptchaToken });
      login(data.accessToken, data.user);
      navigate(location.state?.from?.pathname || '/publisher/dashboard', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Login failed'));
      captcha.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your publisher dashboard."
      footer={
        <>
          New to GiftReward?{' '}
          <Link to="/publisher/register" className="font-bold text-brand-600 hover:text-brand-700">
            Create a free account
          </Link>
        </>
      }
    >
      {location.state?.resetSuccess && (
        <Alert tone="success" className="mb-5">
          Password updated. Sign in with your new password.
        </Alert>
      )}
      {error && (
        <Alert tone="danger" className="mb-5">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email address" htmlFor="email">
          <Input
            id="email"
            type="email"
            icon={Mail}
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </Field>
        <Field
          label={
            <span className="flex items-center justify-between">
              Password
              <Link to="/publisher/forgot-password" className="font-semibold text-brand-600 hover:text-brand-700">
                Forgot password?
              </Link>
            </span>
          }
          htmlFor="password"
        >
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              inputClassName="pr-11"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-400 hover:text-ink-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        <Recaptcha ref={captcha} onChange={setRecaptchaToken} />
        <Button type="submit" size="lg" className="w-full" loading={submitting} iconRight={ArrowRight}>
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
