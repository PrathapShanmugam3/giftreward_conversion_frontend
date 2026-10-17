import { useState } from 'react';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import { Alert, Button, Field, Input, Modal, Select, Textarea, Toggle } from './ui';
import { errorMessage } from '../utils/format';

const PAYOUT_TYPES = ['CPI', 'CPA', 'CPL', 'CPS', 'CPM', 'CPC', 'CPV', 'CPR', 'CPE', 'CPT', 'CPD', 'RevShare', 'Hybrid'];

const emptyEvent = () => ({ key: Math.random().toString(36).slice(2), eventName: '', payoutAmount: '', cap: 0 });

function initialForm(offer) {
  return {
    name: offer?.name || '',
    description: offer?.description || '',
    link: offer?.link || '',
    image: offer?.image || '',
    payoutType: offer?.payoutType || 'CPA',
    status: offer?.status || 'active',
    category: offer?.category || '',
    ipWhitelistEnabled: !!offer?.ipWhitelistEnabled,
    whitelistedIps: offer?.whitelistedIps || '',
    autoApprovalEnabled: !!offer?.autoApprovalEnabled,
  };
}

// Shared create/edit modal (sadmin/offers.php). In edit mode the payload
// splits existing vs new events for the update endpoint's diff (events
// left out are deleted server-side, which cascades their conversions).
export default function OfferFormModal({ offer, onClose, onSubmit }) {
  const isEdit = !!offer;
  const [form, setForm] = useState(() => initialForm(offer));
  const [events, setEvents] = useState(() =>
    offer?.OfferEvents?.length
      ? offer.OfferEvents.map((e) => ({ key: `existing-${e.id}`, id: e.id, eventName: e.eventName, payoutAmount: e.payoutAmount, cap: e.cap }))
      : [emptyEvent()]
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const field = (name) => ({ value: form[name], onChange: (e) => set(name, e.target.value) });
  const updateEvent = (key, name, value) => setEvents((evts) => evts.map((ev) => (ev.key === key ? { ...ev, [name]: value } : ev)));
  const removedExisting = isEdit && (offer.OfferEvents || []).some((e) => !events.find((ev) => ev.id === e.id));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const clean = events.filter((ev) => ev.eventName.trim()).map((ev) => ({ ...ev, payoutAmount: Number(ev.payoutAmount), cap: Number(ev.cap) || 0 }));
    const payload = { ...form };
    if (isEdit) {
      payload.existingEvents = clean.filter((ev) => ev.id);
      payload.newEvents = clean.filter((ev) => !ev.id);
    } else {
      payload.events = clean;
    }
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(errorMessage(err, 'Save failed'));
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={isEdit ? `Edit offer #${offer.id}` : 'Create offer'}
      description="Advertiser link, payout model and the events publishers get paid for."
      icon={Megaphone}
      size="xl"
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save changes' : 'Create offer'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {error && <Alert tone="danger">{error}</Alert>}

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Offer name" required>
            <Input required {...field('name')} />
          </Field>
          <Field label="Category">
            <Input placeholder="e.g. Finance, Gaming" {...field('category')} />
          </Field>
          <Field label="Payout type" required>
            <Select {...field('payoutType')}>
              {PAYOUT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Status" hint="Pending = private: only approved publishers can see and run it.">
            <Select {...field('status')}>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="pending">Pending (private)</option>
            </Select>
          </Field>
          <Field label="Tracking link" required className="md:col-span-2" hint="Use {tid} where the advertiser expects the click ID; otherwise click_id is appended.">
            <Input required type="url" placeholder="https://advertiser.com/track?sub={tid}" className="font-mono" {...field('link')} />
          </Field>
          <Field label="Image URL" className="md:col-span-2">
            <Input type="url" placeholder="https://…/logo.png" {...field('image')} />
          </Field>
          <Field label="Description" className="md:col-span-2">
            <Textarea rows={3} {...field('description')} />
          </Field>
        </div>

        <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-line md:grid-cols-2">
          <Toggle checked={form.autoApprovalEnabled} onChange={(v) => set('autoApprovalEnabled', v)} label="Auto-approve requests" description="Publishers get access instantly when they request it." />
          <Toggle checked={form.ipWhitelistEnabled} onChange={(v) => set('ipWhitelistEnabled', v)} label="Restrict postback IPs" description="Only accept conversion postbacks from the IPs below." />
          {form.ipWhitelistEnabled && (
            <Field label="Allowed advertiser IPs" className="md:col-span-2" hint="Comma-separated IPv4/IPv6 addresses.">
              <Input placeholder="203.0.113.10, 198.51.100.7" className="font-mono" {...field('whitelistedIps')} />
            </Field>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-ink-900">Payable events</p>
              <p className="text-xs text-ink-500">Cap: 0 blocks conversions, a positive number is the remaining allowance, −1 is unlimited.</p>
            </div>
            <Button size="sm" variant="soft" icon={Plus} onClick={() => setEvents((e) => [...e, emptyEvent()])}>
              Add event
            </Button>
          </div>
          <div className="overflow-hidden rounded-2xl ring-1 ring-line">
            <div className="hidden grid-cols-[1fr_130px_150px_40px] gap-3 bg-slate-50 px-4 py-2 text-[11px] font-bold tracking-wider text-ink-500 uppercase sm:grid">
              <span>Event name</span>
              <span>Payout (₹)</span>
              <span>Cap</span>
              <span />
            </div>
            {events.map((ev) => (
              <div key={ev.key} className="grid grid-cols-[1fr_1fr_auto] gap-3 border-t border-line px-4 py-3 first:border-t-0 sm:grid-cols-[1fr_130px_150px_40px] sm:first:border-t">
                <Input placeholder="e.g. install" value={ev.eventName} onChange={(e) => updateEvent(ev.key, 'eventName', e.target.value)} className="col-span-3 sm:col-span-1" />
                <Input type="number" step="0.01" placeholder="0.00" value={ev.payoutAmount} onChange={(e) => updateEvent(ev.key, 'payoutAmount', e.target.value)} />
                <Input type="number" placeholder="-1" value={ev.cap} onChange={(e) => updateEvent(ev.key, 'cap', e.target.value)} />
                <Button size="icon" variant="ghost" className="hover:text-rose-600" icon={Trash2} onClick={() => setEvents((e) => e.filter((x) => x.key !== ev.key))} aria-label="Remove event" />
              </div>
            ))}
          </div>
          {removedExisting && (
            <Alert tone="warning" className="mt-3">
              Removing an existing event also deletes every conversion recorded against it when you save.
            </Alert>
          )}
        </div>
      </div>
    </Modal>
  );
}
