import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import Loader from '../../components/Loader';

const monthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};
const today = () => new Date().toISOString().slice(0, 10);

// Per-active-offer clicks/conversions/payout in a date range — mirrors
// sadmin/campaign-stats.php (admin's network-wide view, distinct from the
// publisher's own campaign-stats page which reads campaign_clicks).
export default function AdminCampaignStats() {
  const [startDate, setStartDate] = useState(monthStart());
  const [endDate, setEndDate] = useState(today());
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/reports/campaign-stats', {
        params: { start_date: startDate, end_date: endDate },
      });
      setOffers(data.offers);
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

  return (
    <div className="admin-theme">
      <h1 className="mb-4 text-xl font-bold text-admin-dark">Campaign Stats (by Offer)</h1>

      <form onSubmit={applyFilters} className="mb-6 flex flex-wrap items-end gap-3 rounded-admin bg-white p-4 shadow-admin-card">
        <Field label="From">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
        </Field>
        <Field label="To">
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
        </Field>
        <button type="submit" className="rounded-lg bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark">
          Apply
        </button>
      </form>

      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto rounded-admin bg-white shadow-admin-card">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="px-3 py-3 text-left font-semibold text-admin-dark">Offer</th>
                <th className="px-3 py-3 text-left font-semibold text-admin-dark">Clicks</th>
                <th className="px-3 py-3 text-left font-semibold text-admin-dark">Conversions</th>
                <th className="px-3 py-3 text-left font-semibold text-admin-dark">Payout</th>
                <th className="px-3 py-3 text-left font-semibold text-admin-dark">Conv. Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offers.map((o) => (
                <tr key={o.id}>
                  <td className="px-3 py-3 font-medium text-gray-800">{o.name}</td>
                  <td className="px-3 py-3">{o.clicks}</td>
                  <td className="px-3 py-3">{o.conversions}</td>
                  <td className="px-3 py-3">₹{o.payout}</td>
                  <td className="px-3 py-3">{o.clicks > 0 ? ((o.conversions / o.clicks) * 100).toFixed(2) : '0.00'}%</td>
                </tr>
              ))}
              {offers.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No active offers found.</td></tr>
              )}
            </tbody>
          </table>
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
