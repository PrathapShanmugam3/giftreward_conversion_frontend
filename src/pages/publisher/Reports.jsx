import { useEffect, useMemo, useState } from 'react';
import { CalendarRange, CheckCircle2, Columns3, Download, FileSpreadsheet, FileText, IndianRupee, MousePointerClick, Percent, RotateCcw } from 'lucide-react';
import { apiClient, downloadFile } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import {
  Button,
  Card,
  CardHeader,
  Checkbox,
  Field,
  Input,
  Modal,
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
import { errorMessage, formatCurrency, formatDateTime, formatNumber, formatPercent, isoDate, monthStart } from '../../utils/format';

const COLUMNS_KEY = 'gr.reportColumns';
// Filled in by the export only (needs a geo lookup per IP).
const EXPORT_ONLY = new Set(['location', 'carrier_isp']);

function monthEnd() {
  const d = new Date();
  return isoDate(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

function deviceOf(ua = '') {
  const s = ua.toLowerCase();
  const kind = /ipad|tablet/.test(s) ? 'Tablet' : /mobi|android|iphone/.test(s) ? 'Mobile' : ua ? 'Desktop' : '—';
  const os = /android/.test(s) ? 'Android' : /iphone|ipad|ios/.test(s) ? 'iOS' : /windows/.test(s) ? 'Windows' : /mac os/.test(s) ? 'macOS' : /linux/.test(s) ? 'Linux' : '';
  return os ? `${kind} · ${os}` : kind;
}

function cellValue(row, key) {
  switch (key) {
    case 'click_time':
      return formatDateTime(row.created_at);
    case 'conv_id':
      return row.conversion_id || '—';
    case 'status':
      return row.conversion_status ? <StatusBadge status={row.conversion_status} /> : <StatusBadge status="not converted" label="Not converted" />;
    case 'payout':
      return row.conversion_payout != null ? <span className="font-bold text-emerald-600">{formatCurrency(row.conversion_payout)}</span> : '—';
    case 'device':
      return deviceOf(row.user_agent);
    case 'click_id':
      return <span className="font-mono text-xs">{row.click_id}</span>;
    default:
      return row[key] || '—';
  }
}

// publisher/reports.php (+ export.php): daily / monthly / custom summary,
// paginated click-level report with column visibility, CSV / Excel / PDF.
export default function PublisherReports() {
  usePageTitle('Reports');
  const toast = useToast();
  const today = isoDate();
  const [type, setType] = useState('daily');
  const [filters, setFilters] = useState({ dateFrom: today, dateTo: today, offerId: '', status: 'all' });
  const [applied, setApplied] = useState(filters);
  const [offers, setOffers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [detailed, setDetailed] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [labels, setLabels] = useState({});
  const [visible, setVisible] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(COLUMNS_KEY)) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    apiClient.get('/publisher/offers').then(({ data }) => setOffers(data.offers));
  }, []);

  // Monthly summaries always cover the current calendar month (backend
  // rule), so pin the date range to match.
  function changeType(t) {
    setType(t);
    let next = filters;
    if (t === 'monthly') next = { ...filters, dateFrom: monthStart(), dateTo: monthEnd() };
    if (t === 'daily') next = { ...filters, dateFrom: today, dateTo: today };
    setFilters(next);
    setApplied(next);
    setPage(1);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = { dateFrom: applied.dateFrom, dateTo: applied.dateTo, offerId: applied.offerId || undefined, status: applied.status };
    Promise.all([
      apiClient.get('/publisher/reports/summary', { params: { ...params, type } }),
      apiClient.get('/publisher/reports/detailed', { params: { ...params, page, perPage } }),
    ])
      .then(([s, d]) => {
        if (cancelled) return;
        setSummary(s.data);
        setDetailed(d.data);
        setLabels(d.data.columnLabels || {});
        setVisible((v) => v || d.data.defaultVisibleColumns || {});
      })
      .catch((err) => toast.error(errorMessage(err, 'Failed to load report')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, applied, page, perPage]);

  const shownColumns = useMemo(() => Object.keys(labels).filter((k) => visible?.[k] && !EXPORT_ONLY.has(k)), [labels, visible]);

  function apply(e) {
    e.preventDefault();
    setPage(1);
    setApplied(filters);
  }

  function saveColumns(next) {
    setVisible(next);
    try {
      localStorage.setItem(COLUMNS_KEY, JSON.stringify(next));
    } catch {
      /* private mode — keep in memory only */
    }
  }

  async function exportAs(format) {
    setExporting(format);
    try {
      await downloadFile(
        '/publisher/reports/export',
        {
          format,
          dateFrom: applied.dateFrom,
          dateTo: applied.dateTo,
          offerId: applied.offerId || undefined,
          status: applied.status !== 'all' ? applied.status : undefined,
          columns: JSON.stringify(visible || {}),
        },
        `report.${format === 'excel' ? 'xlsx' : format}`
      );
    } catch (err) {
      toast.error(errorMessage(err, 'Export failed'));
    } finally {
      setExporting('');
    }
  }

  const totals = summary?.totals || { clicks: 0, conversions: 0, revenue: 0 };
  const cr = totals.clicks ? (totals.conversions / totals.clicks) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Performance"
        title="Reports"
        subtitle="Every click you've sent, joined with its conversion — filter, slice and export."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={FileText} loading={exporting === 'csv'} onClick={() => exportAs('csv')}>
              CSV
            </Button>
            <Button variant="secondary" size="sm" icon={FileSpreadsheet} loading={exporting === 'excel'} onClick={() => exportAs('excel')}>
              Excel
            </Button>
            <Button variant="secondary" size="sm" icon={Download} loading={exporting === 'pdf'} onClick={() => exportAs('pdf')}>
              PDF
            </Button>
          </>
        }
      />

      <Card className="p-4">
        <div className="mb-4">
          <Segmented
            value={type}
            onChange={changeType}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'monthly', label: 'This month' },
              { value: 'custom', label: 'Custom range' },
            ]}
          />
        </div>
        <form onSubmit={apply} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_1fr_auto]">
          <Field label="From">
            <Input type="date" value={filters.dateFrom} disabled={type === 'monthly'} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} />
          </Field>
          <Field label="To">
            <Input type="date" value={filters.dateTo} disabled={type === 'monthly'} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} />
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
          <Field label="Status">
            <Select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
              <option value="all">All clicks</option>
              <option value="converted">Converted</option>
              <option value="not_converted">Not converted</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </Select>
          </Field>
          <div className="flex items-end gap-2">
            <Button type="submit" icon={CalendarRange} className="flex-1 lg:flex-none">
              Apply
            </Button>
            <Button
              variant="ghost"
              size="icon"
              icon={RotateCcw}
              aria-label="Reset filters"
              onClick={() => {
                const reset = { dateFrom: today, dateTo: today, offerId: '', status: 'all' };
                setType('daily');
                setFilters(reset);
                setApplied(reset);
                setPage(1);
              }}
            />
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Clicks" value={formatNumber(totals.clicks)} icon={MousePointerClick} tone="info" loading={loading && !summary} />
        <StatCard label="Conversions" value={formatNumber(totals.conversions)} icon={CheckCircle2} tone="success" loading={loading && !summary} />
        <StatCard label="Conversion rate" value={formatPercent(cr)} icon={Percent} tone="warning" loading={loading && !summary} />
        <StatCard label="Approved earnings" value={formatCurrency(totals.revenue)} icon={IndianRupee} tone="brand" loading={loading && !summary} />
      </div>

      <Card>
        <CardHeader title={type === 'monthly' ? 'Monthly summary' : 'Daily summary'} subtitle={`${summary?.range ? `${String(summary.range.from).slice(0, 10)} → ${String(summary.range.to).slice(0, 10)}` : ''}`} />
        <Table minWidth={480}>
          <THead>
            <tr>
              <Th>Period</Th>
              <Th align="right">Clicks</Th>
              <Th align="right">Conversions</Th>
              <Th align="right">CR</Th>
              <Th align="right">Earnings</Th>
            </tr>
          </THead>
          <tbody>
            {loading && !summary ? (
              <TableSkeleton rows={3} cols={5} />
            ) : summary?.rows.length ? (
              summary.rows.map((r) => (
                <Tr key={r.date}>
                  <Td className="font-semibold text-ink-900">{r.date}</Td>
                  <Td align="right" className="tabular-nums">{formatNumber(r.clicks)}</Td>
                  <Td align="right" className="tabular-nums">{formatNumber(r.conversions)}</Td>
                  <Td align="right" className="tabular-nums">{formatPercent(r.clicks ? (r.conversions / r.clicks) * 100 : 0)}</Td>
                  <Td align="right" className="font-bold text-emerald-600 tabular-nums">{formatCurrency(r.revenue)}</Td>
                </Tr>
              ))
            ) : (
              <TableEmpty colSpan={5} title="No traffic in this range" description="Pick a wider date range or another offer." />
            )}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardHeader
          title="Click-level report"
          subtitle={detailed ? `${formatNumber(detailed.total)} clicks` : ''}
          actions={
            <>
              <Select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="w-28">
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </Select>
              <Button size="sm" variant="secondary" icon={Columns3} onClick={() => setColumnsOpen(true)}>
                Columns
              </Button>
            </>
          }
        />
        <Table minWidth={Math.max(720, shownColumns.length * 120)}>
          <THead>
            <tr>
              {shownColumns.map((k) => (
                <Th key={k}>{labels[k]}</Th>
              ))}
            </tr>
          </THead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={6} cols={shownColumns.length || 6} />
            ) : detailed?.rows.length ? (
              detailed.rows.map((r) => (
                <Tr key={r.id}>
                  {shownColumns.map((k) => (
                    <Td key={k} className="whitespace-nowrap">
                      {cellValue(r, k)}
                    </Td>
                  ))}
                </Tr>
              ))
            ) : (
              <TableEmpty colSpan={shownColumns.length || 1} title="No clicks found" description="Clicks on your tracking links appear here within seconds." />
            )}
          </tbody>
        </Table>
        {detailed && <Pagination page={page} totalPages={detailed.totalPages} total={detailed.total} onChange={setPage} />}
      </Card>

      {columnsOpen && (
        <ColumnsModal
          labels={labels}
          visible={visible || {}}
          onClose={() => setColumnsOpen(false)}
          onSave={(next) => {
            saveColumns(next);
            setColumnsOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ColumnsModal({ labels, visible, onClose, onSave }) {
  const [draft, setDraft] = useState(visible);
  const keys = Object.keys(labels);
  return (
    <Modal
      title="Choose columns"
      description="Applies to the table and to CSV / Excel / PDF exports."
      icon={Columns3}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(draft)}>Save columns</Button>
        </>
      }
    >
      <div className="mb-4 flex gap-2">
        <Button size="xs" variant="soft" onClick={() => setDraft(Object.fromEntries(keys.map((k) => [k, true])))}>
          Select all
        </Button>
        <Button size="xs" variant="ghost" onClick={() => setDraft({ click_id: true })}>
          Clear
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {keys.map((k) => (
          <label key={k} className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-700 ring-1 ring-line transition hover:bg-slate-50">
            <Checkbox checked={!!draft[k]} onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.checked }))} />
            <span className="truncate">{labels[k]}</span>
            {EXPORT_ONLY.has(k) && <span className="ml-auto text-[10px] font-semibold text-ink-400">export</span>}
          </label>
        ))}
      </div>
    </Modal>
  );
}
