import { useEffect, useMemo, useState } from 'react';
import { CalendarRange, CheckCircle2, FileSpreadsheet, FileText, IndianRupee, MousePointerClick, Percent, Users } from 'lucide-react';
import { apiClient, downloadFile } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  PageHeader,
  Pagination,
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
  useToast,
} from '../../components/ui';
import { daysAgo, errorMessage, formatCurrency, formatDateTime, formatNumber, formatPercent, isoDate, monthStart } from '../../utils/format';

const PRESETS = {
  today: () => [isoDate(), isoDate()],
  yesterday: () => [daysAgo(1), daysAgo(1)],
  '7days': () => [daysAgo(6), isoDate()],
  '30days': () => [daysAgo(29), isoDate()],
  month: () => [monthStart(), isoDate()],
};
const PAGE_SIZE = 25;

function timeToConvert(click, conv) {
  if (!click || !conv) return '—';
  const secs = Math.max(0, (new Date(conv) - new Date(click)) / 1000);
  if (secs < 60) return `${Math.round(secs)}s`;
  if (secs < 3600) return `${Math.round(secs / 60)}m`;
  if (secs < 86400) return `${(secs / 3600).toFixed(1)}h`;
  return `${(secs / 86400).toFixed(1)}d`;
}

// sadmin/reports.php: network click report (latest 500 rows) with period
// presets, publisher / offer / conversion-status filters, stats and
// CSV / Excel export (same 500-row cap as the on-screen table).
export default function AdminReports() {
  usePageTitle('Click reports');
  const toast = useToast();
  const [preset, setPreset] = useState('month');
  const [filters, setFilters] = useState(() => {
    const [s, e] = PRESETS.month();
    return { startDate: s, endDate: e, publisherId: '', offerId: '', statusFilter: '' };
  });
  const [applied, setApplied] = useState(filters);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [offers, setOffers] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    apiClient.get('/admin/offers', { params: { limit: 100 } }).then(({ data: d }) => setOffers(d.offers));
    apiClient.get('/admin/custom-email/publishers').then(({ data: d }) => setPublishers(d.publishers));
  }, []);

  const params = useMemo(
    () => ({
      start_date: applied.startDate,
      end_date: applied.endDate,
      publisher_id: applied.publisherId || undefined,
      offer_id: applied.offerId || undefined,
      status_filter: applied.statusFilter || undefined,
    }),
    [applied]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiClient
      .get('/admin/reports', { params })
      .then(({ data: res }) => {
        if (cancelled) return;
        setData(res);
        setPage(1);
      })
      .catch((err) => toast.error(errorMessage(err, 'Failed to load report')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function choosePreset(p) {
    setPreset(p);
    if (p === 'custom') return;
    const [startDate, endDate] = PRESETS[p]();
    const next = { ...filters, startDate, endDate };
    setFilters(next);
    setApplied(next);
  }

  async function exportAs(format) {
    setExporting(format);
    try {
      await downloadFile('/admin/reports/export', { ...params, format }, `network_report.${format === 'excel' ? 'xlsx' : 'csv'}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Export failed'));
    } finally {
      setExporting('');
    }
  }

  const rows = data?.clicks || [];
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Performance"
        title="Network click report"
        subtitle="Every click across all publishers, with its conversion outcome."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={FileText} loading={exporting === 'csv'} onClick={() => exportAs('csv')}>
              CSV
            </Button>
            <Button variant="secondary" size="sm" icon={FileSpreadsheet} loading={exporting === 'excel'} onClick={() => exportAs('excel')}>
              Excel
            </Button>
          </>
        }
      />

      <Card className="p-4">
        <Segmented
          className="mb-4"
          value={preset}
          onChange={choosePreset}
          options={[
            { value: 'today', label: 'Today' },
            { value: 'yesterday', label: 'Yesterday' },
            { value: '7days', label: '7 days' },
            { value: '30days', label: '30 days' },
            { value: 'month', label: 'This month' },
            { value: 'custom', label: 'Custom' },
          ]}
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setApplied(filters);
          }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[150px_150px_1fr_1fr_170px_auto]"
        >
          <Field label="From">
            <Input type="date" value={filters.startDate} onChange={(e) => { setPreset('custom'); setFilters((f) => ({ ...f, startDate: e.target.value })); }} />
          </Field>
          <Field label="To">
            <Input type="date" value={filters.endDate} onChange={(e) => { setPreset('custom'); setFilters((f) => ({ ...f, endDate: e.target.value })); }} />
          </Field>
          <Field label="Publisher">
            <Select value={filters.publisherId} onChange={(e) => setFilters((f) => ({ ...f, publisherId: e.target.value }))}>
              <option value="">All publishers</option>
              {publishers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
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
          <Field label="Outcome">
            <Select value={filters.statusFilter} onChange={(e) => setFilters((f) => ({ ...f, statusFilter: e.target.value }))}>
              <option value="">All clicks</option>
              <option value="converted">Converted</option>
              <option value="not_converted">Not converted</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </Select>
          </Field>
          <div className="flex items-end">
            <Button type="submit" icon={CalendarRange} className="w-full">
              Apply
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Clicks" value={formatNumber(stats?.totalClicks)} icon={MousePointerClick} tone="info" loading={!stats} />
        <StatCard label="Conversions" value={formatNumber(stats?.totalConversions)} icon={CheckCircle2} tone="slate" loading={!stats} />
        <StatCard label="Approved" value={formatNumber(stats?.approvedConversions)} icon={CheckCircle2} tone="success" loading={!stats} />
        <StatCard label="Payout" value={formatCurrency(stats?.totalPayout)} icon={IndianRupee} tone="brand" loading={!stats} />
        <StatCard label="Publishers" value={formatNumber(stats?.uniquePublishers)} icon={Users} tone="warning" loading={!stats} />
        <StatCard label="Conv. rate" value={formatPercent(stats?.conversionRate)} icon={Percent} tone="danger" loading={!stats} />
      </div>

      <Card>
        <CardHeader title="Clicks" subtitle={data ? `Latest ${formatNumber(rows.length)} rows${rows.length >= 500 ? ' (capped at 500 — narrow the date range to see older clicks)' : ''}` : ''} />
        <Table minWidth={1180}>
          <THead>
            <tr>
              <Th>Click</Th>
              <Th>Publisher</Th>
              <Th>Offer</Th>
              <Th>UPI (p1)</Th>
              <Th>Source</Th>
              <Th>IP</Th>
              <Th>Clicked</Th>
              <Th>Outcome</Th>
              <Th align="right">Payout</Th>
              <Th align="right">To convert</Th>
            </tr>
          </THead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={8} cols={10} />
            ) : pageRows.length === 0 ? (
              <TableEmpty colSpan={10} icon={MousePointerClick} title="No clicks in this range" />
            ) : (
              pageRows.map((c) => (
                <Tr key={c.click_id}>
                  <Td className="font-mono text-xs">{c.tracking_id}</Td>
                  <Td className="max-w-[150px] truncate font-semibold text-ink-900">{c.publisher_name}</Td>
                  <Td className="max-w-[160px] truncate">{c.offer_name}</Td>
                  <Td className="font-mono text-xs">{c.p1 || '—'}</Td>
                  <Td className="text-xs">{c.source || '—'}</Td>
                  <Td className="font-mono text-xs" title={c.user_agent}>
                    {c.ip}
                  </Td>
                  <Td className="whitespace-nowrap text-ink-500">{formatDateTime(c.click_time)}</Td>
                  <Td>{c.conversion_status ? <StatusBadge status={c.conversion_status} /> : <StatusBadge status="not converted" label="No conversion" />}</Td>
                  <Td align="right" className="font-bold tabular-nums">
                    {c.payout != null ? formatCurrency(c.payout) : '—'}
                  </Td>
                  <Td align="right" className="text-xs text-ink-500 tabular-nums">
                    {timeToConvert(c.click_time, c.conversion_time)}
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
        <Pagination page={page} totalPages={Math.ceil(rows.length / PAGE_SIZE)} total={rows.length} onChange={setPage} />
      </Card>
    </div>
  );
}
