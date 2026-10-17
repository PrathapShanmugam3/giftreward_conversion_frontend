import { useEffect, useMemo, useState } from 'react';
import { Info, Plus, Trash2, Webhook } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import {
  Alert,
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  PageHeader,
  Select,
  StatusBadge,
  Table,
  TableEmpty,
  TableSkeleton,
  Td,
  Th,
  THead,
  Tr,
  useConfirm,
  useToast,
} from '../../components/ui';
import { errorMessage, formatDate } from '../../utils/format';

const MACROS = ['click_id', 'offerid', 'event', 'payout', 'ip', 'user_agent', 'offer_name', 'p1', 'p2', 'p3', 'p4', 'sub1', 'sub2', 'sub3', 'aff_sub1', 'aff_sub2', 'conversion_id', 'user_id', 'timestamp'];

// publisher/postback.php: register a callback URL per (offer, event). New
// URLs start as pending and only fire once an admin approves them.
export default function PublisherPostback() {
  usePageTitle('Postbacks');
  const toast = useToast();
  const confirm = useConfirm();
  const [postbacks, setPostbacks] = useState(null);
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState({ offerId: '', event: '', postbackUrl: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const [pbRes, offersRes] = await Promise.all([apiClient.get('/publisher/postback'), apiClient.get('/publisher/offers')]);
    setPostbacks(pbRes.data.postbacks);
    setOffers(offersRes.data.offers.filter((o) => o.canAccess));
  }

  useEffect(() => {
    load();
  }, []);

  const events = useMemo(() => offers.find((o) => String(o.id) === String(form.offerId))?.OfferEvents || [], [offers, form.offerId]);

  function addMacro(m) {
    setForm((f) => {
      const u = f.postbackUrl;
      const next = !u ? `https://yourdomain.com/postback?${m}={${m}}` : `${u}${u.includes('?') ? '&' : '?'}${m}={${m}}`;
      return { ...f, postbackUrl: next };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await apiClient.post('/publisher/postback', form);
      toast.success(data.message);
      setForm({ offerId: '', event: '', postbackUrl: '' });
      await load();
    } catch (err) {
      setError(errorMessage(err, 'Submission failed'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(pb) {
    if (!(await confirm({ title: 'Delete postback?', message: 'Conversions for this offer and event will no longer be sent to this URL.', confirmLabel: 'Delete' }))) return;
    try {
      await apiClient.delete(`/publisher/postback/${pb.id}`);
      toast.success('Postback deleted');
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Developers" title="Postback URLs" subtitle="Receive a server-to-server call every time one of your clicks converts." />

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Add a postback" subtitle="Submitted URLs are reviewed by an admin before they start firing." icon={Plus} />
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            {error && <Alert tone="danger">{error}</Alert>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Offer" required>
                <Select required value={form.offerId} onChange={(e) => setForm((f) => ({ ...f, offerId: e.target.value, event: '' }))}>
                  <option value="">Select offer…</option>
                  {offers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Event" required>
                <Select required value={form.event} disabled={!form.offerId} onChange={(e) => setForm((f) => ({ ...f, event: e.target.value }))}>
                  <option value="">{form.offerId ? 'Select event…' : 'Choose an offer first'}</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.eventName}>
                      {ev.eventName}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Postback URL" required>
              <Input required placeholder="https://yourdomain.com/cb?click={click_id}&payout={payout}" value={form.postbackUrl} onChange={(e) => setForm((f) => ({ ...f, postbackUrl: e.target.value }))} className="font-mono" />
            </Field>
            <div>
              <p className="mb-2 text-xs font-semibold text-ink-700">Click to insert a placeholder</p>
              <div className="flex flex-wrap gap-1.5">
                {MACROS.map((m) => (
                  <button key={m} type="button" onClick={() => addMacro(m)} className="rounded-lg bg-brand-50 px-2 py-1 font-mono text-[11px] font-medium text-brand-700 ring-1 ring-brand-100 transition hover:bg-brand-100">
                    {`{${m}}`}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" loading={submitting} icon={Webhook}>
              Submit for approval
            </Button>
          </form>
        </Card>

        <Card className="h-fit xl:col-span-2">
          <CardHeader title="How postbacks work" icon={Info} />
          <ol className="space-y-4 p-5 text-sm text-ink-700">
            {[
              'An advertiser reports a conversion on one of your clicks.',
              'We credit your wallet and look for an approved postback for that offer and event.',
              'We replace every {placeholder} with the conversion values and call your URL.',
              'Every call is logged on our side, so support can trace any delivery issue.',
            ].map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xs font-extrabold text-white">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card>
        <CardHeader title="Your postbacks" subtitle="Includes ones still waiting for approval" />
        <Table minWidth={760}>
          <THead>
            <tr>
              <Th>Offer</Th>
              <Th>Event</Th>
              <Th>URL</Th>
              <Th>Status</Th>
              <Th>Added</Th>
              <Th align="right" />
            </tr>
          </THead>
          <tbody>
            {!postbacks ? (
              <TableSkeleton rows={3} cols={6} />
            ) : postbacks.length === 0 ? (
              <TableEmpty colSpan={6} icon={Webhook} title="No postback URLs yet" description="Add one above to start receiving conversion callbacks." />
            ) : (
              postbacks.map((p) => (
                <Tr key={p.id}>
                  <Td className="font-semibold text-ink-900">{p.Offer?.name || `#${p.offerId}`}</Td>
                  <Td>{p.event}</Td>
                  <Td className="max-w-[320px]">
                    <span className="block truncate font-mono text-xs" title={p.postbackUrl}>
                      {p.postbackUrl}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge status={p.status} />
                  </Td>
                  <Td className="whitespace-nowrap text-ink-500">{formatDate(p.createdAt)}</Td>
                  <Td align="right">
                    <Button size="icon-sm" variant="ghost" className="hover:text-rose-600" icon={Trash2} onClick={() => handleDelete(p)} aria-label="Delete" />
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
