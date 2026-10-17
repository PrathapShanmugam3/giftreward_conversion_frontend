import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, Lock } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import AuthShell from '../../layouts/AuthShell';
import Loader from '../../components/Loader';
import { Alert, Button, Field, Input } from '../../components/ui';
import { errorMessage } from '../../utils/format';

export default function ResetPassword() {
  usePageTitle('Choose a new password');
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    apiClient
      .get('/auth/publisher/reset-password', { params: { token } })
      .then(({ data }) => setTokenValid(data.valid))
      .catch(() => setTokenValid(false))
      .finally(() => setChecking(false));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/auth/publisher/reset-password', { token, password });
      navigate('/publisher/login', { replace: true, state: { resetSuccess: true } });
    } catch (err) {
      setError(errorMessage(err, 'Reset failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password you haven't used before.">
      {checking ? (
        <Loader />
      ) : !tokenValid ? (
        <div className="space-y-5">
          <Alert tone="danger" title="Link expired">
            This reset link is invalid or has expired. Request a new one to continue.
          </Alert>
          <Button to="/publisher/forgot-password" className="w-full">
            Request a new link
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert tone="danger">{error}</Alert>}
          <Field label="New password" hint="At least 8 characters.">
            <Input icon={Lock} type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </Field>
          <Field label="Confirm password">
            <Input icon={Lock} type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={submitting} icon={KeyRound}>
            Update password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
