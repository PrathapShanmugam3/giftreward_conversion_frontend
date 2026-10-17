import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, Filter, IndianRupee, XCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import {
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
} from '../../components/ui';
import { formatCurrency, formatDateTime, formatNumber } from '../../utils/format';

// publisher/conversions.php: own conversions joined with offer, event and
// the originating click (p1 = UPI, p2 = referrer, sub1 = mobile, IP, UA),
// filterable by status, offer and date.
export default function PublisherConversions() {
  usePageTitle('Conversions');
  const [rows, setRows] = useState(null);
  const [offers, setOffers] = useState([]);
  const [status, setStatus] = useState('');
  const [filters, setFilters] = useState({ offerId: '', dateFrom: '', dateTo: '' });
  const [applied, setApplied] = useState(filters);

  useEffect(() => {
    apiClient.get('/publisher/offers').then(({ data }) => setOffers(data.offers));
  }, []);

  useEffect(() => {
    setRows(null);
    apiClient
      .get('/publisher/conversions', {
        params: { status: status || undefined, offerId: applied.offerId || undefined, dateFrom: applied.dateFrom || undefined, dateTo: applied.dateTo || undefined },
      })
      .then(({ data }) => setRows(data.conversions));
  }, [status, applied]);

  const totals = useMemo(() => {
    const list = rows || [];
    const sum = (s) => list.filter((c) => c.status === s).reduce((t, c) => t + Number(c.payout), 0);
    return {
      approved: sum('approved'),
      pending: list.filter((c) => c.status === 'pending').length,
      rejected: list.filter((c) => c.status === 'rejected').length,
      count: list.length,
    };
  }, [rows]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Performance" title="Conversions" subtitle="Every conversion credited to your account, with the click that produced it." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Conversions shown" value={formatNumber(totals.count)} icon={CheckCircle2} tone="info" loading={!rows} />
        <StatCard label="Approved earnings" value={formatCurrency(totals.approved)} icon={IndianRupee} tone="success" loading={!rows} />
        <StatCard label="Pending" value={formatNumber(totals.pending)} icon={Clock} tone="warning" loading={!rows} />
        <StatCard label="Rejected" value={formatNumber(totals.rejected)} icon={XCircle} tone="danger" loading={!rows} />
      </div>

      <Card>
        <div className="flex flex-col gap-4 border-b border-line p-4 xl:flex-row xl:items-end xl:justify-between">
          <Segmented
            value={status}
            onChange={setStatus}
            options={[
              { value: '', label: 'All' },
              { value: 'approved', label: 'Approved' },
              { value: 'pending', label: 'Pending' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setApplied(filters);
            }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-[200px_150px_150px_auto]"
          >
            <Field label="Offer" className="col-span-2 sm:col-span-1">
              <Select value={filters.offerId} onChange={(e) => setFilters((f) => ({ ...f, offerId: e.target.value }))}>
                <option value="">All offers</option>
                {offers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="From">
              <Input type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} />
            </Field>
            <Field label="To">
              <Input type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} />
            </Field>
            <div className="col-span-2 flex items-end sm:col-span-1">
              <Button type="submit" variant="secondary" icon={Filter} className="w-full">
                Filter
              </Button>
            </div>
          </form>
        </div>
        <Table minWidth={1100}>
          <THead>
            <tr>
              <Th>Offer / event</Th>
              <Th>UPI (p1)</Th>
              <Th>Referrer (p2)</Th>
              <Th>Mobile (sub1)</Th>
              <Th>IP</Th>
              <Th>Clicked</Th>
              <Th>Converted</Th>
              <Th>Status</Th>
              <Th align="right">Payout</Th>
            </tr>
          </THead>
          <tbody>
            {!rows ? (
              <TableSkeleton rows={6} cols={9} />
            ) : rows.length === 0 ? (
              <TableEmpty colSpan={9} title="No conversions found" description="Adjust the filters, or keep promoting — conversions show up here as they happen." />
            ) : (
              rows.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    <p className="font-semibold text-ink-900">{c.offer_name}</p>
                    <p className="text-xs text-ink-500">{c.event_name}</p>
                  </Td>
                  <Td className="font-mono text-xs">{c.p1 || '—'}</Td>
                  <Td className="font-mono text-xs">{c.p2 || '—'}</Td>
                  <Td className="font-mono text-xs">{c.sub1 || '—'}</Td>
                  <Td className="font-mono text-xs" title={c.user_agent}>
                    {c.ip}
                  </Td>
                  <Td className="whitespace-nowrap text-ink-500">{formatDateTime(c.click_time)}</Td>
                  <Td className="whitespace-nowrap text-ink-500">{formatDateTime(c.created_at)}</Td>
                  <Td>
                    <StatusBadge status={c.status} />
                  </Td>
                  <Td align="right" className="font-extrabold text-emerald-600 tabular-nums">
                    {formatCurrency(c.payout)}
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
