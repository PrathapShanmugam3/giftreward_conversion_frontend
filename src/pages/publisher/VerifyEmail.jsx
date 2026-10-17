import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import AuthShell from '../../layouts/AuthShell';
import Loader from '../../components/Loader';
import { Button } from '../../components/ui';
import { errorMessage } from '../../utils/format';

export default function VerifyEmail() {
  usePageTitle('Verify email');
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState(token ? 'pending' : 'error'); // pending | success | error
  const [message, setMessage] = useState(token ? '' : 'Missing verification token.');

  useEffect(() => {
    if (!token) return;
    apiClient
      .get('/auth/publisher/verify-email', { params: { token } })
      .then(({ data }) => {
        setStatus('success');
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(errorMessage(err, 'Verification failed.'));
      });
  }, [token]);

  return (
    <AuthShell title="Email verification">
      {status === 'pending' ? (
        <Loader label="Verifying your email…" />
      ) : (
        <div className="text-center">
          <span
            className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl text-white ${
              status === 'success' ? 'bg-gradient-to-br from-emerald-400 to-teal-600' : 'bg-gradient-to-br from-rose-400 to-pink-600'
            }`}
          >
            {status === 'success' ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
          </span>
          <p className="text-base font-bold text-ink-900">{status === 'success' ? "You're verified!" : 'Verification failed'}</p>
          <p className="mt-1.5 text-sm text-ink-500">{message}</p>
          <Button to="/publisher/login" className="mt-6 w-full">
            Continue to sign in
          </Button>
        </div>
      )}
    </AuthShell>
  );
}
