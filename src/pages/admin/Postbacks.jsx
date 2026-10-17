import { useEffect, useState } from 'react';
import { Check, History, Pencil, Search, Trash2, Webhook, X } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Field,
  Input,
  Modal,
  PageHeader,
  Segmented,
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
import { errorMessage, formatCurrency, formatDateTime } from '../../utils/format';

// sadmin/approve_postback.php (publisher postback moderation: approve /
// reject / edit / delete with filters) + sadmin/postbacks.php (last 100
// postbacks_log rows), as two tabs.
export default function AdminPostbacks() {
  usePageTitle('Postbacks');
  const [tab, setTab] = useState('approval');
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Performance"
        title="Postbacks"
        subtitle="Publisher callback URLs and the delivery log of every postback we fired."
        actions={
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: 'approval', label: 'Publisher URLs' },
              { value: 'log', label: 'Delivery log' },
            ]}
          />
        }
      />
      {tab === 'approval' ? <ApprovalTab /> : <LogTab />}
    </div>
  );
}

function ApprovalTab() {
  const toast = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState(null);
  const [offers, setOffers] = useState([]);
  const [status, setStatus] = useState('pending');
  const [offerId, setOfferId] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    apiClient.get('/admin/offers', { params: { limit: 100 } }).then(({ data }) => setOffers(data.offers));
  }, []);

  async function load() {
    const { data } = await apiClient.get('/admin/postbacks', { params: { status: status || undefined, offerId: offerId || undefined, search: query || undefined } });
    setRows(data.postbacks);
  }

  useEffect(() => {
    setRows(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, offerId, query]);

  async function moderate(pb, action) {
    if (action === 'delete' && !(await confirm({ title: 'Delete postback?', message: `Remove ${pb.User?.name}'s "${pb.event}" postback for ${pb.Offer?.name}?`, confirmLabel: 'Delete' }))) return;
    try {
      const { data } = await apiClient.post(`/admin/postbacks/${pb.id}/moderate`, { action });
      toast.success(data.message);
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
        <Segmented
          value={status}
          onChange={setStatus}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: '', label: 'All' },
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={offerId} onChange={(e) => setOfferId(e.target.value)} className="sm:w-52">
            <option value="">All offers</option>
            {offers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(search.trim());
            }}
          >
            <Input icon={Search} placeholder="Publisher name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:w-64" />
          </form>
        </div>
      </div>
      <Table minWidth={1040}>
        <THead>
          <tr>
            <Th>Publisher</Th>
            <Th>Offer / event</Th>
            <Th>URL</Th>
            <Th align="right">Event payout</Th>
            <Th>Status</Th>
            <Th>Added</Th>
            <Th align="right">Actions</Th>
          </tr>
        </THead>
        <tbody>
          {!rows ? (
            <TableSkeleton rows={5} cols={7} />
          ) : rows.length === 0 ? (
            <TableEmpty colSpan={7} icon={Webhook} title="No postbacks here" />
          ) : (
            rows.map((pb) => (
              <Tr key={pb.id}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={pb.User?.name || '?'} size="sm" />
                    <div className="min-w-0">
                      <p className="max-w-[150px] truncate font-semibold text-ink-900">{pb.User?.name}</p>
                      <p className="max-w-[150px] truncate text-xs text-ink-500">{pb.User?.email}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <p className="font-semibold text-ink-900">{pb.Offer?.name}</p>
                  <p className="text-xs text-ink-500">
                    {pb.event}
                    {!pb.offerEvent && <span className="ml-1 text-rose-500">(no matching event)</span>}
                  </p>
                </Td>
                <Td className="max-w-[300px]">
                  <span className="block truncate font-mono text-xs" title={pb.postbackUrl}>
                    {pb.postbackUrl}
                  </span>
                </Td>
                <Td align="right" className="tabular-nums">
                  {pb.offerEvent ? formatCurrency(pb.offerEvent.payoutAmount) : '—'}
                </Td>
                <Td>
                  <StatusBadge status={pb.status} />
                </Td>
                <Td className="whitespace-nowrap text-ink-500">{formatDateTime(pb.createdAt)}</Td>
                <Td align="right" className="whitespace-nowrap">
                  {pb.status !== 'approved' && (
                    <Button size="xs" variant="success-soft" icon={Check} onClick={() => moderate(pb, 'approve')}>
                      Approve
                    </Button>
                  )}
                  {pb.status !== 'rejected' && (
                    <Button size="xs" variant="danger-soft" icon={X} className="ml-1" onClick={() => moderate(pb, 'reject')}>
                      Reject
                    </Button>
                  )}
                  <Button size="icon-sm" variant="ghost" className="ml-1" icon={Pencil} onClick={() => setEditing(pb)} aria-label="Edit" />
                  <Button size="icon-sm" variant="ghost" className="hover:text-rose-600" icon={Trash2} onClick={() => moderate(pb, 'delete')} aria-label="Delete" />
                </Td>
              </Tr>
            ))
          )}
        </tbody>
      </Table>
      {editing && (
        <EditModal
          postback={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            toast.success('Postback updated');
            setEditing(null);
            await load();
          }}
        />
      )}
    </Card>
  );
}

