import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import Loader from '../../components/Loader';

const PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: 'month', label: 'This Month' },
];

// Mirrors publisher/index.php: period-switchable stats, lifetime totals,
// recent conversions, active offers to promote.
export default function PublisherDashboard() {
  const [period, setPeriod] = useState('7days');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient.get('/publisher/dashboard', { params: { period } }).then(({ data: res }) => {
      setData(res);
      setLoading(false);
    });
  }, [period]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {loading || !data ? (
        <Loader />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Clicks" value={data.stats.clicks} />
            <StatCard label="Conversions" value={data.stats.conversions} />
            <StatCard label="Pending" value={data.stats.pending} />
            <StatCard label="Revenue" value={`₹${data.stats.revenue.toFixed(2)}`} accent />
          </div>

          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">Lifetime Totals</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <LifetimeStat label="Total Clicks" value={data.lifetime.clicks} />
              <LifetimeStat label="Approved Conversions" value={data.lifetime.conversions} />
              <LifetimeStat label="Pending" value={data.lifetime.pending} />
              <LifetimeStat label="Total Earnings" value={`₹${data.lifetime.revenue.toFixed(2)}`} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-700">Recent Conversions</h2>
              {data.recentConversions.length === 0 ? (
                <p className="text-sm text-gray-500">No conversions yet.</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {data.recentConversions.map((c) => (
                      <tr key={c.id}>
                        <td className="py-2 pr-2 text-gray-700">{c.offer}</td>
                        <td className="py-2 pr-2 text-gray-500">{c.event_name}</td>
                        <td className="py-2 text-right font-medium text-green-600">₹{c.payout}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-700">Active Offers</h2>
              <div className="space-y-2">
                {data.activeOffers.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <span className="text-sm font-medium text-gray-800">{o.name}</span>
                    <Link to="/publisher/offers" className="text-xs font-medium text-blue-600">View</Link>
                  </div>
                ))}
                {data.activeOffers.length === 0 && <p className="text-sm text-gray-500">No active offers.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accent ? 'text-blue-600' : 'text-gray-800'}`}>{value}</div>
    </div>
  );
}

function LifetimeStat({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-gray-800">{value}</div>
    </div>
  );
}
