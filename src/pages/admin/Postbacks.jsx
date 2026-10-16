import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

const STATUS_BADGE = {
  pending: 'bg-admin-warning text-admin-dark',
  approved: 'bg-admin-success text-white',
  rejected: 'bg-admin-danger text-white',
};

export default function AdminPostbacks() {
  const [tab, setTab] = useState('approval'); // approval | log
  const [postbacks, setPostbacks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadApproval() {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/postbacks', { params: { status: status || undefined } });
      setPostbacks(data.postbacks);
    } finally {
      setLoading(false);
    }
  }

  async function loadLogs() {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/postbacks-log', { params: { limit: 100 } });
      setLogs(data.logs);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tab === 'approval') loadApproval();
    else loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, status]);

  async function moderate(id, action) {
    await apiClient.post(`/admin/postbacks/${id}/moderate`, { action });
    await loadApproval();
  }

  return (
    <div className="admin-theme">
      <h1 className="mb-4 text-xl font-bold text-admin-dark">Postbacks</h1>

      <div className="mb-4 flex gap-2">
        <button onClick={() => setTab('approval')} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === 'approval' ? 'bg-admin-primary text-white' : 'bg-gray-100 text-gray-700'}`}>
          Approval Queue
        </button>
        <button onClick={() => setTab('log')} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === 'log' ? 'bg-admin-primary text-white' : 'bg-gray-100 text-gray-700'}`}>
          Recent Log
        </button>
      </div>

      {tab === 'approval' && (
        <>
          <div className="mb-4 flex gap-2">
            {['', 'pending', 'approved', 'rejected'].map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${status === s ? 'bg-admin-primary text-white' : 'bg-gray-100 text-gray-700'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto rounded-admin bg-white shadow-admin-card">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold text-admin-dark">Publisher</th>
                  <th className="px-3 py-3 text-left font-semibold text-admin-dark">Offer</th>
                  <th className="px-3 py-3 text-left font-semibold text-admin-dark">Event</th>
                  <th className="px-3 py-3 text-left font-semibold text-admin-dark">URL</th>
                  <th className="px-3 py-3 text-left font-semibold text-admin-dark">Status</th>
                  <th className="px-3 py-3 text-right font-semibold text-admin-dark">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {postbacks.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-3">{p.User?.name}</td>
                    <td className="px-3 py-3">{p.Offer?.name}</td>
                    <td className="px-3 py-3">{p.event}</td>
                    <td className="max-w-xs truncate px-3 py-3 font-mono text-xs" title={p.postbackUrl}>{p.postbackUrl}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {p.status !== 'approved' && <button onClick={() => moderate(p.id, 'approve')} className="mr-2 font-medium text-admin-success">Approve</button>}
                      {p.status !== 'rejected' && <button onClick={() => moderate(p.id, 'reject')} className="mr-2 font-medium text-admin-danger">Reject</button>}
                      <button onClick={() => moderate(p.id, 'delete')} className="font-medium text-admin-gray">Delete</button>
                    </td>
                  </tr>
                ))}
                {!loading && postbacks.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No postbacks found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'log' && (
        <div className="overflow-x-auto rounded-admin bg-white shadow-admin-card">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="px-3 py-3 text-left font-semibold text-admin-dark">Conversion</th>
                <th className="px-3 py-3 text-left font-semibold text-admin-dark">Publisher / Offer</th>
                <th className="px-3 py-3 text-left font-semibold text-admin-dark">Sent to User</th>
                <th className="px-3 py-3 text-left font-semibold text-admin-dark">HTTP Code</th>
                <th className="px-3 py-3 text-left font-semibold text-admin-dark">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="px-3 py-3">{l.Conversion ? `#${l.Conversion.id}` : <span className="text-gray-400">deleted</span>}</td>
                  <td className="px-3 py-3">
                    {l.Conversion?.User?.name || '—'} / {l.Conversion?.Offer?.name || '—'}
                  </td>
                  <td className="px-3 py-3">{l.sentToUser ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-3">{l.httpCode}</td>
                  <td className="px-3 py-3 text-gray-500">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No log entries found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
