import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import OfferFormModal from '../../components/OfferFormModal';

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOffer, setModalOffer] = useState(undefined); // undefined=closed, null=create, object=edit

  async function load(page = 1) {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/offers', { params: { status: status || undefined, page } });
      setOffers(data.offers);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function handleSubmit(payload) {
    if (modalOffer) {
      await apiClient.put(`/admin/offers/${modalOffer.id}`, payload);
    } else {
      await apiClient.post('/admin/offers', payload);
    }
    setModalOffer(undefined);
    // Save already succeeded at this point — don't let a reload failure
    // surface as a save error inside the (now-closing) modal.
    load(pagination.page).catch((err) => console.error('Failed to refresh offers list', err));
  }

  async function handleDelete(offer) {
    if (!confirm(`Delete offer "${offer.name}"? This also deletes its events and any related conversions.`)) return;
    await apiClient.delete(`/admin/offers/${offer.id}`);
    await load(pagination.page);
  }

  return (
    <div className="admin-theme">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-admin-dark">Manage Offers</h1>
        <button
          type="button"
          onClick={() => setModalOffer(null)}
          className="rounded-lg bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
        >
          + New Offer
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        {['', 'active', 'paused', 'pending'].map((s) => (
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
              <th className="px-4 py-3 text-left font-semibold text-admin-dark">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-admin-dark">Payout Type</th>
              <th className="px-4 py-3 text-left font-semibold text-admin-dark">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-admin-dark">Events</th>
              <th className="px-4 py-3 text-right font-semibold text-admin-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td className="px-4 py-3 font-medium text-gray-800">{offer.name}</td>
                <td className="px-4 py-3 text-gray-600">{offer.payoutType}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      offer.status === 'active'
                        ? 'bg-admin-success text-white'
                        : offer.status === 'paused'
                          ? 'bg-admin-gray text-white'
                          : 'bg-admin-warning text-admin-dark' // pending: dark text for contrast on the orange warning bg, matches admin.css's .badge-warning
                    }`}
                  >
                    {offer.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{offer.OfferEvents?.length ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setModalOffer(offer)} className="mr-3 font-medium text-admin-primary">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(offer)} className="font-medium text-admin-danger">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && offers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No offers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-1">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => load(p)}
              className={`rounded-lg px-3 py-1 text-sm ${
                p === pagination.page ? 'bg-admin-primary text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {modalOffer !== undefined && (
        <OfferFormModal offer={modalOffer} onClose={() => setModalOffer(undefined)} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
