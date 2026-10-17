import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, Clock, IndianRupee, Megaphone, MousePointerClick, Rocket, Sparkles } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePublisherAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../context/SiteContext';
import TrendChart from '../../components/charts/TrendChart';
import OfferThumb from '../../components/OfferThumb';
import { Badge, Button, Card, CardHeader, EmptyState, PageSkeleton, Segmented, StatCard, StatusBadge } from '../../components/ui';
import { formatCurrency, formatNumber, formatPercent, timeAgo } from '../../utils/format';

const PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7days', label: '7 days' },
  { value: '30days', label: '30 days' },
  { value: 'month', label: 'This month' },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// Mirrors publisher/index.php: period-switchable stats + chart, lifetime
// totals, 5 recent conversions, 5 active offers to promote.
export default function PublisherDashboard() {
  usePageTitle('Dashboard');
  const { user } = usePublisherAuth();
  const [period, setPeriod] = useState('7days');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiClient
      .get('/publisher/dashboard', { params: { period } })
      .then(({ data: res }) => !cancelled && setData(res))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [period]);

  if (!data) return <PageSkeleton />;

  const { stats, lifetime } = data;
  const cr = stats.clicks ? (stats.conversions / stats.clicks) * 100 : 0;
  const lifetimeCr = lifetime.clicks ? (lifetime.conversions / lifetime.clicks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-sidebar p-6 text-white shadow-pop sm:p-8">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-brand-600/50 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-accent-600/30 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-100 ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5" /> Publisher dashboard
            </p>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="mt-1.5 max-w-lg text-sm text-slate-300">Here's how your traffic is performing. Pick an offer, share your link, and watch conversions roll in.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button to="/publisher/offers" size="sm" variant="white" icon={Megaphone}>
                Browse offers
              </Button>
              <Button to="/publisher/campaigns" size="sm" variant="outline-light" icon={Rocket}>
                New campaign
              </Button>
            </div>
          </div>
          <div className="rounded-2xl bg-white/[0.07] p-5 ring-1 ring-white/10 backdrop-blur lg:min-w-[280px]">
            <p className="text-xs font-semibold text-slate-300">Lifetime earnings</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums">{formatCurrency(lifetime.revenue)}</p>
            <div className="mt-3 flex gap-5 text-xs text-slate-300">
              <span>
                <span className="font-bold text-white tabular-nums">{formatNumber(lifetime.conversions)}</span> conversions
              </span>
              <span>
                <span className="font-bold text-white tabular-nums">{formatPercent(lifetimeCr)}</span> CR
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold tracking-tight text-ink-900">Performance</h2>
        <Segmented options={PERIODS} value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clicks" value={formatNumber(stats.clicks)} icon={MousePointerClick} tone="info" loading={loading} />
        <StatCard label="Approved conversions" value={formatNumber(stats.conversions)} sub={`${formatPercent(cr)} conversion rate`} icon={CheckCircle2} tone="success" loading={loading} />
        <StatCard label="Pending conversions" value={formatNumber(stats.pending)} sub="Awaiting review" icon={Clock} tone="warning" loading={loading} />
        <StatCard label="Earnings" value={formatCurrency(stats.revenue)} icon={IndianRupee} tone="brand" loading={loading} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Traffic & earnings"
            subtitle={period === 'today' || period === 'yesterday' ? 'Hourly breakdown' : 'Daily breakdown'}
            icon={BarChart3}
            actions={
              <Button to="/publisher/reports" size="sm" variant="ghost" iconRight={ArrowRight}>
                Full report
              </Button>
            }
          />
          <div className="p-5">
            <TrendChart
              data={data.chart || []}
              series={[
                { key: 'clicks', label: 'Clicks', format: formatNumber },
                { key: 'conversions', label: 'Conversions', format: formatNumber },
                { key: 'earnings', label: 'Earnings', format: formatCurrency, axisFormat: (v) => `₹${v}` },
              ]}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Lifetime totals" subtitle="Since you joined" />
          <div className="divide-y divide-line">
            {[
              { label: 'Total clicks', value: formatNumber(lifetime.clicks), icon: MousePointerClick, cls: 'bg-sky-50 text-sky-600' },
              { label: 'Approved conversions', value: formatNumber(lifetime.conversions), icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-600' },
              { label: 'Pending conversions', value: formatNumber(lifetime.pending), icon: Clock, cls: 'bg-amber-50 text-amber-600' },
              { label: 'Total earnings', value: formatCurrency(lifetime.revenue), icon: IndianRupee, cls: 'bg-brand-50 text-brand-600' },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3 px-5 py-4">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${row.cls}`}>
                  <row.icon className="h-5 w-5" />
                </span>
                <span className="flex-1 text-sm text-ink-500">{row.label}</span>
                <span className="text-sm font-extrabold text-ink-900 tabular-nums">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="p-5 pt-1">
            <Button to="/publisher/wallet" variant="soft" className="w-full" iconRight={ArrowRight}>
              Go to wallet
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent conversions"
            actions={
              <Button to="/publisher/conversions" size="sm" variant="ghost" iconRight={ArrowRight}>
                View all
              </Button>
            }
          />
          {data.recentConversions.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="No conversions yet" description="Once your traffic converts, the latest ones show up here." />
          ) : (
            <ul className="divide-y divide-line">
              {data.recentConversions.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-900">{c.offer}</p>
                    <p className="truncate text-xs text-ink-500">
                      {c.event_name} · {timeAgo(c.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-emerald-600 tabular-nums">+{formatCurrency(c.payout)}</p>
                    <StatusBadge status={c.status} className="mt-1" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Offers to promote"
            subtitle="Latest active offers on the network"
            actions={
              <Button to="/publisher/offers" size="sm" variant="ghost" iconRight={ArrowRight}>
                All offers
              </Button>
            }
          />
          {data.activeOffers.length === 0 ? (
            <EmptyState icon={Megaphone} title="No active offers" description="New offers will appear here as soon as they go live." />
          ) : (
            <ul className="divide-y divide-line">
              {data.activeOffers.map((o) => (
                <li key={o.id}>
                  <Link to={`/publisher/offers/${o.id}`} className="group flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50/70">
                    <OfferThumb offer={o} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-900 group-hover:text-brand-700">{o.name}</p>
                      <p className="truncate text-xs text-ink-500">{o.category || 'General'}</p>
                    </div>
                    <Badge tone="brand">{o.payoutType}</Badge>
                    <ArrowRight className="h-4 w-4 text-ink-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
