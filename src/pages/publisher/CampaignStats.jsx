import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, CheckCircle2, Fingerprint, IndianRupee, MousePointerClick, Users } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import TrendChart from '../../components/charts/TrendChart';
import { Card, CardHeader, EmptyState, PageHeader, PageSkeleton, StatCard, Table, TableEmpty, Td, Th, THead, Tr } from '../../components/ui';
import { formatCurrency, formatDateTime, formatNumber, formatPercent } from '../../utils/format';

// publisher/campaign-stats.php: per-day landing clicks, conversions and
// referrals for one campaign (last 30 active days), plus recent payouts.
export default function CampaignStats() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  usePageTitle('Campaign stats');

  useEffect(() => {
    apiClient.get(`/publisher/campaigns/${id}/stats`).then(({ data }) => setStats(data));
  }, [id]);

  const daily = useMemo(() => {
    if (!stats) return [];
    const byDate = new Map();
    const row = (d) => {
      const key = String(d).slice(0, 10);
      if (!byDate.has(key)) byDate.set(key, { date: key, clicks: 0, unique: 0, conversions: 0, payout: 0, referrals: 0 });
      return byDate.get(key);
    };
    stats.clickStats.forEach((r) => Object.assign(row(r.clickDate), { clicks: Number(r.totalClicks), unique: Number(r.uniqueClicks) }));
    stats.conversionStats.forEach((r) => Object.assign(row(r.conversionDate), { conversions: Number(r.totalConversions), payout: Number(r.totalPayout || 0) }));
    stats.referralStats.forEach((r) => Object.assign(row(r.referralDate), { referrals: Number(r.totalReferrals) }));
    return [...byDate.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((r) => ({ ...r, label: new Date(`${r.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }));
  }, [stats]);

  if (!stats) return <PageSkeleton />;
  const { campaign, totals, recentConversions } = stats;

  return (
    <div className="space-y-6">
      <Link to="/publisher/campaigns" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Campaigns
      </Link>
      <PageHeader eyebrow="Campaign performance" title={campaign.Offer?.name || 'Campaign'} subtitle={`Campaign ID ${campaign.campaignId}`} className="mb-0" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Landing clicks" value={formatNumber(totals.totalClicks)} icon={MousePointerClick} tone="info" />
        <StatCard label="Unique visitors" value={formatNumber(totals.uniqueClicks)} icon={Fingerprint} tone="slate" />
        <StatCard label="Conversions" value={formatNumber(totals.totalConversions)} sub={`${formatPercent(totals.conversionRate)} CR`} icon={CheckCircle2} tone="success" />
        <StatCard label="Cashback paid" value={formatCurrency(totals.totalPayout)} icon={IndianRupee} tone="brand" />
        <StatCard label="Referrals" value={formatNumber(totals.totalReferrals)} icon={Users} tone="warning" />
      </div>

      <Card>
        <CardHeader title="Daily activity" subtitle="Last 30 active days" icon={BarChart3} />
        <div className="p-5">
          <TrendChart
            kind="bar"
            data={daily}
            series={[
              { key: 'clicks', label: 'Clicks', format: formatNumber },
              { key: 'conversions', label: 'Conversions', format: formatNumber },
              { key: 'payout', label: 'Payout', format: formatCurrency, axisFormat: (v) => `₹${v}` },
              { key: 'referrals', label: 'Referrals', format: formatNumber },
            ]}
            emptyText="No landing-page activity recorded for this campaign yet."
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Recent conversions" subtitle="Latest cashback-eligible completions" />
        {recentConversions.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No conversions yet" description="Completed offers from your landing page will show here." />
        ) : (
          <Table minWidth={520}>
            <THead>
              <tr>
                <Th>Visitor</Th>
                <Th>UPI</Th>
                <Th align="right">Amount</Th>
                <Th>Date</Th>
              </tr>
            </THead>
            <tbody>
              {recentConversions.map((c) => (
                <Tr key={c.id}>
                  <Td className="font-semibold text-ink-900">{c.name || '—'}</Td>
                  <Td className="font-mono text-xs">{c.upi}</Td>
                  <Td align="right" className="font-bold text-emerald-600 tabular-nums">
                    {formatCurrency(c.amount)}
                  </Td>
                  <Td className="text-ink-500">{formatDateTime(c.date)}</Td>
                </Tr>
              ))}
              {recentConversions.length === 0 && <TableEmpty colSpan={4} />}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
