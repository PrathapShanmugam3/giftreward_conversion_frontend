import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

// NOTE: despite the name, status=1 here means the IP is BLOCKED from
// calling /postback (see ipWhitelist.service.js and postback.service.js) —
// reproduced exactly from the legacy app's (confusing) naming.
export default function AdminIpWhitelist() {
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [form, setForm] = useState({ input: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load(page = 1) {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/ip-whitelist', { params: { search: search || undefined, page } });
      setEntries(data.entries || data.rows || []);
      setPagination(data.pagination || { page: 1, totalPages: 1 });
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/admin/ip-whitelist', form);
      setForm({ input: '', description: '' });
      await load(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add');
    }
  }

  async function toggle(id) {
    await apiClient.post(`/admin/ip-whitelist/${id}/toggle`);
    await load(pagination.page);
  }

  async function remove(id) {
    if (!confirm('Delete this entry?')) return;
    await apiClient.delete(`/admin/ip-whitelist/${id}`);
    await load(pagination.page);
  }

  async function bulk(action) {
    if (selected.size === 0) return;
    await apiClient.post('/admin/ip-whitelist/bulk', { action, ids: Array.from(selected) });
    await load(pagination.page);
  }

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="admin-theme">
      <h1 className="mb-4 text-xl font-bold text-admin-dark">IP Whitelist</h1>
      <p className="mb-4 rounded-md bg-[#f8961e1a] px-3 py-2 text-xs text-[#9a5b0f]">
        Note: "Blocked" below means postbacks from that IP are rejected — matches the legacy app's naming.
      </p>

      <form onSubmit={handleAdd} className="mb-4 flex flex-wrap gap-2 rounded-admin bg-white p-4 shadow-admin-card">
        {error && <p className="w-full rounded-md bg-red-50 px-3 py-2 text-sm text-admin-danger">{error}</p>}
        <input
          placeholder="IP address or URL"
          value={form.input}
          onChange={(e) => setForm((f) => ({ ...f, input: e.target.value }))}
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark">Add</button>
      </form>

      <div className="mb-4 flex items-center justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(1)}
          placeholder="Search IP/description..."
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {selected.size > 0 && (
          <div className="flex gap-2">
            <button onClick={() => bulk('activate')} className="rounded-lg bg-admin-dark px-3 py-1.5 text-sm text-white">Block ({selected.size})</button>
            <button onClick={() => bulk('deactivate')} className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm text-gray-800">Unblock</button>
            <button onClick={() => bulk('delete')} className="rounded-lg bg-admin-danger px-3 py-1.5 text-sm text-white">Delete</button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-admin bg-white shadow-admin-card">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-[#f8fafc]">
            <tr>
              <th className="px-3 py-3" />
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">IP</th>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Description</th>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Status</th>
              <th className="px-3 py-3 text-right font-semibold text-admin-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="px-3 py-3"><input type="checkbox" checked={selected.has(e.id)} onChange={() => toggleSelect(e.id)} /></td>
                <td className="px-3 py-3 font-mono text-xs">{e.ip}</td>
                <td className="px-3 py-3 text-gray-600">{e.description}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${e.status ? 'bg-admin-danger' : 'bg-admin-success'}`}>
                    {e.status ? 'Blocked' : 'Allowed'}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <button onClick={() => toggle(e.id)} className="mr-2 font-medium text-admin-primary">Toggle</button>
                  <button onClick={() => remove(e.id)} className="font-medium text-admin-danger">Delete</button>
                </td>
              </tr>
            ))}
            {!loading && entries.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No entries found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
