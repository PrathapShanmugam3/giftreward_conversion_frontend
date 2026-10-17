import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import AuthShell from '../../layouts/AuthShell';
import { Alert, Button, Field, Input } from '../../components/ui';
import { errorMessage } from '../../utils/format';

export default function ForgotPassword() {
  usePageTitle('Reset password');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await apiClient.post('/auth/publisher/forgot-password', { email });
      setMessage(data.message);
    } catch (err) {
      setError(errorMessage(err, 'Request failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your account email and we'll send you a secure reset link."
      footer={
        <Link to="/publisher/login" className="inline-flex items-center gap-1.5 font-bold text-brand-600 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      }
    >
      {error && (
        <Alert tone="danger" className="mb-5">
          {error}
        </Alert>
      )}
      {message ? (
        <Alert tone="success" title="Check your inbox">
          {message}
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email address">
            <Input icon={Mail} type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={submitting} icon={Send}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
