import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Link2, Lock, Pencil, Plus, Trash2, Webhook, XCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePublisherAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../context/SiteContext';
import OfferThumb from '../../components/OfferThumb';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  CopyField,
  EmptyState,
  Field,
  Input,
  Modal,
  PageSkeleton,
  Select,
  StatusBadge,
  Table,
  Td,
  Th,
  THead,
  Tr,
  useConfirm,
  useToast,
} from '../../components/ui';
import { cn, errorMessage, formatCurrency, formatDate } from '../../utils/format';

// Tracking parameters the /go endpoint records (same groups publisher/offer.php
// offered as click-to-append chips).
const PARAM_GROUPS = [
  { label: 'Campaign', params: [['p1', 'Campaign ID'], ['p2', 'Ad group'], ['p3', 'Creative'], ['source', 'Traffic source']] },
  { label: 'Sub IDs', params: [['sub1', 'Sub ID 1'], ['sub2', 'Sub ID 2'], ['sub3', 'Sub ID 3'], ['sub4', 'Sub ID 4'], ['sub5', 'Sub ID 5']] },
  { label: 'Device', params: [['googleaid', 'Google Ad ID'], ['iosidfa', 'iOS IDFA'], ['deviceid', 'Device ID']] },
  { label: 'Extra', params: [['p4', 'Param 4'], ['p5', 'Param 5'], ['p6', 'Param 6'], ['p7', 'Param 7'], ['p8', 'Param 8'], ['p9', 'Param 9']] },
];

// Placeholders the backend substitutes when it fires a publisher postback
// (postback.service.js).
const MACROS = ['click_id', 'offerid', 'event', 'payout', 'ip', 'user_agent', 'offer_name', 'p1', 'p2', 'sub1', 'sub2', 'conversion_id', 'user_id', 'timestamp'];

