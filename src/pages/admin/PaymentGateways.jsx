import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

export default function PaymentGateways() {
  const [gateways, setGateways] = useState([]);
  const [stats, setStats] = useState(null);
  const [modal, setModal] = useState(undefined);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/gateways');
      setGateways(data.gateways);
      setStats(data.stats);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(payload) {
    if (modal.gateway) {
      await apiClient.put(`/admin/gateways/${modal.gateway.id}`, payload);
    } else {
      await apiClient.post('/admin/gateways', payload);
    }
    setModal(undefined);
    await load();
  }

  async function handleDelete(g) {
    if (!confirm(`Delete gateway "${g.name}"?`)) return;
    await apiClient.delete(`/admin/gateways/${g.id}`);
    await load();
  }

  return (
    <div className="admin-theme">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-admin-dark">Payment Gateways</h1>
        <button onClick={() => setModal({ gateway: null })} className="rounded-lg bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark">
          + New Gateway
        </button>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-4 gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Active" value={stats.active} variant="success" />
          <StatCard label="API Type" value={stats.apiType} variant="warning" />
          <StatCard label="Manual Type" value={stats.manualType} />
        </div>
      )}

      <div className="overflow-x-auto rounded-admin bg-white shadow-admin-card">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-[#f8fafc]">
            <tr>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Name</th>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Type</th>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Status</th>
              <th className="px-3 py-3 text-right font-semibold text-admin-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {gateways.map((g) => (
              <tr key={g.id}>
                <td className="px-3 py-3 font-medium text-gray-800">{g.name}</td>
                <td className="px-3 py-3 uppercase text-gray-600">{g.type}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    g.status === 'active'
                      ? 'bg-admin-success text-white'
                      : g.status === 'testing'
                        ? 'bg-admin-warning text-admin-dark' // dark text for contrast on the orange warning bg, matches admin.css's .badge-warning
                        : 'bg-admin-gray text-white'
                  }`}>
                    {g.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <button onClick={() => setModal({ gateway: g })} className="mr-3 font-medium text-admin-primary">Edit</button>
                  <button onClick={() => handleDelete(g)} className="font-medium text-admin-danger">Delete</button>
                </td>
              </tr>
            ))}
            {!loading && gateways.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No gateways found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal !== undefined && <GatewayModal gateway={modal.gateway} onClose={() => setModal(undefined)} onSubmit={handleSubmit} />}
    </div>
  );
}

function GatewayModal({ gateway, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: gateway?.name || '',
    type: gateway?.type || 'manual',
    status: gateway?.status || 'testing',
    config: { apiEndpoint: gateway?.GatewayConfig?.apiEndpoint || '', apiMethod: gateway?.GatewayConfig?.apiMethod || 'POST' },
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { name: form.name, type: form.type, status: form.status };
      if (form.type === 'api') payload.config = form.config;
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.details?.[0]?.msg || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-theme fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-admin bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-admin-dark">{gateway ? 'Edit Gateway' : 'New Gateway'}</h2>
        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-admin-danger">{error}</p>}
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="manual">Manual</option>
              <option value="api">API</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="testing">Testing</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {form.type === 'api' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">API Endpoint</label>
              <input value={form.config.apiEndpoint} onChange={(e) => setForm((f) => ({ ...f, config: { ...f.config, apiEndpoint: e.target.value } }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
          )}
        </div>
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

const STAT_BORDER = {
  primary: 'border-l-admin-primary bg-admin-primary/10',
  success: 'border-l-admin-success bg-admin-success/10',
  warning: 'border-l-admin-warning bg-admin-warning/10',
  danger: 'border-l-admin-danger bg-admin-danger/10',
};

function StatCard({ label, value, variant = 'primary' }) {
  return (
    <div className={`rounded-admin border-l-4 bg-white p-4 shadow-admin-card ${STAT_BORDER[variant]}`}>
      <div className="text-xs text-admin-gray">{label}</div>
      <div className="mt-1 text-2xl font-bold text-admin-dark">{value}</div>
    </div>
  );
}
