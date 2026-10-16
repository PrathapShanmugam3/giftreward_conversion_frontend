import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function PublisherConversions() {
  const [conversions, setConversions] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/publisher/conversions', { params: { status: status || undefined } });
      setConversions(data.conversions);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-800">Conversions</h1>

      <div className="mb-4 flex gap-2">
        {['', 'pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Offer</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Event</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Click Time</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Status</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {conversions.map((c) => (
              <tr key={c.id}>
                <td className="px-3 py-2 font-medium text-gray-800">{c.offer_name}</td>
                <td className="px-3 py-2">{c.event_name}</td>
                <td className="px-3 py-2 text-gray-500">{new Date(c.click_time).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[c.status]}`}>{c.status}</span>
                </td>
                <td className="px-3 py-2 font-medium">₹{c.payout}</td>
              </tr>
            ))}
            {!loading && conversions.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No conversions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
