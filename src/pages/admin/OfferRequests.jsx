import { useEffect, useState } from 'react';
import { Check, CheckCircle2, Clock, Inbox, Search, Trash2, X, XCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Input,
  PageHeader,
  Segmented,
  Select,
  StatCard,
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
import { errorMessage, formatDateTime, formatNumber } from '../../utils/format';

// sadmin/approve_ofr.php: users_offers moderation with stats, filters
// (status / offer / search) and single + bulk approve / reject / delete.
export default function OfferRequests() {
  usePageTitle('Offer requests');
  const toast = useToast();
  const confirm = useConfirm();
  const [requests, setRequests] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [offers, setOffers] = useState([]);
  const [status, setStatus] = useState('requested');
  const [offerId, setOfferId] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    apiClient.get('/admin/offers', { params: { limit: 100 } }).then(({ data }) => setOffers(data.offers));
  }, []);

  async function load() {
    const { data } = await apiClient.get('/admin/offers/requests/list', { params: { status, offerId: offerId || undefined, search: query || undefined } });
    setRequests(data.requests);
    setStats(data.stats);
    setSelected(new Set());
  }

  useEffect(() => {
    setRequests(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, offerId, query]);

  async function moderate(id, action) {
    try {
      const { data } = await apiClient.post(`/admin/offers/requests/${id}/moderate`, { action });
      toast.success(data.message);
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function bulk(action) {
    if (selected.size === 0) return;
    if (action === 'delete_selected' && !(await confirm({ title: `Delete ${selected.size} request(s)?`, message: 'Publishers will lose any access these requests granted.', confirmLabel: 'Delete' }))) return;
    try {
      const { data } = await apiClient.post('/admin/offers/requests/bulk-moderate', { action, requestIds: [...selected] });
      toast.success(data.message || 'Bulk action applied');
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allSelected = requests?.length > 0 && requests.every((r) => selected.has(r.id));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Catalogue" title="Offer access requests" subtitle="Approve which publishers can run approval-only offers." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total requests" value={formatNumber(stats.total)} icon={Inbox} tone="brand" />
        <StatCard label="Pending" value={formatNumber(stats.pending)} icon={Clock} tone="warning" />
        <StatCard label="Approved" value={formatNumber(stats.approved)} icon={CheckCircle2} tone="success" />
        <StatCard label="Rejected" value={formatNumber(stats.rejected)} icon={XCircle} tone="danger" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <Segmented
            value={status}
            onChange={setStatus}
            options={[
              { value: 'requested', label: 'Pending', count: stats.pending },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'all', label: 'All' },
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
              <Input icon={Search} placeholder="Publisher name, email, company…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:w-72" />
            </form>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-brand-50/60 px-4 py-2.5">
            <span className="mr-2 text-sm font-bold text-brand-800">{selected.size} selected</span>
            <Button size="sm" variant="success" icon={Check} onClick={() => bulk('approve_selected')}>
              Approve
            </Button>
            <Button size="sm" variant="danger-soft" icon={X} onClick={() => bulk('reject_selected')}>
              Reject
            </Button>
            <Button size="sm" variant="ghost" icon={Trash2} onClick={() => bulk('delete_selected')}>
              Delete
            </Button>
          </div>
        )}

        <Table minWidth={860}>
          <THead>
            <tr>
              <Th className="w-10">
                <Checkbox checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(requests.map((r) => r.id)))} aria-label="Select all" />
              </Th>
              <Th>Publisher</Th>
              <Th>Offer</Th>
              <Th>Status</Th>
              <Th>Requested</Th>
              <Th align="right">Actions</Th>
            </tr>
          </THead>
          <tbody>
            {!requests ? (
              <TableSkeleton rows={5} cols={6} />
            ) : requests.length === 0 ? (
              <TableEmpty colSpan={6} title="No requests here" description="Nothing matches these filters right now." />
            ) : (
              requests.map((req) => (
                <Tr key={req.id} selected={selected.has(req.id)}>
                  <Td>
                    <Checkbox checked={selected.has(req.id)} onChange={() => toggle(req.id)} aria-label="Select request" />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={req.User?.name || '?'} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-ink-900">{req.User?.name}</p>
                        <p className="truncate text-xs text-ink-500">{req.User?.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <p className="font-semibold text-ink-900">{req.Offer?.name}</p>
                    <p className="text-xs text-ink-500">
                      {req.Offer?.payoutType} · {req.Offer?.category || 'General'}
                    </p>
                  </Td>
                  <Td>
                    <StatusBadge status={req.status} />
                  </Td>
                  <Td className="whitespace-nowrap text-ink-500">{formatDateTime(req.requestedAt)}</Td>
                  <Td align="right" className="whitespace-nowrap">
                    {req.status !== 'approved' && (
                      <Button size="xs" variant="success-soft" icon={Check} onClick={() => moderate(req.id, 'approve')}>
                        Approve
                      </Button>
                    )}
                    {req.status !== 'rejected' && (
                      <Button size="xs" variant="danger-soft" icon={X} className="ml-1" onClick={() => moderate(req.id, 'reject')}>
                        Reject
                      </Button>
                    )}
                    <Button size="icon-sm" variant="ghost" className="ml-1 hover:text-rose-600" icon={Trash2} onClick={() => moderate(req.id, 'delete')} aria-label="Delete request" />
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
