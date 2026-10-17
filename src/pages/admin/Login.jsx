import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAdminAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../context/SiteContext';
import AuthShell from '../../layouts/AuthShell';
import { Alert, Button, Field, Input } from '../../components/ui';
import { errorMessage } from '../../utils/format';

export default function AdminLogin() {
  usePageTitle('Admin sign in');
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await apiClient.post('/auth/admin/login', form);
      login(data.accessToken, data.user);
      navigate(location.state?.from?.pathname || '/admin/dashboard', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Login failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell variant="admin" title="Admin console" subtitle="Restricted area — authorised staff only.">
      {error && (
        <Alert tone="danger" className="mb-5">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email address">
          <Input icon={Mail} type="email" required autoComplete="username" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </Field>
        <Field label="Password">
          <Input icon={Lock} type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        </Field>
        <Button type="submit" size="lg" variant="dark" className="w-full" loading={submitting} icon={ShieldCheck}>
          Sign in securely
        </Button>
      </form>
    </AuthShell>
  );
}
