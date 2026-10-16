import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import Loader from '../../components/Loader';

const monthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};
const today = () => new Date().toISOString().slice(0, 10);

export default function AdminReports() {
  const [startDate, setStartDate] = useState(monthStart());
  const [endDate, setEndDate] = useState(today());
  const [publisherId, setPublisherId] = useState('');
  const [offerId, setOfferId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data: res } = await apiClient.get('/admin/reports', {
        params: {
          start_date: startDate,
          end_date: endDate,
          publisher_id: publisherId || undefined,
          offer_id: offerId || undefined,
          status_filter: statusFilter || undefined,
        },
      });
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyFilters(e) {
    e.preventDefault();
    load();
  }

  function exportUrl(format) {
    const params = new URLSearchParams({ format, start_date: startDate, end_date: endDate });
    if (publisherId) params.set('publisher_id', publisherId);
    if (offerId) params.set('offer_id', offerId);
    if (statusFilter) params.set('status_filter', statusFilter);
    return `/api/admin/reports/export?${params.toString()}`;
  }

  return (
    <div className="admin-theme">
      <h1 className="mb-4 text-xl font-bold text-admin-dark">Network Reports</h1>

      <form onSubmit={applyFilters} className="mb-6 flex flex-wrap items-end gap-3 rounded-admin bg-white p-4 shadow-admin-card">
        <Field label="From">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
        </Field>
        <Field label="To">
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
        </Field>
        <Field label="Publisher ID">
          <input type="number" value={publisherId} onChange={(e) => setPublisherId(e.target.value)} placeholder="All" className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
        </Field>
        <Field label="Offer ID">
          <input type="number" value={offerId} onChange={(e) => setOfferId(e.target.value)} placeholder="All" className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
        </Field>
        <Field label="Status">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm">
            <option value="">All</option>
            <option value="converted">Converted</option>
            <option value="not_converted">Not converted</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </Field>
        <button type="submit" className="rounded-lg bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark">
          Apply
        </button>
        <div className="ml-auto flex gap-2">
          <a href={exportUrl('csv')} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">CSV</a>
          <a href={exportUrl('excel')} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">Excel</a>
        </div>
      </form>

      {loading && <Loader />}

      {!loading && data && (
        <>
          <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
            <StatCard label="Clicks" value={data.stats.totalClicks} />
            <StatCard label="Conversions" value={data.stats.totalConversions} />
            <StatCard label="Approved" value={data.stats.approvedConversions} variant="success" />
            <StatCard label="Payout" value={`₹${data.stats.totalPayout.toFixed(2)}`} variant="warning" />
            <StatCard label="Publishers" value={data.stats.uniquePublishers} />
            <StatCard label="Conv. Rate" value={`${data.stats.conversionRate}%`} />
          </div>

          <div className="overflow-x-auto rounded-admin bg-white shadow-admin-card">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold text-admin-dark">Click ID</th>
                  <th className="px-3 py-3 text-left font-semibold text-admin-dark">Publisher</th>
                  <th className="px-3 py-3 text-left font-semibold text-admin-dark">Offer</th>
                  <th className="px-3 py-3 text-left font-semibold text-admin-dark">Click Time</th>
                  <th className="px-3 py-3 text-left font-semibold text-admin-dark">Status</th>
                  <th className="px-3 py-3 text-left font-semibold text-admin-dark">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.clicks.slice(0, 100).map((c) => (
                  <tr key={c.click_id}>
                    <td className="px-3 py-3 font-mono text-xs">{c.tracking_id}</td>
                    <td className="px-3 py-3">{c.publisher_name}</td>
                    <td className="px-3 py-3">{c.offer_name}</td>
                    <td className="px-3 py-3 text-gray-500">{new Date(c.click_time).toLocaleString()}</td>
                    <td className="px-3 py-3">{c.conversion_status || 'Not converted'}</td>
                    <td className="px-3 py-3">{c.payout != null ? `₹${c.payout}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-gray-100 px-3 py-2 text-xs text-gray-400">
              Showing {Math.min(100, data.clicks.length)} of {data.clicks.length} rows (capped at 500). Export for the full set.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
      {children}
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
    <div className={`rounded-admin border-l-4 bg-white p-3 shadow-admin-card ${STAT_BORDER[variant]}`}>
      <div className="text-xs text-admin-gray">{label}</div>
      <div className="mt-1 text-lg font-bold text-admin-dark">{value}</div>
    </div>
  );
}
