import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

const emptyEventRow = (name = '', payoutAmount = 0) => ({
  key: Math.random().toString(36).slice(2),
  name,
  maxPayout: payoutAmount,
  cashback: '',
  referralCashback: '',
});

// Create/edit campaign modal. Offer selection drives the event list fetched
// from /api/publisher/campaigns/offer-events/:offerId — each row lets the
// publisher set user cashback and referral cashback, capped at that
// event's payout (mirrors create-camp.php's clamp logic server-side; we
// just reflect the same cap in the UI for immediate feedback).
export default function CampaignFormModal({ campaign, offers, onClose, onSubmit }) {
  const isEdit = !!campaign;
  const [offerId, setOfferId] = useState(campaign?.offerId || '');
  const [offerEvents, setOfferEvents] = useState([]);
  const [eventRows, setEventRows] = useState([]);
  const [steps, setSteps] = useState(campaign ? JSON.parse(campaign.steps || '[]') : ['']);
  const [referralEnabled, setReferralEnabled] = useState(!!campaign?.referralEnabled);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!offerId) {
      setOfferEvents([]);
      return;
    }
    apiClient.get(`/publisher/campaigns/offer-events/${offerId}`).then(({ data }) => {
      setOfferEvents(data.events || []);
      if (!isEdit) {
        setEventRows((data.events || []).map((e) => emptyEventRow(e.eventName, Number(e.payoutAmount))));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId]);

  useEffect(() => {
    if (campaign) {
      const config = JSON.parse(campaign.eventConfig || '{}');
      setEventRows(
        Object.entries(config).map(([name, cfg]) => ({
          key: name,
          name,
          maxPayout: cfg.max_payout,
          cashback: cfg.user_cashback,
          referralCashback: cfg.referral_cashback,
        }))
      );
    }
  }, [campaign]);

  function updateRow(key, field, value) {
    setEventRows((rows) => rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  }

  function updateStep(idx, value) {
    setSteps((s) => s.map((step, i) => (i === idx ? value : step)));
  }

  function addStep() {
    setSteps((s) => [...s, '']);
  }

  function removeStep(idx) {
    setSteps((s) => s.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        offerId: Number(offerId),
        events: eventRows.map((r) => ({
          name: r.name,
          maxPayout: Number(r.maxPayout),
          cashback: Number(r.cashback) || 0,
          referralCashback: Number(r.referralCashback) || 0,
        })),
        steps: steps.filter((s) => s.trim()),
        referralEnabled,
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.details?.[0]?.msg || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-gray-800">{isEdit ? 'Edit Campaign' : 'Create Campaign'}</h2>
        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Offer</label>
          <select
            value={offerId}
            onChange={(e) => setOfferId(e.target.value)}
            disabled={isEdit}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
          >
            <option value="">Select an offer...</option>
            {offers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        {eventRows.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Cashback per Event</h3>
            <div className="space-y-2">
              {eventRows.map((row) => (
                <div key={row.key} className="grid grid-cols-4 items-center gap-2 rounded-md bg-gray-50 p-2">
                  <span className="text-sm font-medium text-gray-700">{row.name}</span>
                  <span className="text-xs text-gray-500">Max: ₹{row.maxPayout}</span>
                  <input
                    type="number"
                    step="0.01"
                    max={row.maxPayout}
                    placeholder="User cashback"
                    value={row.cashback}
                    onChange={(e) => updateRow(row.key, 'cashback', e.target.value)}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    step="0.01"
                    max={row.maxPayout}
                    placeholder="Referral cashback"
                    value={row.referralCashback}
                    onChange={(e) => updateRow(row.key, 'referralCashback', e.target.value)}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">How-to Steps</h3>
            <button type="button" onClick={addStep} className="text-sm font-medium text-blue-600">
              + Add Step
            </button>
          </div>
          <div className="space-y-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  value={step}
                  onChange={(e) => updateStep(idx, e.target.value)}
                  placeholder={`Step ${idx + 1}`}
                  className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                />
                <button type="button" onClick={() => removeStep(idx)} className="text-sm text-red-500">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <label className="mb-4 flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={referralEnabled} onChange={(e) => setReferralEnabled(e.target.checked)} />
          Enable referral links for this campaign
        </label>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || eventRows.length === 0}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}
