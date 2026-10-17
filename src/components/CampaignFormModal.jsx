import { useEffect, useState } from 'react';
import { Plus, Rocket, X } from 'lucide-react';
import { apiClient } from '../api/client';
import { Alert, Button, Field, Input, Modal, Select, Toggle } from './ui';
import { errorMessage, formatCurrency } from '../utils/format';

const emptyEventRow = (name = '', payoutAmount = 0) => ({
  key: Math.random().toString(36).slice(2),
  name,
  maxPayout: payoutAmount,
  cashback: '',
  referralCashback: '',
});

// Create/edit campaign. Offer selection drives the event list fetched from
// /api/publisher/campaigns/offer-events/:offerId; each row sets the user
// and referral cashback, capped at that event's payout (create-camp.php
// clamps the same way server-side — this just mirrors it for feedback).
export default function CampaignFormModal({ campaign, offers, onClose, onSubmit }) {
  const isEdit = !!campaign;
  const [offerId, setOfferId] = useState(campaign?.offerId || '');
  const [eventRows, setEventRows] = useState(() => {
    if (!campaign) return [];
    const config = JSON.parse(campaign.eventConfig || '{}');
    return Object.entries(config).map(([name, cfg]) => ({
      key: name,
      name,
      maxPayout: cfg.max_payout,
      cashback: cfg.user_cashback,
      referralCashback: cfg.referral_cashback,
    }));
  });
  const [steps, setSteps] = useState(campaign ? JSON.parse(campaign.steps || '[]') : ['']);
  const [referralEnabled, setReferralEnabled] = useState(!!campaign?.referralEnabled);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!offerId || isEdit) return;
    apiClient.get(`/publisher/campaigns/offer-events/${offerId}`).then(({ data }) => {
      setEventRows((data.events || []).map((e) => emptyEventRow(e.eventName, Number(e.payoutAmount))));
    });
  }, [offerId, isEdit]);

  const updateRow = (key, field, value) => setEventRows((rows) => rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        offerId: Number(offerId),
        events: eventRows.map((r) => ({
          name: r.name,
          maxPayout: Number(r.maxPayout),
          cashback: Number(r.cashback) || 0,
          referralCashback: Number(r.referralCashback) || 0,
        })),
        steps: steps.filter((s) => s.trim()),
        referralEnabled,
      });
    } catch (err) {
      setError(errorMessage(err, 'Save failed'));
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit campaign' : 'Create campaign'}
      description="Set the cashback your visitors earn and the steps shown on the landing page."
      icon={Rocket}
      size="lg"
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} disabled={eventRows.length === 0}>
            {isEdit ? 'Save changes' : 'Create campaign'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {error && <Alert tone="danger">{error}</Alert>}

        <Field label="Offer" required hint={isEdit ? 'The offer of an existing campaign cannot be changed.' : undefined}>
          <Select value={offerId} onChange={(e) => setOfferId(e.target.value)} disabled={isEdit} required>
            <option value="">Select an offer…</option>
            {offers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
            {isEdit && !offers.some((o) => o.id === campaign.offerId) && <option value={campaign.offerId}>{campaign.Offer?.name}</option>}
          </Select>
        </Field>

        {eventRows.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold text-ink-700">Cashback per event</p>
            <div className="overflow-hidden rounded-2xl ring-1 ring-line">
              <div className="hidden grid-cols-[1fr_110px_130px_130px] gap-3 bg-slate-50 px-4 py-2 text-[11px] font-bold tracking-wider text-ink-500 uppercase sm:grid">
                <span>Event</span>
                <span>Your payout</span>
                <span>User cashback</span>
                <span>Referral</span>
              </div>
              {eventRows.map((row) => (
                <div key={row.key} className="grid grid-cols-2 items-center gap-3 border-t border-line px-4 py-3 first:border-t-0 sm:grid-cols-[1fr_110px_130px_130px] sm:first:border-t">
                  <span className="col-span-2 truncate text-sm font-semibold text-ink-900 sm:col-span-1">{row.name}</span>
                  <span className="col-span-2 text-sm font-bold text-emerald-600 tabular-nums sm:col-span-1">{formatCurrency(row.maxPayout)}</span>
                  <Input type="number" step="0.01" min="0" max={row.maxPayout} placeholder="₹ user" value={row.cashback} onChange={(e) => updateRow(row.key, 'cashback', e.target.value)} />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={row.maxPayout}
                    placeholder="₹ referral"
                    value={row.referralCashback}
                    disabled={!referralEnabled}
                    onChange={(e) => updateRow(row.key, 'referralCashback', e.target.value)}
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-500">Cashback can't exceed what you earn on that event.</p>
          </div>
        )}

        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-line">
          <Toggle
            checked={referralEnabled}
            onChange={setReferralEnabled}
            label="Enable referrals"
            description="Visitors can generate a referral link and earn cashback when friends complete the offer."
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-ink-700">How-to steps shown on the landing page</p>
            <Button size="xs" variant="soft" icon={Plus} onClick={() => setSteps((s) => [...s, ''])}>
              Add step
            </Button>
          </div>
          <div className="space-y-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-extrabold text-brand-700">{idx + 1}</span>
                <Input value={step} onChange={(e) => setSteps((s) => s.map((x, i) => (i === idx ? e.target.value : x)))} placeholder={`e.g. Install the app and register`} className="flex-1" />
                <Button size="icon-sm" variant="ghost" icon={X} onClick={() => setSteps((s) => s.filter((_, i) => i !== idx))} aria-label="Remove step" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
