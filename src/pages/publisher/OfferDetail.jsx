import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import Loader from '../../components/Loader';

// Mirrors publisher/offer.php: single-offer drill-in with tracking link,
// event payouts, and a request-access button when not yet approved.
export default function OfferDetail() {
  const { id } = useParams();
  const [offer, setOffer] = useState(null);
  const [message, setMessage] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    const { data } = await apiClient.get(`/publisher/offers/${id}`);
    setOffer(data.offer);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function requestAccess() {
    setRequesting(true);
    try {
      const { data } = await apiClient.post(`/publisher/offers/${id}/request`);
      setMessage(data.message);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Request failed');
    } finally {
      setRequesting(false);
    }
  }

  if (!offer) return <Loader />;

  const trackingLink = `${window.location.origin}/go?cid=${offer.id}&uid=`;

  return (
    <div>
      <Link to="/publisher/offers" className="mb-4 inline-block text-sm font-medium text-blue-600">
        ← Back to Offers
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{offer.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{offer.payoutType} · {offer.category || 'Uncategorized'}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${offer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {offer.status}
          </span>
        </div>

        <p className="mb-4 text-sm text-gray-600">{offer.description}</p>

        {message && <p className="mb-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">{message}</p>}

        {offer.canAccess ? (
          <div className="mb-4 rounded-lg bg-gray-50 p-3">
            <p className="mb-1 text-xs font-medium text-gray-500">Your Tracking Link (append your publisher id)</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto whitespace-nowrap text-xs text-gray-700">{trackingLink}</code>
              <button
                onClick={() => { navigator.clipboard?.writeText(trackingLink); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="shrink-0 rounded-md bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={requestAccess}
            disabled={requesting || offer.requestStatus === 'requested'}
            className="mb-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {offer.requestStatus === 'requested' ? 'Request Pending' : requesting ? 'Requesting...' : 'Request Access'}
          </button>
        )}

        <h2 className="mb-2 text-sm font-semibold text-gray-700">Events & Payouts</h2>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <tbody className="divide-y divide-gray-100">
            {offer.OfferEvents?.map((e) => (
              <tr key={e.id}>
                <td className="py-2 pr-2 text-gray-700">{e.eventName}</td>
                <td className="py-2 text-right font-medium">₹{e.payoutAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
