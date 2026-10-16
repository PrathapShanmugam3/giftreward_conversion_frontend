import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import Loader from '../../components/Loader';

export default function PublisherProfile() {
  const [form, setForm] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiClient.get('/publisher/profile').then(({ data }) => setForm(data.user));
  }, []);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        companyName: form.companyName,
        contactNumber: form.contactNumber,
      };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      await apiClient.put('/publisher/profile', payload);
      setMessage('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.details?.[0]?.msg || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (!form) return <Loader />;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-800">Profile</h1>
      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {message && <p className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <Field label="Name" value={form.name} onChange={update('name')} />
        <Field label="Email" type="email" value={form.email} onChange={update('email')} />
        <Field label="Company Name" value={form.companyName} onChange={update('companyName')} />
        <Field label="Contact Number" value={form.contactNumber} onChange={update('contactNumber')} />

        <div className="border-t border-gray-100 pt-4">
          <p className="mb-2 text-sm font-medium text-gray-700">Change Password (optional)</p>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="password"
              placeholder="New password (min 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input type={type} required value={value} onChange={onChange} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
    </div>
  );
}