export default function OfferDetail() {
  const { id } = useParams();
  const { user } = usePublisherAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [offer, setOffer] = useState(null);
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [params, setParams] = useState([]);
  const [postbacks, setPostbacks] = useState([]);
  const [modal, setModal] = useState(undefined); // undefined closed, null create, object edit
  usePageTitle(offer?.name || 'Offer');

  async function load() {
    try {
      const { data } = await apiClient.get(`/publisher/offers/${id}`);
      setOffer(data.offer);
      if (data.offer.canAccess) {
        const pb = await apiClient.get(`/publisher/offers/${id}/postbacks`);
        setPostbacks(pb.data.postbacks);
      }
    } catch (err) {
      setError(errorMessage(err, 'Offer not found'));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const trackingLink = useMemo(() => {
    const base = `${window.location.origin}/go?cid=${id}&uid=${user?.id ?? ''}`;
    return params.reduce((link, p) => `${link}&${p}={${p}}`, base);
  }, [id, user, params]);

  if (error) {
    return (
      <Card>
        <EmptyState icon={XCircle} title="Offer unavailable" description={error} action={<Button to="/publisher/offers" icon={ArrowLeft}>Back to offers</Button>} />
      </Card>
    );
  }
  if (!offer) return <PageSkeleton />;

  async function requestAccess() {
    setRequesting(true);
    try {
      const { data } = await apiClient.post(`/publisher/offers/${id}/request`);
      toast.success(data.message);
      await load();
    } catch (err) {
      toast.error(errorMessage(err, 'Request failed'));
    } finally {
      setRequesting(false);
    }
  }

  async function deletePostback(pb) {
    if (!(await confirm({ title: 'Delete postback?', message: `Stop sending "${pb.event}" conversions to this URL?`, confirmLabel: 'Delete' }))) return;
    try {
      await apiClient.delete(`/publisher/offers/${id}/postbacks/${pb.id}`);
      toast.success('Postback deleted');
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const toggleParam = (p) => setParams((list) => (list.includes(p) ? list.filter((x) => x !== p) : [...list, p]));
  const events = offer.OfferEvents || [];
  const totalPayout = events.reduce((s, e) => s + Number(e.payoutAmount), 0);

  return (
    <div className="space-y-6">
      <Link to="/publisher/offers" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> All offers
      </Link>

      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-brand-600 via-brand-500 to-accent-600 px-6 pt-6 pb-16 sm:px-8">
          <div className="bg-grid absolute inset-0 opacity-40" />
          <div className="relative flex flex-wrap items-center gap-2">
            <Badge tone="neutral" className="bg-white/90">
              {offer.payoutType}
            </Badge>
            <Badge tone="neutral" className="bg-white/90">
              {offer.category || 'General'}
            </Badge>
            <StatusBadge status={offer.status} className="bg-white/95" />
          </div>
        </div>
        <div className="relative flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div className="flex items-end gap-4">
            <span className="relative z-10 -mt-10 rounded-3xl bg-white p-1.5 shadow-card-hover">
              <OfferThumb offer={offer} size="lg" />
            </span>
            <div className="pb-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{offer.name}</h1>
              <p className="mt-0.5 text-sm text-ink-500">Offer #{offer.id}</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-emerald-50 px-5 py-3 text-right ring-1 ring-emerald-200">
            <p className="text-[11px] font-semibold text-emerald-700">Total payout</p>
            <p className="text-2xl font-extrabold text-emerald-700 tabular-nums">{formatCurrency(totalPayout)}</p>
          </div>
        </div>
        {offer.description && <p className="border-t border-line px-6 py-5 text-sm leading-relaxed text-ink-700 sm:px-8">{offer.description}</p>}
      </Card>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-3">
          {offer.canAccess ? (
            <Card>
              <CardHeader title="Your tracking link" subtitle="Share this link — every click is attributed to you." icon={Link2} />
              <div className="space-y-5 p-5">
                <CopyField value={trackingLink} />
                <div>
                  <p className="mb-3 text-xs font-semibold text-ink-700">Append tracking parameters</p>
                  <div className="space-y-3">
                    {PARAM_GROUPS.map((g) => (
                      <div key={g.label} className="flex flex-col gap-2 sm:flex-row sm:items-start">
                        <span className="w-24 shrink-0 pt-1.5 text-[11px] font-bold tracking-wider text-ink-400 uppercase">{g.label}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {g.params.map(([key, label]) => {
                            const on = params.includes(key);
                            return (
                              <button
                                key={key}
                                type="button"
                                title={label}
                                onClick={() => toggleParam(key)}
                                className={cn(
                                  'rounded-lg px-2.5 py-1 font-mono text-xs font-medium ring-1 transition',
                                  on ? 'bg-brand-600 text-white ring-brand-600 shadow-glow' : 'bg-white text-ink-700 ring-line hover:ring-brand-300'
                                )}
                              >
                                {key}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-ink-500">
                    Replace each <code className="rounded bg-slate-100 px-1 font-mono">{'{param}'}</code> with your own value. Everything you pass is stored on the click and shows up in your reports.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
                <span className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 sm:mr-5 sm:mb-0">
                  {offer.requestStatus === 'requested' ? <Clock className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                </span>
                <div className="flex-1">
                  <p className="font-bold text-ink-900">
                    {offer.requestStatus === 'requested'
                      ? 'Your request is being reviewed'
                      : offer.requestStatus === 'rejected'
                        ? 'Your request was declined'
                        : 'This offer requires approval'}
                  </p>
                  <p className="mt-1 text-sm text-ink-500">Tracking links and postbacks unlock as soon as an admin approves your access.</p>
                </div>
                {!offer.requestStatus && (
                  <Button className="mt-4 sm:mt-0 sm:ml-4" loading={requesting} onClick={requestAccess} icon={Lock}>
                    Request access
                  </Button>
                )}
              </div>
            </Card>
          )}

          {offer.canAccess && (
            <Card>
              <CardHeader
                title="Postbacks"
                subtitle="Get notified on your server for every conversion on this offer."
                icon={Webhook}
                actions={
                  <Button size="sm" icon={Plus} onClick={() => setModal(null)}>
                    Add postback
                  </Button>
                }
              />
              {postbacks.length === 0 ? (
                <EmptyState icon={Webhook} title="No postbacks yet" description="Add a URL and we'll call it with conversion details whenever this offer converts." />
              ) : (
                <Table minWidth={560}>
                  <THead>
                    <tr>
                      <Th>Event</Th>
                      <Th>URL</Th>
                      <Th>Status</Th>
                      <Th>Added</Th>
                      <Th align="right" />
                    </tr>
                  </THead>
                  <tbody>
                    {postbacks.map((pb) => (
                      <Tr key={pb.id}>
                        <Td className="font-semibold text-ink-900">{pb.event}</Td>
                        <Td className="max-w-[260px]">
                          <span className="block truncate font-mono text-xs" title={pb.postbackUrl}>
                            {pb.postbackUrl}
                          </span>
                        </Td>
                        <Td>
                          <StatusBadge status={pb.status} />
                        </Td>
                        <Td className="whitespace-nowrap text-ink-500">{formatDate(pb.createdAt)}</Td>
                        <Td align="right" className="whitespace-nowrap">
                          <Button size="icon-sm" variant="ghost" icon={Pencil} onClick={() => setModal(pb)} aria-label="Edit postback" />
                          <Button size="icon-sm" variant="ghost" className="hover:text-rose-600" icon={Trash2} onClick={() => deletePostback(pb)} aria-label="Delete postback" />
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card>
          )}
        </div>

        <Card className="h-fit xl:col-span-2">
          <CardHeader title="Events & payouts" subtitle={`${events.length} payable event${events.length === 1 ? '' : 's'}`} />
          <ul className="divide-y divide-line">
            {events.map((e, i) => (
              <li key={e.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-extrabold text-brand-700">{i + 1}</span>
                <span className="flex-1 truncate text-sm font-semibold text-ink-900">{e.eventName}</span>
                <span className="text-sm font-extrabold text-emerald-600 tabular-nums">{formatCurrency(e.payoutAmount)}</span>
              </li>
            ))}
            {events.length === 0 && <li className="px-5 py-6 text-center text-sm text-ink-500">No events configured.</li>}
          </ul>
        </Card>
      </div>

      {modal !== undefined && (
        <PostbackModal
          offerId={id}
          events={events}
          postback={modal}
          onClose={() => setModal(undefined)}
          onSaved={async (msg) => {
            setModal(undefined);
            toast.success(msg);
            await load();
          }}
        />
      )}
    </div>
  );
}

function PostbackModal({ offerId, events, postback, onClose, onSaved }) {
  const [event, setEvent] = useState(postback?.event || events[0]?.eventName || '');
  const [url, setUrl] = useState(postback?.postbackUrl || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function addMacro(m) {
    setUrl((u) => {
      if (!u) return `https://yourdomain.com/postback?${m}={${m}}`;
      return `${u}${u.includes('?') ? '&' : '?'}${m}={${m}}`;
    });
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body = { event, postbackUrl: url };
      const { data } = postback
        ? await apiClient.put(`/publisher/offers/${offerId}/postbacks/${postback.id}`, body)
        : await apiClient.post(`/publisher/offers/${offerId}/postbacks`, body);
      await onSaved(data.message);
    } catch (err) {
      setError(errorMessage(err, 'Save failed'));
      setSaving(false);
    }
  }

  return (
    <Modal
      title={postback ? 'Edit postback' : 'Add postback'}
      description="We'll send a GET request to this URL whenever the event converts."
      icon={Webhook}
      size="lg"
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {postback ? 'Save changes' : 'Add postback'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}
        <Field label="Event" required>
          <Select value={event} onChange={(e) => setEvent(e.target.value)} required>
            {events.map((ev) => (
              <option key={ev.id} value={ev.eventName}>
                {ev.eventName}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Postback URL" required>
          <Input type="url" required placeholder="https://yourdomain.com/postback?click={click_id}" value={url} onChange={(e) => setUrl(e.target.value)} className="font-mono" />
        </Field>
        <div>
          <p className="mb-2 text-xs font-semibold text-ink-700">Insert placeholder</p>
          <div className="flex flex-wrap gap-1.5">
            {MACROS.map((m) => (
              <button key={m} type="button" onClick={() => addMacro(m)} className="rounded-lg bg-brand-50 px-2 py-1 font-mono text-[11px] font-medium text-brand-700 ring-1 ring-brand-100 transition hover:bg-brand-100">
                {`{${m}}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
