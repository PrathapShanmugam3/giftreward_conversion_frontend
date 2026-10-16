import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import Loader from '../../components/Loader';

// Mirrors sadmin/index.php: network totals, today's figures, 6-month trend,
// recent conversions, top offers by revenue.
export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiClient.get('/admin/dashboard').then(({ data: res }) => setData(res));
  }, []);

  if (!data) return <Loader />;

  return (
    <div className="admin-theme">
      <h1 className="mb-4 text-xl font-bold text-admin-dark">Admin Dashboard</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        <StatCard label="Publishers" value={data.usersCount} />
        <StatCard label="Active Offers" value={data.offersCount} />
        <StatCard label="Total Clicks" value={data.clicksCount} />
        <StatCard label="Conversions" value={data.conversionsCount} />
        <StatCard label="Revenue" value={`₹${data.revenue.toFixed(2)}`} accent="success" />
        <StatCard label="Pending Withdrawals" value={data.pendingWithdrawals} accent="warning" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Today's Clicks" value={data.todayClicks} />
        <StatCard label="Today's Conversions" value={data.todayConversions} />
        <StatCard label="Conv. Rate" value={`${data.conversionRate}%`} />
        <StatCard label="Today's Conv. Rate" value={`${data.todayConversionRate}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-admin bg-white p-4 shadow-admin-card">
          <h2 className="mb-3 text-sm font-semibold text-admin-dark">Recent Conversions</h2>
          {data.recentConversions.length === 0 ? (
            <p className="text-sm text-gray-500">No conversions yet.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <tbody className="divide-y divide-gray-100">
                {data.recentConversions.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2 pr-2 text-gray-700">{c.publisher}</td>
                    <td className="py-2 pr-2 text-gray-500">{c.offer}</td>
                    <td className="py-2 text-right font-medium text-admin-success">₹{c.payout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-admin bg-white p-4 shadow-admin-card">
          <h2 className="mb-3 text-sm font-semibold text-admin-dark">Top Offers by Revenue</h2>
          {data.topOffers.length === 0 ? (
            <p className="text-sm text-gray-500">No data yet.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <tbody className="divide-y divide-gray-100">
                {data.topOffers.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2 pr-2 text-gray-700">{o.name}</td>
                    <td className="py-2 pr-2 text-gray-500">{o.conversions} conv.</td>
                    <td className="py-2 text-right font-medium text-admin-success">₹{o.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {data.revenueData.length > 0 && (
        <div className="mt-6 rounded-admin bg-white p-4 shadow-admin-card">
          <h2 className="mb-3 text-sm font-semibold text-admin-dark">Revenue (Last 6 Months)</h2>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-2 py-2 text-left font-medium text-gray-500">Month</th>
                <th className="px-2 py-2 text-left font-medium text-gray-500">Clicks</th>
                <th className="px-2 py-2 text-left font-medium text-gray-500">Conversions</th>
                <th className="px-2 py-2 text-left font-medium text-gray-500">Conv. Rate</th>
                <th className="px-2 py-2 text-left font-medium text-gray-500">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.revenueData.map((r) => (
                <tr key={r.month}>
                  <td className="px-2 py-2">{r.month}</td>
                  <td className="px-2 py-2">{r.clicks}</td>
                  <td className="px-2 py-2">{r.conversions}</td>
                  <td className="px-2 py-2">{Number(r.cr || 0).toFixed(2)}%</td>
                  <td className="px-2 py-2 font-medium text-admin-success">₹{r.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  const borderColor = accent === 'success' ? 'border-l-admin-success' : accent === 'warning' ? 'border-l-admin-warning' : 'border-l-admin-primary';
  return (
    <div className={`rounded-admin border-l-4 bg-white p-4 shadow-admin-card ${borderColor}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-admin-dark">{value}</div>
    </div>
  );
}
