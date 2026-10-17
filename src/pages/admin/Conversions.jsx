import { useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, Clock, Filter, IndianRupee, X, XCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import {
  Avatar,
  Button,
  Card,
  Field,
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
import { errorMessage, formatCurrency, formatDateTime, formatNumber } from '../../utils/format';

// sadmin/conversions.php: list + approve / reject, with status / offer /
// publisher / date filters. Wallet effects are transition-aware server-side
// (pending→approved credits, approved→other debits, same status is a no-op).
export default function AdminConversions() {
  usePageTitle('Conversions');
  const toast = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState(null);
  const [offers, setOffers] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [status, setStatus] = useState('');
  const [filters, setFilters] = useState({ offerId: '', userId: '', fromDate: '', toDate: '' });
  const [applied, setApplied] = useState(filters);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    apiClient.get('/admin/offers', { params: { limit: 100 } }).then(({ data }) => setOffers(data.offers));
    apiClient.get('/admin/custom-email/publishers').then(({ data }) => setPublishers(data.publishers));
  }, []);

  async function load() {
    const params = { status: status || undefined };
    Object.entries(applied).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    const { data } = await apiClient.get('/admin/conversions', { params });
    setRows(data.conversions);
  }

  useEffect(() => {
    setRows(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, applied]);

  async function updateStatus(c, next) {
    if (next === 'rejected' && c.status === 'approved') {
      const ok = await confirm({ title: 'Reject an approved conversion?', message: `${formatCurrency(c.payout)} will be debited from ${c.User?.name || 'the publisher'}'s wallet.`, confirmLabel: 'Reject & debit' });
      if (!ok) return;
    }
    setBusy(c.id);
    try {
      await apiClient.post(`/admin/conversions/${c.id}/status`, { status: next });
      toast.success(`Conversion #${c.id} ${next}`);
      await load();
    } catch (err) {
      toast.error(errorMessage(err, 'Update failed'));
    } finally {
      setBusy(null);
    }
  }

  const totals = useMemo(() => {
    const list = rows || [];
    return {
      count: list.length,
      approved: list.filter((c) => c.status === 'approved').reduce((s, c) => s + Number(c.payout), 0),
      pending: list.filter((c) => c.status === 'pending').length,
      rejected: list.filter((c) => c.status === 'rejected').length,
    };
  }, [rows]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Performance" title="Conversions" subtitle="Review and moderate every conversion posted back by advertisers." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="In view" value={formatNumber(totals.count)} icon={CheckCircle2} tone="info" loading={!rows} />
        <StatCard label="Approved payout" value={formatCurrency(totals.approved)} icon={IndianRupee} tone="success" loading={!rows} />
        <StatCard label="Pending" value={formatNumber(totals.pending)} icon={Clock} tone="warning" loading={!rows} />
        <StatCard label="Rejected" value={formatNumber(totals.rejected)} icon={XCircle} tone="danger" loading={!rows} />
      </div>

      <Card>
        <div className="space-y-4 border-b border-line p-4">
          <Segmented
            value={status}
            onChange={setStatus}
            options={[
              { value: '', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setApplied(filters);
            }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_160px_160px_auto]"
          >
            <Field label="Offer">
              <Select value={filters.offerId} onChange={(e) => setFilters((f) => ({ ...f, offerId: e.target.value }))}>
                <option value="">All offers</option>
                {offers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Publisher">
              <Select value={filters.userId} onChange={(e) => setFilters((f) => ({ ...f, userId: e.target.value }))}>
                <option value="">All publishers</option>
                {publishers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.email}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="From">
              <Input type="date" value={filters.fromDate} onChange={(e) => setFilters((f) => ({ ...f, fromDate: e.target.value }))} />
            </Field>
            <Field label="To">
              <Input type="date" value={filters.toDate} onChange={(e) => setFilters((f) => ({ ...f, toDate: e.target.value }))} />
            </Field>
            <div className="flex items-end">
              <Button type="submit" variant="secondary" icon={Filter} className="w-full">
                Filter
              </Button>
            </div>
          </form>
        </div>
        <Table minWidth={980}>
          <THead>
            <tr>
              <Th>Conversion</Th>
              <Th>Publisher</Th>
              <Th>Offer / event</Th>
              <Th align="right">Payout</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th align="right">Actions</Th>
            </tr>
          </THead>
          <tbody>
            {!rows ? (
              <TableSkeleton rows={6} cols={7} />
            ) : rows.length === 0 ? (
              <TableEmpty colSpan={7} title="No conversions found" description="Adjust the filters to see more." />
            ) : (
              rows.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    <p className="font-mono text-xs font-bold text-ink-900">#{c.id}</p>
                    <p className="font-mono text-[11px] text-ink-400">{c.clickId}</p>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.User?.name || '?'} size="sm" />
                      <div className="min-w-0">
                        <p className="max-w-[160px] truncate font-semibold text-ink-900">{c.User?.name}</p>
                        <p className="max-w-[160px] truncate text-xs text-ink-500">{c.User?.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <p className="font-semibold text-ink-900">{c.Offer?.name}</p>
                    <p className="text-xs text-ink-500">{c.OfferEvent?.eventName}</p>
                  </Td>
                  <Td align="right" className="font-extrabold text-ink-900 tabular-nums">
                    {formatCurrency(c.payout)}
                  </Td>
                  <Td>
                    <StatusBadge status={c.status} />
                  </Td>
                  <Td className="whitespace-nowrap text-ink-500">{formatDateTime(c.createdAt)}</Td>
                  <Td align="right" className="whitespace-nowrap">
                    {c.status !== 'approved' && (
                      <Button size="xs" variant="success-soft" icon={Check} loading={busy === c.id} onClick={() => updateStatus(c, 'approved')}>
                        Approve
                      </Button>
                    )}
                    {c.status !== 'rejected' && (
                      <Button size="xs" variant="danger-soft" icon={X} className="ml-1" disabled={busy === c.id} onClick={() => updateStatus(c, 'rejected')}>
                        Reject
                      </Button>
                    )}
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
