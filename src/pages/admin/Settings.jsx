import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

// File uploads for banner/favicon aren't implemented yet — accepted as
// plain URL/path strings for now (see siteSettings.service.js note).
export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [originalAdminEmail, setOriginalAdminEmail] = useState('');

  async function load() {
    const { data } = await apiClient.get('/admin/settings');
    setForm(data.settings);
    setAdminEmail(data.settings.adminEmail || '');
    setOriginalAdminEmail(data.settings.adminEmail || '');
  }

  useEffect(() => {
    load();
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
      const { adminEmail: _ignore, id, createdAt, updatedAt, ...payload } = form;
      await apiClient.put('/admin/settings', payload);
      if (adminEmail !== originalAdminEmail) {
        await apiClient.put('/admin/settings/admin-email', { email: adminEmail });
      }
      setMessage('Settings updated successfully.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.details?.[0]?.msg || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (!form) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <div className="admin-theme">
      <h1 className="mb-4 text-xl font-bold text-admin-dark">Site Settings</h1>
      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-admin-danger">{error}</p>}
      {message && <p className="mb-4 rounded-md bg-[#4cc9f01a] px-3 py-2 text-sm text-[#0e7490]">{message}</p>}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-admin bg-white p-6 shadow-admin-card">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Site Name" value={form.siteName} onChange={update('siteName')} />
          <Field label="Domain" value={form.domain} onChange={update('domain')} />
          <Field label="Admin Email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
          <Field label="Currency" value={form.currency} onChange={update('currency')} />
          <Field label="Minimum Withdrawal" type="number" value={form.minimumWithdrawal} onChange={update('minimumWithdrawal')} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Withdrawals Enabled</label>
            <select value={form.wstatus} onChange={update('wstatus')} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="1">Enabled</option>
              <option value="0">Disabled</option>
            </select>
          </div>
          <Field label="reCAPTCHA Site Key" value={form.sitekey} onChange={update('sitekey')} />
          <Field label="reCAPTCHA Secret" type="password" value={form.secret} onChange={update('secret')} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input type={type} value={value ?? ''} onChange={onChange} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-admin-primary focus:outline-none" />
    </div>
  );
}
