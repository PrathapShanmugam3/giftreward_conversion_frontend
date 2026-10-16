import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

const STATUS_BADGE = {
  approved: 'bg-green-100 text-green-700',
  requested: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function PublisherOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState('');

  async function load() {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/publisher/offers', { params: { search } });
      setOffers(data.offers);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    await load();
  }

  async function requestOffer(offer) {
    setBusyId(offer.id);
    setNotice('');
    try {
      const { data } = await apiClient.post(`/publisher/offers/${offer.id}/request`);
      setNotice(data.message);
      await load();
    } catch (err) {
      setNotice(err.response?.data?.message || 'Request failed');
    } finally {
      setBusyId(null);
    }
  }

  function actionFor(offer) {
    if (offer.requestStatus === 'approved' || offer.canAccess) {
      return (
        <a
          href={`/publisher/offers/${offer.id}`}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          View / Promote
        </a>
      );
    }
    if (offer.requestStatus === 'requested') {
      return <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE.requested}`}>Pending approval</span>;
    }
    if (offer.requestStatus === 'rejected') {
      return <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE.rejected}`}>Rejected</span>;
    }
    return (
      <button
        type="button"
        disabled={busyId === offer.id}
        onClick={() => requestOffer(offer)}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {busyId === offer.id ? 'Requesting...' : 'Request Access'}
      </button>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-800">Offers</h1>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search offers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button type="submit" className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
          Search
        </button>
      </form>

      {notice && <p className="mb-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <div key={offer.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-start justify-between">
                <h2 className="font-semibold text-gray-800">{offer.name}</h2>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{offer.payoutType}</span>
              </div>
              <p className="mb-3 line-clamp-2 text-sm text-gray-500">{offer.description}</p>
              <p className="mb-3 text-sm font-medium text-gray-700">Total payout: ₹{offer.totalPayout}</p>
              {actionFor(offer)}
            </div>
          ))}
          {offers.length === 0 && <p className="text-sm text-gray-500">No offers found.</p>}
        </div>
      )}
    </div>
  );
}
