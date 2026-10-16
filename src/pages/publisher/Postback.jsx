import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function PublisherPostback() {
  const [postbacks, setPostbacks] = useState([]);
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState({ offerId: '', event: '', postbackUrl: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const [pbRes, offersRes] = await Promise.all([
      apiClient.get('/publisher/postback'),
      apiClient.get('/publisher/offers'),
    ]);
    setPostbacks(pbRes.data.postbacks);
    setOffers(offersRes.data.offers.filter((o) => o.canAccess));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiClient.post('/publisher/postback', form);
      setForm({ offerId: '', event: '', postbackUrl: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.details?.[0]?.msg || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this postback URL?')) return;
    await apiClient.delete(`/publisher/postback/${id}`);
    await load();
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-800">Postback Settings</h1>
      <p className="mb-4 text-sm text-gray-500">
        Register a URL we'll call when a conversion fires. New submissions need admin approval before they fire.
      </p>

      <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            required
            value={form.offerId}
            onChange={(e) => setForm((f) => ({ ...f, offerId: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Select offer...</option>
            {offers.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          <input
            required
            placeholder="Event name (e.g. install)"
            value={form.event}
            onChange={(e) => setForm((f) => ({ ...f, event: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="https://yourdomain.com/cb?cid={click_id}"
            value={form.postbackUrl}
            onChange={(e) => setForm((f) => ({ ...f, postbackUrl: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Add Postback URL'}
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Offer</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Event</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">URL</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Status</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {postbacks.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-2">{p.Offer?.name}</td>
                <td className="px-3 py-2">{p.event}</td>
                <td className="max-w-xs truncate px-3 py-2 font-mono text-xs" title={p.postbackUrl}>{p.postbackUrl}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[p.status]}`}>{p.status}</span>
                </td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => handleDelete(p.id)} className="font-medium text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {postbacks.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No postback URLs yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
