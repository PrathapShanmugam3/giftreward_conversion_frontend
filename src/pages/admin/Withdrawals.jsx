import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

const STATUS_BADGE = {
  pending: 'bg-admin-warning text-admin-dark',
  approved: 'bg-admin-success text-white',
  rejected: 'bg-admin-danger text-white',
};

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [status, setStatus] = useState('pending');
  const [notesDraft, setNotesDraft] = useState({});
  const [error, setError] = useState('');

  async function load() {
    const { data } = await apiClient.get('/admin/withdrawals', { params: { status } });
    setWithdrawals(data.withdrawals);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function updateStatus(id, newStatus) {
    setError('');
    try {
      await apiClient.post(`/admin/withdrawals/${id}/status`, { status: newStatus, notes: notesDraft[id] || '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  }

  return (
    <div className="admin-theme">
      <h1 className="mb-4 text-xl font-bold text-admin-dark">Withdrawal Requests</h1>
      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-admin-danger">{error}</p>}

      <div className="mb-4 flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((s) => (
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

      <div className="overflow-x-auto rounded-admin bg-white shadow-admin-card">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-[#f8fafc]">
            <tr>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Publisher</th>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Amount</th>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Method / Details</th>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Status</th>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Notes</th>
              <th className="px-3 py-3 text-right font-semibold text-admin-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {withdrawals.map((w) => (
              <tr key={w.id}>
                <td className="px-3 py-3">
                  <div className="font-medium text-gray-800">{w.User?.name}</div>
                  <div className="text-xs text-gray-500">{w.User?.email}</div>
                </td>
                <td className="px-3 py-3 font-medium">₹{w.amount}</td>
                <td className="px-3 py-3 text-gray-600">
                  {w.method} — {w.details}
                </td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[w.status]}`}>{w.status}</span>
                </td>
                <td className="px-3 py-3">
                  {w.status === 'pending' ? (
                    <input
                      placeholder="Notes (optional)"
                      value={notesDraft[w.id] || ''}
                      onChange={(e) => setNotesDraft((d) => ({ ...d, [w.id]: e.target.value }))}
                      className="w-32 rounded-md border border-gray-300 px-2 py-1 text-xs"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">{w.notes}</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right">
                  {w.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(w.id, 'approved')} className="mr-2 font-medium text-admin-success">
                        Approve
                      </button>
                      <button onClick={() => updateStatus(w.id, 'rejected')} className="font-medium text-admin-danger">
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {withdrawals.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No withdrawal requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
