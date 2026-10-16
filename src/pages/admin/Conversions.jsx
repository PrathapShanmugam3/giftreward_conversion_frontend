import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

const STATUS_BADGE = {
  pending: 'bg-admin-warning text-admin-dark',
  approved: 'bg-admin-success text-white',
  rejected: 'bg-admin-danger text-white',
};

export default function AdminConversions() {
  const [conversions, setConversions] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const { data } = await apiClient.get('/admin/conversions', { params: { status: status || undefined } });
    setConversions(data.conversions);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function updateStatus(id, newStatus) {
    setError('');
    try {
      await apiClient.post(`/admin/conversions/${id}/status`, { status: newStatus });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  }

  return (
    <div className="admin-theme">
      <h1 className="mb-4 text-xl font-bold text-admin-dark">Conversions</h1>
      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-admin-danger">{error}</p>}

      <div className="mb-4 flex gap-2">
        {['', 'pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              status === s ? 'bg-admin-primary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
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
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Payout</th>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Status</th>
              <th className="px-3 py-3 text-left font-semibold text-admin-dark">Date</th>
              <th className="px-3 py-3 text-right font-semibold text-admin-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {conversions.map((c) => (
              <tr key={c.id}>
                <td className="px-3 py-3">{c.User?.name}</td>
                <td className="px-3 py-3">{c.Offer?.name}</td>
                <td className="px-3 py-3">{c.OfferEvent?.eventName}</td>
                <td className="px-3 py-3 font-medium">₹{c.payout}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[c.status]}`}>{c.status}</span>
                </td>
                <td className="px-3 py-3 text-gray-500">{new Date(c.createdAt).toLocaleString()}</td>
                <td className="px-3 py-3 text-right">
                  {c.status !== 'approved' && (
                    <button onClick={() => updateStatus(c.id, 'approved')} className="mr-2 font-medium text-admin-success">
                      Approve
                    </button>
                  )}
                  {c.status !== 'rejected' && (
                    <button onClick={() => updateStatus(c.id, 'rejected')} className="font-medium text-admin-danger">
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {conversions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No conversions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
