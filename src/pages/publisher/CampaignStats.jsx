import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';

export default function CampaignStats() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiClient.get(`/publisher/campaigns/${id}/stats`).then(({ data }) => setStats(data));
  }, [id]);

  if (!stats) return <p className="text-sm text-gray-500">Loading...</p>;

  const { campaign, totals, recentConversions } = stats;

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-gray-800">{campaign.Offer?.name}</h1>
      <p className="mb-4 text-sm text-gray-500">Campaign stats</p>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total Clicks" value={totals.totalClicks} />
        <StatCard label="Unique Clicks" value={totals.uniqueClicks} />
        <StatCard label="Conversions" value={totals.totalConversions} />
        <StatCard label="Payout" value={`₹${Number(totals.totalPayout).toFixed(2)}`} />
        <StatCard label="Referrals" value={totals.totalReferrals} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Recent Conversions</h2>
        {recentConversions.length === 0 ? (
          <p className="text-sm text-gray-500">No conversions yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-500">UPI</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">Amount</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentConversions.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-2">{c.upi}</td>
                  <td className="px-3 py-2">₹{c.amount}</td>
                  <td className="px-3 py-2 text-gray-500">{new Date(c.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-gray-800">{value}</div>
    </div>
  );
}
