import { useEffect, useState } from 'react';
import { ArrowRight, Banknote, BarChart3, CheckCircle2, IndianRupee, Megaphone, MousePointerClick, Plus, Trophy, Users } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import TrendChart from '../../components/charts/TrendChart';
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, PageHeader, PageSkeleton, StatCard } from '../../components/ui';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/format';

function formatMonth(ym) {
  const [year, month] = String(ym).split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

// sadmin/index.php: network totals, today's figures, 6-month revenue / CR,
// recent conversions and top offers by revenue.
export default function AdminDashboard() {
  usePageTitle('Admin dashboard');
  const [data, setData] = useState(null);

  useEffect(() => {
    apiClient.get('/admin/dashboard').then(({ data: res }) => setData(res));
  }, []);

  if (!data) return <PageSkeleton />;

  const chartData = data.revenueData.map((r) => ({ label: formatMonth(r.month), revenue: Number(r.revenue) || 0, cr: Number(r.cr) || 0 }));
  const maxRevenue = Math.max(1, ...data.topOffers.map((o) => Number(o.revenue) || 0));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Network dashboard"
        subtitle="Live totals across every publisher, offer and payout."
        actions={
          <>
            <Button to="/admin/withdrawals" variant="secondary" icon={Banknote}>
              Withdrawals
              {data.pendingWithdrawals > 0 && <span className="rounded-full bg-amber-100 px-1.5 text-[11px] font-bold text-amber-800">{data.pendingWithdrawals}</span>}
            </Button>
            <Button to="/admin/offers" icon={Plus}>
              New offer
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Publishers"
          value={formatNumber(data.usersCount)}
          icon={Users}
          tone="brand"
          footer={<FooterLink to="/admin/publishers" label="Manage publishers" />}
        />
        <StatCard label="Active offers" value={formatNumber(data.offersCount)} icon={Megaphone} tone="success" footer={<FooterLink to="/admin/offers" label="Manage offers" />} />
        <StatCard
          label="Clicks today"
          value={formatNumber(data.todayClicks)}
          sub={`${formatNumber(data.clicksCount)} all time`}
          icon={MousePointerClick}
          tone="info"
          footer={<FooterLink to="/admin/reports" label="Click reports" />}
        />
        <StatCard
          label="Conversions today"
          value={formatNumber(data.todayConversions)}
          sub={`${formatNumber(data.conversionsCount)} approved all time`}
          icon={CheckCircle2}
          tone="warning"
          footer={
            <div>
              <div className="mb-1.5 flex justify-between text-ink-500">
                <span>Today's conversion rate</span>
                <span className="font-bold text-ink-900">{formatPercent(data.todayConversionRate)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${Math.min(100, data.todayConversionRate)}%` }} />
              </div>
            </div>
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Performance" subtitle="Last 6 months" icon={BarChart3} />
          <div className="p-5">
            <TrendChart
              kind="bar"
              data={chartData}
              series={[
                { key: 'revenue', label: 'Revenue', format: formatCurrency, axisFormat: (v) => `₹${formatNumber(v)}` },
                { key: 'cr', label: 'Conversion rate', format: (v) => formatPercent(v), axisFormat: (v) => `${v}%` },
              ]}
              emptyText="No revenue recorded in the last 6 months."
            />
          </div>
        </Card>

        <div className="relative overflow-hidden rounded-2xl bg-sidebar p-6 text-white shadow-pop">
          <div className="bg-grid absolute inset-0 opacity-40" />
          <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-brand-600/50 blur-3xl" />
          <div className="relative">
            <p className="text-sm font-semibold text-slate-300">Total network revenue</p>
            <p className="mt-2 text-4xl font-extrabold tracking-tight tabular-nums">{formatCurrency(data.revenue)}</p>
            <div className="mt-6 space-y-3">
              {[
                { icon: CheckCircle2, label: 'Approved conversions', value: formatNumber(data.conversionsCount), cls: 'bg-emerald-400/15 text-emerald-300' },
                { icon: MousePointerClick, label: 'Total clicks', value: formatNumber(data.clicksCount), cls: 'bg-sky-400/15 text-sky-300' },
                { icon: Banknote, label: 'Pending withdrawals', value: formatNumber(data.pendingWithdrawals), cls: 'bg-amber-400/15 text-amber-300' },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-3 rounded-2xl bg-white/[0.05] px-4 py-3 ring-1 ring-white/[0.08]">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${r.cls}`}>
                    <r.icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="flex-1 text-sm text-slate-300">{r.label}</span>
                  <span className="font-extrabold tabular-nums">{r.value}</span>
                </div>
              ))}
            </div>
            <Button to="/admin/withdrawals" variant="white" className="mt-6 w-full" iconRight={ArrowRight}>
              Review withdrawals
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent conversions"
            icon={IndianRupee}
            actions={
              <Button to="/admin/conversions" size="sm" variant="ghost" iconRight={ArrowRight}>
                View all
              </Button>
            }
          />
          {data.recentConversions.length === 0 ? (
            <EmptyState title="No conversions yet" />
          ) : (
            <ul className="divide-y divide-line">
              {data.recentConversions.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                  <Avatar name={c.publisher || '?'} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-900">{c.publisher}</p>
                    <p className="truncate text-xs text-ink-500">{c.offer}</p>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-600 tabular-nums">{formatCurrency(c.payout)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Top offers by revenue"
            icon={Trophy}
            actions={
              <Button to="/admin/campaign-stats" size="sm" variant="ghost" iconRight={ArrowRight}>
                Offer stats
              </Button>
            }
          />
          {data.topOffers.length === 0 ? (
            <EmptyState title="No data yet" />
          ) : (
            <ul className="divide-y divide-line">
              {data.topOffers.map((o, i) => (
                <li key={o.id} className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-extrabold text-ink-700">#{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-900">{o.name}</p>
                      <p className="text-xs text-ink-500">{formatNumber(o.conversions)} conversions</p>
                    </div>
                    <Badge tone={Number(o.cr) > 5 ? 'success' : 'warning'}>{formatPercent(o.cr || 0)} CR</Badge>
                    <span className="w-24 text-right text-sm font-extrabold text-ink-900 tabular-nums">{formatCurrency(o.revenue)}</span>
                  </div>
                  <div className="mt-2 ml-11 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${(Number(o.revenue) / maxRevenue) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function FooterLink({ to, label }) {
  return (
    <Button to={to} size="xs" variant="ghost" className="-ml-2.5 text-brand-600 hover:text-brand-700" iconRight={ArrowRight}>
      {label}
    </Button>
  );
}
