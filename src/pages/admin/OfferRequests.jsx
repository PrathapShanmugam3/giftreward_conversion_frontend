import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

const STATUS_BADGE = {
  requested: 'bg-admin-warning text-admin-dark',
  approved: 'bg-admin-success text-white',
  rejected: 'bg-admin-danger text-white',
};

export default function OfferRequests() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/offers/requests/list', { params: { status } });
      setRequests(data.requests);
      setStats(data.stats);
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function moderate(id, action) {
    await apiClient.post(`/admin/offers/requests/${id}/moderate`, { action });
    await load();
  }

  async function bulkModerate(action) {
    if (selected.size === 0) return;
    await apiClient.post('/admin/offers/requests/bulk-moderate', { action, requestIds: Array.from(selected) });
    await load();
  }

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="admin-theme">
      <h1 className="mb-4 text-xl font-bold text-admin-dark">Offer Requests</h1>

      <div className="mb-4 grid grid-cols-4 gap-3">
        <StatCard label="Total" value={stats.total} variant="primary" />
        <StatCard label="Pending" value={stats.pending} variant="warning" />
        <StatCard label="Approved" value={stats.approved} variant="success" />
        <StatCard label="Rejected" value={stats.rejected} variant="danger" />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'requested', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                status === s ? 'bg-admin-primary text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {selected.size > 0 && (
          <div className="flex gap-2">
            <button onClick={() => bulkModerate('approve_selected')} className="rounded-lg bg-admin-success px-3 py-1.5 text-sm text-white">
              Approve ({selected.size})
            </button>
            <button onClick={() => bulkModerate('reject_selected')} className="rounded-lg bg-admin-danger px-3 py-1.5 text-sm text-white">
              Reject ({selected.size})
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-admin bg-white shadow-admin-card">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-[#f8fafc]">
            <tr>
              <th className="px-3 py-3" />
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Publisher</th>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Offer</th>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Status</th>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Requested</th>
              <th className="px-3 py-3 text-right font-semibold text-admin-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((req) => (
              <tr key={req.id}>
                <td className="px-3 py-3">
                  <input type="checkbox" checked={selected.has(req.id)} onChange={() => toggle(req.id)} />
                </td>
                <td className="px-3 py-3">
                  <div className="font-medium text-gray-800">{req.User?.name}</div>
                  <div className="text-xs text-gray-500">{req.User?.email}</div>
                </td>
                <td className="px-3 py-3 text-gray-700">{req.Offer?.name}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[req.status]}`}>{req.status}</span>
                </td>
                <td className="px-3 py-3 text-gray-500">{new Date(req.requestedAt).toLocaleString()}</td>
                <td className="px-3 py-3 text-right">
                  {req.status === 'requested' && (
                    <>
                      <button onClick={() => moderate(req.id, 'approve')} className="mr-2 font-medium text-admin-success">
                        Approve
                      </button>
                      <button onClick={() => moderate(req.id, 'reject')} className="mr-2 font-medium text-admin-danger">
                        Reject
                      </button>
                    </>
                  )}
                  <button onClick={() => moderate(req.id, 'delete')} className="font-medium text-admin-gray">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
