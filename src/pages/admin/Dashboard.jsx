import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  IndianRupee,
  MegaphoneIcon,
  MousePointerClick,
  Users,
} from 'lucide-react';
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

  const chartData = data.revenueData.map((r) => ({
    month: formatMonth(r.month),
    revenue: Number(r.revenue) || 0,
    cr: Number(r.cr) || 0,
  }));

  return (
    <div className="admin-theme">
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold text-admin-dark">Dashboard Overview</h1>
        <Link
          to="/admin/offers"
          className="inline-flex w-fit items-center gap-1.5 rounded-admin bg-admin-primary px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-admin-primary-dark"
        >
          New Offer
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Publishers"
          value={data.usersCount.toLocaleString()}
          icon={Users}
          color="#4361ee"
          linkTo="/admin/publishers"
          linkLabel="View Publishers"
        />
        <StatCard
          label="Active Offers"
          value={data.offersCount.toLocaleString()}
          icon={MegaphoneIcon}
          color="#2e7d32"
          gradient="linear-gradient(135deg, #28a745, #00c853)"
          linkTo="/admin/offers"
          linkLabel="Manage Offers"
        />
        <StatCard
          label="Today's Clicks"
          value={data.todayClicks.toLocaleString()}
          sub={`Total: ${data.clicksCount.toLocaleString()}`}
          icon={MousePointerClick}
          color="#0072ff"
          gradient="linear-gradient(135deg, #00c6ff, #0072ff)"
          linkTo="/admin/conversions"
          linkLabel="View Analytics"
        />
        <StatCard
          label="Today's Conversions"
          value={data.todayConversions.toLocaleString()}
          sub={`Total: ${data.conversionsCount.toLocaleString()}`}
          icon={CheckCircle2}
          color="#FF8F00"
          gradient="linear-gradient(135deg, #FFD600, #FF8F00)"
          progress={data.todayConversionRate}
          progressLabel={`Today's CR: ${data.todayConversionRate.toFixed(2)}%`}
        />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-admin bg-white p-4 shadow-admin-card">
          <h2 className="mb-3 text-sm font-semibold text-admin-dark">Performance Overview (Last 6 Months)</h2>
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-admin-gray">No revenue data yet.</p>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e9ecef" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6c757d' }} axisLine={false} tickLine={false} />
                  <YAxis
                    yAxisId="revenue"
                    tick={{ fontSize: 12, fill: '#6c757d' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <YAxis
                    yAxisId="cr"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: '#6c757d' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value, name) =>
                      name === 'Revenue' ? [`₹${Number(value).toFixed(2)}`, name] : [`${Number(value).toFixed(2)}%`, name]
                    }
                  />
                  <Bar yAxisId="revenue" dataKey="revenue" name="Revenue" fill="#4361ee" radius={[4, 4, 0, 0]} />
                  <Line
                    yAxisId="cr"
                    type="monotone"
                    dataKey="cr"
                    name="Conv. Rate"
                    stroke="#4cc9f0"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-admin bg-[#f9f9ff] p-4 shadow-admin-card">
          <h2 className="mb-4 text-sm font-semibold text-admin-dark">Revenue Summary</h2>
          <SummaryRow
            icon={IndianRupee}
            color="#1976d2"
            label="Total Revenue"
            value={`₹${data.revenue.toFixed(2)}`}
          />
          <SummaryRow
            icon={CheckCircle2}
            color="#2e7d32"
            label="Approved Conversions"
            value={data.conversionsCount.toLocaleString()}
          />
          <SummaryRow
            icon={Clock}
            color="#f9a825"
            label="Pending Withdrawals"
            value={data.pendingWithdrawals.toLocaleString()}
          />
          <Link
            to="/admin/withdrawals"
            className="mt-2 flex items-center justify-center gap-1.5 rounded-admin border border-admin-primary px-3 py-2 text-sm font-semibold text-admin-primary transition hover:bg-admin-primary hover:text-white"
          >
            <Banknote className="h-4 w-4" />
            Manage Withdrawals
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-admin bg-white shadow-admin-card">
          <div className="flex items-center justify-between border-b border-admin-gray-light px-4 py-3">
            <h2 className="text-sm font-semibold text-admin-dark">Recent Conversions</h2>
            <Link to="/admin/conversions" className="text-xs font-semibold text-admin-primary hover:underline">
              View All
            </Link>
          </div>
          {data.recentConversions.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-admin-gray">No conversions yet.</p>
          ) : (
            <table className="min-w-full text-sm">
              <tbody className="divide-y divide-admin-gray-light">
                {data.recentConversions.map((c) => (
                  <tr key={c.id} className="transition hover:bg-admin-light">
                    <td className="py-2.5 pl-4 pr-2">
                      <div className="flex items-center gap-2">
                        <Avatar name={c.publisher} />
                        <span className="text-admin-dark">{c.publisher}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-2 text-admin-gray">{c.offer}</td>
                    <td className="py-2.5 pr-4 text-right font-semibold text-admin-success">
                      ₹{Number(c.payout).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-admin bg-white shadow-admin-card">
          <div className="flex items-center justify-between border-b border-admin-gray-light px-4 py-3">
            <h2 className="text-sm font-semibold text-admin-dark">Top Performing Offers</h2>
            <Link to="/admin/offers" className="text-xs font-semibold text-admin-primary hover:underline">
              View All
            </Link>
          </div>
          {data.topOffers.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-admin-gray">No data yet.</p>
          ) : (
            <table className="min-w-full text-sm">
              <tbody className="divide-y divide-admin-gray-light">
                {data.topOffers.map((o) => (
                  <tr key={o.id} className="transition hover:bg-admin-light">
                    <td className="py-2.5 pl-4 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-admin-success/10">
                          <MegaphoneIcon className="h-4 w-4 text-admin-success" />
                        </span>
                        <div>
                          <div className="text-admin-dark">{o.name}</div>
                          <div className="text-xs text-admin-gray">{o.conversions} conversions</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 pr-2 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${
                          Number(o.cr) > 5 ? 'bg-admin-success' : 'bg-admin-warning'
                        }`}
                      >
                        {Number(o.cr || 0).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right font-semibold text-admin-success">
                      ₹{Number(o.revenue).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function formatMonth(ym) {
  const [year, month] = ym.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function StatCard({ label, value, sub, icon: Icon, color, gradient, linkTo, linkLabel, progress, progressLabel }) {
  return (
    <div
      className="group rounded-admin bg-white p-4 shadow-admin-card transition hover:-translate-y-1 hover:shadow-admin-card-hover"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-admin-gray">{label}</div>
          <div className="mt-1 text-2xl font-bold" style={{ color }}>
            {value}
          </div>
          {sub && <div className="mt-0.5 text-xs text-admin-gray">{sub}</div>}
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
          style={{ background: gradient || color }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>

      {typeof progress === 'number' ? (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-admin-gray-light">
            <div
              className="h-full rounded-full bg-admin-warning"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-admin-gray">{progressLabel}</div>
        </div>
      ) : (
        linkTo && (
          <Link
            to={linkTo}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
            style={{ color }}
          >
            {linkLabel}
            <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
          </Link>
        )
      )}
    </div>
  );
}

function SummaryRow({ icon: Icon, color, label, value }) {
  return (
    <div className="mb-4 flex items-center gap-3 last:mb-0">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: color }}
      >
        <Icon className="h-5 w-5 text-white" />
      </span>
      <div>
        <div className="text-xs text-admin-gray">{label}</div>
        <div className="text-lg font-bold text-admin-dark">{value}</div>
      </div>
    </div>
  );
}

function Avatar({ name }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const hue = hashToHue(name);
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
      style={{ backgroundColor: `hsl(${hue}, 60%, 45%)` }}
    >
      {initials || '?'}
    </span>
  );
}

function hashToHue(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}
