import { useEffect, useState } from 'react';

const PAYOUT_TYPES = ['CPI', 'CPA', 'CPL', 'CPS', 'CPM', 'CPC', 'CPV', 'CPR', 'CPE', 'CPT', 'CPD', 'RevShare', 'Hybrid'];
const STATUSES = ['active', 'paused', 'pending'];

const emptyEvent = () => ({ key: Math.random().toString(36).slice(2), eventName: '', payoutAmount: '', cap: 0 });

// Shared create/edit modal. `offer` null => create mode. On submit calls
// onSubmit(payload) where payload already splits existing vs new events for
// the update endpoint's diffing logic (see offer.service.js updateOffer).
export default function OfferFormModal({ offer, onClose, onSubmit }) {
  const isEdit = !!offer;
  const [form, setForm] = useState({
    name: '',
    description: '',
    link: '',
    image: '',
    payoutType: 'CPA',
    status: 'active',
    category: '',
    ipWhitelistEnabled: false,
    whitelistedIps: '',
    autoApprovalEnabled: false,
  });
  const [events, setEvents] = useState([emptyEvent()]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (offer) {
      setForm({
        name: offer.name || '',
        description: offer.description || '',
        link: offer.link || '',
        image: offer.image || '',
        payoutType: offer.payoutType || 'CPA',
        status: offer.status || 'active',
        category: offer.category || '',
        ipWhitelistEnabled: !!offer.ipWhitelistEnabled,
        whitelistedIps: offer.whitelistedIps || '',
        autoApprovalEnabled: !!offer.autoApprovalEnabled,
      });
      setEvents(
        (offer.OfferEvents || []).map((e) => ({
          key: `existing-${e.id}`,
          id: e.id,
          eventName: e.eventName,
          payoutAmount: e.payoutAmount,
          cap: e.cap,
        }))
      );
    }
  }, [offer]);

  function updateField(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
    };
  }

  function updateEvent(key, field, value) {
    setEvents((evts) => evts.map((ev) => (ev.key === key ? { ...ev, [field]: value } : ev)));
  }

  function addEvent() {
    setEvents((evts) => [...evts, emptyEvent()]);
  }

  function removeEvent(key) {
    setEvents((evts) => evts.filter((ev) => ev.key !== key));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const cleanEvents = events
      .filter((ev) => ev.eventName.trim())
      .map((ev) => ({ ...ev, payoutAmount: Number(ev.payoutAmount), cap: Number(ev.cap) || 0 }));

    const payload = { ...form };
    if (isEdit) {
      payload.existingEvents = cleanEvents.filter((ev) => ev.id);
      payload.newEvents = cleanEvents.filter((ev) => !ev.id);
    } else {
      payload.events = cleanEvents;
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      const details = err.response?.data?.details;
      setError(details?.[0]?.msg || err.response?.data?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-theme fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-admin bg-white p-6 shadow-xl"
      >
        <h2 className="mb-4 text-lg font-bold text-admin-dark">{isEdit ? 'Edit Offer' : 'Create Offer'}</h2>
        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-admin-danger">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <TextField label="Name" value={form.name} onChange={updateField('name')} required />
          <SelectField label="Payout Type" value={form.payoutType} onChange={updateField('payoutType')} options={PAYOUT_TYPES} />
          <SelectField label="Status" value={form.status} onChange={updateField('status')} options={STATUSES} />
          <TextField label="Category" value={form.category} onChange={updateField('category')} />
          <TextField label="Tracking Link" value={form.link} onChange={updateField('link')} required className="col-span-2" placeholder="https://advertiser.com/track?tid={tid}" />
          <TextField label="Image URL" value={form.image} onChange={updateField('image')} className="col-span-2" />
          <TextArea label="Description" value={form.description} onChange={updateField('description')} className="col-span-2" />

          <label className="col-span-2 flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.autoApprovalEnabled} onChange={updateField('autoApprovalEnabled')} />
            Auto-approve publisher access requests
          </label>

          <label className="col-span-2 flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.ipWhitelistEnabled} onChange={updateField('ipWhitelistEnabled')} />
            Restrict postbacks to whitelisted IPs
          </label>
          {form.ipWhitelistEnabled && (
            <TextField
              label="Whitelisted IPs (comma-separated)"
              value={form.whitelistedIps}
              onChange={updateField('whitelistedIps')}
              className="col-span-2"
            />
          )}
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Events</h3>
            <button type="button" onClick={addEvent} className="text-sm font-medium text-admin-primary">
              + Add Event
            </button>
          </div>
          <div className="space-y-2">
            {events.map((ev) => (
              <div key={ev.key} className="flex items-center gap-2">
                <input
                  placeholder="Event name"
                  value={ev.eventName}
                  onChange={(e) => updateEvent(ev.key, 'eventName', e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Payout"
                  value={ev.payoutAmount}
                  onChange={(e) => updateEvent(ev.key, 'payoutAmount', e.target.value)}
                  className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                />
                <input
                  type="number"
                  placeholder="Cap (0=blocked, -1=unlimited)"
                  value={ev.cap}
                  onChange={(e) => updateEvent(ev.key, 'cap', e.target.value)}
                  className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                />
                <button type="button" onClick={() => removeEvent(ev.key)} className="text-sm text-red-500">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark disabled:opacity-60"
          >
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Offer'}
          </button>
        </div>
      </form>
    </div>
  );
}

function TextField({ label, className = '', ...props }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input {...props} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-admin-primary focus:outline-none" />
    </div>
  );
}

function TextArea({ label, className = '', ...props }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <textarea {...props} rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-admin-primary focus:outline-none" />
    </div>
  );
}

function SelectField({ label, options, className = '', ...props }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <select {...props} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-admin-primary focus:outline-none">
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
