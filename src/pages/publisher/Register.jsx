import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';

export default function PublisherRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    contactNumber: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const { data } = await apiClient.post('/auth/publisher/register', form);
      setMessage(data.message);
    } catch (err) {
      const details = err.response?.data?.details;
      setError(details?.[0]?.msg || err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (message) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow">
          <h1 className="text-lg font-bold text-gray-800">Check your email</h1>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
          <Link to="/publisher/login" className="mt-4 inline-block text-sm font-medium text-blue-600">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow">
        <h1 className="text-xl font-bold text-gray-800">Publisher Registration</h1>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <Field label="Full Name" value={form.name} onChange={update('name')} />
        <Field label="Email" type="email" value={form.email} onChange={update('email')} />
        <Field label="Password" type="password" value={form.password} onChange={update('password')} />
        <Field label="Company Name" value={form.companyName} onChange={update('companyName')} />
        <Field label="Contact Number" value={form.contactNumber} onChange={update('contactNumber')} />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Register'}
        </button>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/publisher/login" className="font-medium text-blue-600">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={onChange}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}