function EditModal({ postback, onClose, onSaved }) {
  const [form, setForm] = useState({ event: postback.event, postbackUrl: postback.postbackUrl, status: postback.status });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiClient.post(`/admin/postbacks/${postback.id}/moderate`, { action: 'update', ...form });
      await onSaved();
    } catch (err) {
      setError(errorMessage(err, 'Update failed'));
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Edit postback"
      description={`${postback.User?.name} · ${postback.Offer?.name}`}
      icon={Pencil}
      size="lg"
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event name" required hint="Must match an event on the offer to fire.">
            <Input required value={form.event} onChange={(e) => setForm((f) => ({ ...f, event: e.target.value }))} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
          </Field>
        </div>
        <Field label="Postback URL" required>
          <Input required className="font-mono" value={form.postbackUrl} onChange={(e) => setForm((f) => ({ ...f, postbackUrl: e.target.value }))} />
        </Field>
      </div>
    </Modal>
  );
}

function LogTab() {
  const [logs, setLogs] = useState(null);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    apiClient.get('/admin/postbacks-log', { params: { limit: 100 } }).then(({ data }) => setLogs(data.logs));
  }, []);

  const okCode = (code) => /^2\d\d$/.test(String(code));

  return (
    <Card>
      <div className="flex items-center gap-2 border-b border-line px-5 py-4 text-sm text-ink-500">
        <History className="h-4 w-4" /> Last 100 postback deliveries
      </div>
      <Table minWidth={980}>
        <THead>
          <tr>
            <Th>Conversion</Th>
            <Th>Publisher / offer</Th>
            <Th>Sent to</Th>
            <Th>URL</Th>
            <Th>HTTP</Th>
            <Th>Time</Th>
          </tr>
        </THead>
        <tbody>
          {!logs ? (
            <TableSkeleton rows={6} cols={6} />
          ) : logs.length === 0 ? (
            <TableEmpty colSpan={6} icon={History} title="No deliveries logged yet" />
          ) : (
            logs.map((l) => (
              <Tr key={l.id} className="cursor-pointer" onClick={() => setOpen(l)}>
                <Td>
                  {l.Conversion ? (
                    <>
                      <p className="font-mono text-xs font-bold text-ink-900">#{l.Conversion.id}</p>
                      <p className="text-xs text-ink-500">
                        {l.Conversion.OfferEvent?.eventName} · {formatCurrency(l.Conversion.payout)}
                      </p>
                    </>
                  ) : (
                    <span className="text-xs text-ink-400">deleted</span>
                  )}
                </Td>
                <Td>
                  <p className="font-semibold text-ink-900">{l.Conversion?.User?.name || '—'}</p>
                  <p className="text-xs text-ink-500">{l.Conversion?.Offer?.name || '—'}</p>
                </Td>
                <Td>
                  <div className="flex gap-1">
                    {!!l.sentToUser && <Badge tone="brand">Publisher</Badge>}
                    {!!l.sentToAdmin && <Badge tone="violet">Admin</Badge>}
                    {!l.sentToUser && !l.sentToAdmin && <Badge tone="neutral">None</Badge>}
                  </div>
                </Td>
                <Td className="max-w-[280px]">
                  <span className="block truncate font-mono text-xs" title={l.postbackUrl}>
                    {l.postbackUrl || '—'}
                  </span>
                </Td>
                <Td>{l.httpCode ? <Badge tone={okCode(l.httpCode) ? 'success' : 'danger'}>{l.httpCode}</Badge> : '—'}</Td>
                <Td className="whitespace-nowrap text-ink-500">{formatDateTime(l.createdAt)}</Td>
              </Tr>
            ))
          )}
        </tbody>
      </Table>
      {open && (
        <Modal title={`Delivery #${open.id}`} description={formatDateTime(open.createdAt)} icon={History} size="lg" onClose={() => setOpen(null)}>
          <div className="space-y-4 text-sm">
            <div>
              <p className="mb-1 text-xs font-semibold text-ink-500">URL</p>
              <pre className="scroll-thin overflow-x-auto rounded-xl bg-slate-50 p-3 font-mono text-xs break-all whitespace-pre-wrap ring-1 ring-line">{open.postbackUrl || '—'}</pre>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-ink-500">HTTP code</p>
                <p className="mt-1 font-mono font-bold">{open.httpCode || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-500">Attempts</p>
                <p className="mt-1 font-mono font-bold">{open.attempts || '—'}</p>
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-ink-500">Response</p>
              <pre className="scroll-thin max-h-60 overflow-auto rounded-xl bg-[#0b1020] p-3 font-mono text-xs whitespace-pre-wrap text-slate-200">{open.response || '(empty)'}</pre>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
}
