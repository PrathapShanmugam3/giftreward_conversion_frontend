import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

const today = () => new Date().toISOString().slice(0, 10);

export default function PublisherReports() {
  const [type, setType] = useState('daily');
  const [dateFrom, setDateFrom] = useState(today());
  const [dateTo, setDateTo] = useState(today());
  const [offerId, setOfferId] = useState('');
  const [status, setStatus] = useState('all');
  const [offers, setOffers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [detailed, setDetailed] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/publisher/offers').then(({ data }) => setOffers(data.offers));
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [summaryRes, detailedRes] = await Promise.all([
        apiClient.get('/publisher/reports/summary', { params: { type, dateFrom, dateTo, offerId: offerId || undefined, status } }),
        apiClient.get('/publisher/reports/detailed', { params: { dateFrom, dateTo, offerId: offerId || undefined, status, page, perPage: 10 } }),
      ]);
      setSummary(summaryRes.data);
      setDetailed(detailedRes.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, page]);

  function applyFilters(e) {
    e.preventDefault();
    setPage(1);
    load();
  }

  function exportUrl(format) {
    const params = new URLSearchParams({ format, dateFrom, dateTo });
    if (offerId) params.set('offerId', offerId);
    if (status !== 'all') params.set('status', status);
    return `/api/publisher/reports/export?${params.toString()}`;
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-800">Reports</h1>

      <div className="mb-4 flex gap-2">
        {['daily', 'monthly', 'custom'].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${
              type === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={applyFilters} className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <Field label="From">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
        </Field>
        <Field label="To">
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
        </Field>
        <Field label="Offer">
          <select value={offerId} onChange={(e) => setOfferId(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm">
            <option value="">All offers</option>
            {offers.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm">
            <option value="all">All</option>
            <option value="converted">Converted</option>
            <option value="not_converted">Not converted</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </Field>
        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          Apply
        </button>
        <div className="ml-auto flex gap-2">
          <a href={exportUrl('csv')} className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">CSV</a>
          <a href={exportUrl('excel')} className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">Excel</a>
          <a href={exportUrl('pdf')} className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">PDF</a>
        </div>
      </form>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      {!loading && summary && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <StatCard label="Clicks" value={summary.totals.clicks} />
          <StatCard label="Conversions" value={summary.totals.conversions} />
          <StatCard label="Revenue" value={`₹${Number(summary.totals.revenue).toFixed(2)}`} />
        </div>
      )}

      {!loading && detailed && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-500">Click ID</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">Offer ID</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">Click Time</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">Status</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {detailed.rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2 font-mono text-xs">{r.click_id}</td>
                  <td className="px-3 py-2">{r.offer_id}</td>
                  <td className="px-3 py-2 text-gray-500">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{r.conversion_status || '—'}</td>
                  <td className="px-3 py-2">{r.conversion_payout != null ? `₹${r.conversion_payout}` : '—'}</td>
                </tr>
              ))}
              {detailed.rows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No data found.</td></tr>
              )}
            </tbody>
          </table>
          {detailed.totalPages > 1 && (
            <div className="flex justify-center gap-1 border-t border-gray-100 py-3">
              {Array.from({ length: detailed.totalPages }, (_, i) => i + 1).slice(0, 10).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-md px-3 py-1 text-sm ${p === page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
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

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
}
