import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import CampaignFormModal from '../../components/CampaignFormModal';

export default function PublisherCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalCampaign, setModalCampaign] = useState(undefined);
  const [copiedId, setCopiedId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [campaignsRes, offersRes] = await Promise.all([
        apiClient.get('/publisher/campaigns'),
        apiClient.get('/publisher/offers'),
      ]);
      setCampaigns(campaignsRes.data.campaigns);
      setOffers(offersRes.data.offers.filter((o) => o.canAccess));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(payload) {
    if (modalCampaign) {
      await apiClient.put(`/publisher/campaigns/${modalCampaign.id}`, payload);
    } else {
      await apiClient.post('/publisher/campaigns', payload);
    }
    setModalCampaign(undefined);
    await load();
  }

  async function toggleStatus(campaign) {
    const next = campaign.status === 'active' ? 'paused' : 'active';
    await apiClient.post(`/publisher/campaigns/${campaign.id}/status`, { status: next });
    await load();
  }

  async function handleDelete(campaign) {
    if (!confirm('Delete this campaign?')) return;
    await apiClient.delete(`/publisher/campaigns/${campaign.id}`);
    await load();
  }

  function copyLink(link, id) {
    navigator.clipboard?.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Campaigns</h1>
        <button
          type="button"
          onClick={() => setModalCampaign(null)}
          disabled={offers.length === 0}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          + New Campaign
        </button>
      </div>

      {!loading && offers.length === 0 && (
        <p className="mb-4 rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
          You need access to at least one offer before creating a campaign.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {campaigns.map((c) => (
          <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-start justify-between">
              <h2 className="font-semibold text-gray-800">{c.Offer?.name}</h2>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {c.status}
              </span>
            </div>
            <div className="mb-3 space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="truncate">{c.campaignLink}</span>
                <button onClick={() => copyLink(c.campaignLink, c.id)} className="shrink-0 font-medium text-blue-600">
                  {copiedId === c.id ? 'Copied!' : 'Copy'}
                </button>
              </div>
              {!!c.referralEnabled && <div className="truncate text-gray-400">{c.referralLink}</div>}
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => setModalCampaign(c)} className="font-medium text-blue-600">
                Edit
              </button>
              <button onClick={() => toggleStatus(c)} className="font-medium text-gray-600">
                {c.status === 'active' ? 'Pause' : 'Activate'}
              </button>
              <a href={`/publisher/campaigns/${c.id}/stats`} className="font-medium text-gray-600">
                Stats
              </a>
              <button onClick={() => handleDelete(c)} className="font-medium text-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
        {!loading && campaigns.length === 0 && <p className="text-sm text-gray-500">No campaigns yet.</p>}
      </div>

      {modalCampaign !== undefined && (
        <CampaignFormModal campaign={modalCampaign} offers={offers} onClose={() => setModalCampaign(undefined)} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
