import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

export default function AdminPublishers() {
  const [publishers, setPublishers] = useState([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [modal, setModal] = useState(undefined); // undefined=closed, null=create, {publisher, mode}
  const [loading, setLoading] = useState(true);

  async function load(page = 1) {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/publishers', { params: { search: search || undefined, page } });
      setPublishers(data.publishers);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(p) {
    if (!confirm(`Delete publisher "${p.name}"? This cannot be undone.`)) return;
    await apiClient.delete(`/admin/publishers/${p.id}`);
    await load(pagination.page);
  }

  return (
    <div className="admin-theme">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-admin-dark">Publishers</h1>
        <button onClick={() => setModal({ mode: 'create' })} className="rounded-lg bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark">
          + New Publisher
        </button>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); load(1); }}
        className="mb-4 flex gap-2"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name/email/company..."
          className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">Search</button>
      </form>

      <div className="overflow-x-auto rounded-admin bg-white shadow-admin-card">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-[#f8fafc]">
            <tr>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Name</th>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Email</th>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Company</th>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Wallet</th>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Status</th>
              <th className="px-3 py-3 text-right font-semibold text-admin-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {publishers.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-3 font-medium text-gray-800">{p.name}</td>
                <td className="px-3 py-3 text-gray-600">{p.email}</td>
                <td className="px-3 py-3 text-gray-600">{p.companyName}</td>
                <td className="px-3 py-3">₹{p.walletBalance}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${p.status ? 'bg-admin-success' : 'bg-admin-gray'}`}>
                    {p.status ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <button onClick={() => setModal({ mode: 'edit', publisher: p })} className="mr-2 font-medium text-admin-primary">Edit</button>
                  <button onClick={() => setModal({ mode: 'balance', publisher: p })} className="mr-2 font-medium text-admin-success">Balance</button>
                  <button onClick={() => setModal({ mode: 'password', publisher: p })} className="mr-2 font-medium text-admin-gray">Reset PW</button>
                  <button onClick={() => handleDelete(p)} className="font-medium text-admin-danger">Delete</button>
                </td>
              </tr>
            ))}
            {!loading && publishers.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No publishers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-1">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => load(p)} className={`rounded-lg px-3 py-1 text-sm ${p === pagination.page ? 'bg-admin-primary text-white' : 'bg-gray-100 text-gray-700'}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {modal !== undefined && (
        <PublisherModal modal={modal} onClose={() => setModal(undefined)} onDone={() => { setModal(undefined); load(pagination.page); }} />
      )}
    </div>
  );
}

function PublisherModal({ modal, onClose, onDone }) {
  const { mode, publisher } = modal;
  const [form, setForm] = useState(
    publisher
      ? { name: publisher.name, email: publisher.email, companyName: publisher.companyName, contactNumber: publisher.contactNumber, status: !!publisher.status }
      : { name: '', email: '', password: '', companyName: '', contactNumber: '' }
  );
  const [balanceForm, setBalanceForm] = useState({ action: 'add', amount: '' });
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'create') {
        await apiClient.post('/admin/publishers', form);
      } else if (mode === 'edit') {
        await apiClient.put(`/admin/publishers/${publisher.id}`, form);
      } else if (mode === 'balance') {
        await apiClient.post(`/admin/publishers/${publisher.id}/adjust-balance`, { action: balanceForm.action, amount: Number(balanceForm.amount) });
      } else if (mode === 'password') {
        await apiClient.post(`/admin/publishers/${publisher.id}/reset-password`, { newPassword });
      }
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.details?.[0]?.msg || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  }

  const titles = { create: 'New Publisher', edit: 'Edit Publisher', balance: 'Adjust Wallet Balance', password: 'Reset Password' };

  return (
    <div className="admin-theme fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-admin bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-admin-dark">{titles[mode]}</h2>
        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-admin-danger">{error}</p>}

        {(mode === 'create' || mode === 'edit') && (
          <div className="space-y-3">
            <Input label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
            <Input label="Email" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
            {mode === 'create' && <Input label="Password" type="password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} />}
            <Input label="Company Name" value={form.companyName} onChange={(v) => setForm((f) => ({ ...f, companyName: v }))} />
            <Input label="Contact Number" value={form.contactNumber} onChange={(v) => setForm((f) => ({ ...f, contactNumber: v }))} />
            {mode === 'edit' && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked }))} />
                Active
              </label>
            )}
          </div>
        )}

        {mode === 'balance' && (
          <div className="space-y-3">
            <select value={balanceForm.action} onChange={(e) => setBalanceForm((f) => ({ ...f, action: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="add">Add to balance</option>
              <option value="set">Set balance to</option>
            </select>
            <Input label="Amount" type="number" value={balanceForm.amount} onChange={(v) => setBalanceForm((f) => ({ ...f, amount: v }))} />
          </div>
        )}

        {mode === 'password' && (
          <Input label="New Password" type="password" value={newPassword} onChange={setNewPassword} />
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">Cancel</button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark disabled:opacity-60">
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input type={type} required value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
    </div>
  );
}
