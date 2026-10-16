import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState('pending'); // pending | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }
    apiClient
      .get('/auth/publisher/verify-email', { params: { token } })
      .then(({ data }) => {
        setStatus('success');
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow">
        <h1 className="text-lg font-bold text-gray-800">Email Verification</h1>
        {status === 'pending' && <p className="mt-2 text-sm text-gray-500">Verifying...</p>}
        {status !== 'pending' && (
          <p className={`mt-2 text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
        )}
        <Link to="/publisher/login" className="mt-4 inline-block text-sm font-medium text-blue-600">
          Back to login
        </Link>
      </div>
    </div>
  );
}
