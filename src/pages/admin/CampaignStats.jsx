import { useEffect, useMemo, useState } from 'react';
import { CalendarRange, CheckCircle2, IndianRupee, MousePointerClick, Trophy } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import { Button, Card, CardHeader, Field, Input, PageHeader, Select, StatCard, Table, TableEmpty, TableSkeleton, Td, Th, THead, Tr } from '../../components/ui';
import { formatCurrency, formatNumber, formatPercent, isoDate, monthStart } from '../../utils/format';

// sadmin/campaign-stats.php: per active offer — clicks, conversions and
// payouts in a date range (network-wide; the publisher's own campaign
// stats page reads campaign_clicks instead).
export default function AdminCampaignStats() {
  usePageTitle('Offer stats');
  const [filters, setFilters] = useState({ start: monthStart(), end: isoDate(), offerId: '' });
  const [applied, setApplied] = useState(filters);
  const [rows, setRows] = useState(null);
  const [allOffers, setAllOffers] = useState([]);

  useEffect(() => {
    apiClient.get('/admin/offers', { params: { limit: 100, status: 'active' } }).then(({ data }) => setAllOffers(data.offers));
  }, []);

  useEffect(() => {
    setRows(null);
    apiClient
      .get('/admin/reports/campaign-stats', { params: { start_date: applied.start, end_date: applied.end, offer_id: applied.offerId || undefined } })
      .then(({ data }) => setRows(data.offers));
  }, [applied]);

  const sorted = useMemo(() => [...(rows || [])].sort((a, b) => Number(b.payout) - Number(a.payout)), [rows]);
  const totals = useMemo(
    () =>
      (rows || []).reduce(
        (t, o) => ({ clicks: t.clicks + Number(o.clicks), conversions: t.conversions + Number(o.conversions), payout: t.payout + Number(o.payout) }),
        { clicks: 0, conversions: 0, payout: 0 }
      ),
    [rows]
  );
  const maxPayout = Math.max(1, ...sorted.map((o) => Number(o.payout)));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Performance" title="Offer stats" subtitle="How each active offer performed across the whole network." />

      <Card className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setApplied(filters);
          }}
          className="grid gap-3 sm:grid-cols-[160px_160px_1fr_auto]"
        >
          <Field label="From">
            <Input type="date" value={filters.start} onChange={(e) => setFilters((f) => ({ ...f, start: e.target.value }))} />
          </Field>
          <Field label="To">
            <Input type="date" value={filters.end} onChange={(e) => setFilters((f) => ({ ...f, end: e.target.value }))} />
          </Field>
          <Field label="Offer">
            <Select value={filters.offerId} onChange={(e) => setFilters((f) => ({ ...f, offerId: e.target.value }))}>
              <option value="">All active offers</option>
              {allOffers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end">
            <Button type="submit" icon={CalendarRange} className="w-full">
              Apply
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Clicks" value={formatNumber(totals.clicks)} icon={MousePointerClick} tone="info" loading={!rows} />
        <StatCard label="Conversions" value={formatNumber(totals.conversions)} sub={`${formatPercent(totals.clicks ? (totals.conversions / totals.clicks) * 100 : 0)} CR`} icon={CheckCircle2} tone="success" loading={!rows} />
        <StatCard label="Payout" value={formatCurrency(totals.payout)} icon={IndianRupee} tone="brand" loading={!rows} />
      </div>

      <Card>
        <CardHeader title="By offer" subtitle="Sorted by payout" icon={Trophy} />
        <Table minWidth={760}>
          <THead>
            <tr>
              <Th>Offer</Th>
              <Th align="right">Clicks</Th>
              <Th align="right">Conversions</Th>
              <Th align="right">CR</Th>
              <Th>Payout share</Th>
              <Th align="right">Payout</Th>
            </tr>
          </THead>
          <tbody>
            {!rows ? (
              <TableSkeleton rows={6} cols={6} />
            ) : sorted.length === 0 ? (
              <TableEmpty colSpan={6} title="No active offers in this range" />
            ) : (
              sorted.map((o) => (
                <Tr key={o.id}>
                  <Td className="font-bold text-ink-900">{o.name}</Td>
                  <Td align="right" className="tabular-nums">{formatNumber(o.clicks)}</Td>
                  <Td align="right" className="tabular-nums">{formatNumber(o.conversions)}</Td>
                  <Td align="right" className="tabular-nums">{formatPercent(o.clicks > 0 ? (o.conversions / o.clicks) * 100 : 0)}</Td>
                  <Td className="w-48">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-brand-600" style={{ width: `${(Number(o.payout) / maxPayout) * 100}%` }} />
                    </div>
                  </Td>
                  <Td align="right" className="font-extrabold text-ink-900 tabular-nums">
                    {formatCurrency(o.payout)}
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
