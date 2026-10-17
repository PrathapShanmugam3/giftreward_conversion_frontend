import { useEffect, useState } from 'react';
import { BarChart3, Gift, Pause, Pencil, Play, Plus, Rocket, Share2, Trash2, Users } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import CampaignFormModal from '../../components/CampaignFormModal';
import OfferThumb from '../../components/OfferThumb';
import { Alert, Button, Card, CopyField, EmptyState, PageHeader, Skeleton, StatusBadge, useConfirm, useToast } from '../../components/ui';
import { errorMessage, formatCurrency, formatDate } from '../../utils/format';

function cashbackTotals(campaign) {
  try {
    const config = JSON.parse(campaign.eventConfig || '{}');
    return Object.values(config).reduce(
      (acc, e) => ({ user: acc.user + Number(e.user_cashback || 0), referral: acc.referral + Number(e.referral_cashback || 0) }),
      { user: 0, referral: 0 }
    );
  } catch {
    return { user: 0, referral: 0 };
  }
}

// publisher/create-camp.php + edit-campaign / toggle / delete: cashback
// campaigns built on an offer, each with a public landing link (/o) and an
// optional referral link (/refer).
export default function PublisherCampaigns() {
  usePageTitle('Campaigns');
  const toast = useToast();
  const confirm = useConfirm();
  const [campaigns, setCampaigns] = useState(null);
  const [offers, setOffers] = useState([]);
  const [modalCampaign, setModalCampaign] = useState(undefined);

  async function load() {
    const [campaignsRes, offersRes] = await Promise.all([apiClient.get('/publisher/campaigns'), apiClient.get('/publisher/offers')]);
    setCampaigns(campaignsRes.data.campaigns);
    setOffers(offersRes.data.offers.filter((o) => o.canAccess));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(payload) {
    if (modalCampaign) await apiClient.put(`/publisher/campaigns/${modalCampaign.id}`, payload);
    else await apiClient.post('/publisher/campaigns', payload);
    toast.success(modalCampaign ? 'Campaign updated' : 'Campaign created — your links are ready');
    setModalCampaign(undefined);
    await load();
  }

  async function toggleStatus(campaign) {
    const next = campaign.status === 'active' ? 'paused' : 'active';
    try {
      await apiClient.post(`/publisher/campaigns/${campaign.id}/status`, { status: next });
      toast.success(`Campaign ${next === 'active' ? 'activated' : 'paused'}`);
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function handleDelete(campaign) {
    const ok = await confirm({ title: 'Delete campaign?', message: `The landing and referral links for "${campaign.Offer?.name}" will stop being listed here.`, confirmLabel: 'Delete campaign' });
    if (!ok) return;
    try {
      await apiClient.delete(`/publisher/campaigns/${campaign.id}`);
      toast.success('Campaign deleted');
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Monetize"
        title="Cashback campaigns"
        subtitle="Wrap an offer in a branded landing page that collects name, mobile and UPI — then share cashback with your users."
        actions={
          <Button icon={Plus} onClick={() => setModalCampaign(null)} disabled={offers.length === 0}>
            New campaign
          </Button>
        }
      />

      {campaigns && offers.length === 0 && (
        <Alert tone="warning" className="mb-6">
          You need access to at least one offer before you can create a campaign. Request one from the offer marketplace.
        </Alert>
      )}

      {!campaigns ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <EmptyState
            icon={Rocket}
            title="No campaigns yet"
            description="Create your first cashback campaign to get a shareable landing page."
            action={
              offers.length > 0 && (
                <Button icon={Plus} onClick={() => setModalCampaign(null)}>
                  Create campaign
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {campaigns.map((c) => {
            const totals = cashbackTotals(c);
            return (
              <Card key={c.id} hover className="flex flex-col">
                <div className="flex items-start gap-4 p-5">
                  <OfferThumb offer={c.Offer || { name: '?' }} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-extrabold tracking-tight text-ink-900">{c.Offer?.name}</h2>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-ink-400">ID {c.campaignId}</p>
                    <p className="mt-0.5 text-xs text-ink-500">Created {formatDate(c.createdAt)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 px-5">
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                      <Gift className="h-3.5 w-3.5" /> User cashback
                    </p>
                    <p className="mt-0.5 text-lg font-extrabold text-emerald-800 tabular-nums">{formatCurrency(totals.user)}</p>
                  </div>
                  <div className="rounded-2xl bg-violet-50 px-4 py-3 ring-1 ring-violet-100">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-700">
                      <Users className="h-3.5 w-3.5" /> Referral cashback
                    </p>
                    <p className="mt-0.5 text-lg font-extrabold text-violet-800 tabular-nums">{c.referralEnabled ? formatCurrency(totals.referral) : 'Off'}</p>
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <p className="mb-1.5 text-[11px] font-bold tracking-wider text-ink-400 uppercase">Landing page</p>
                    <CopyField value={c.campaignLink} />
                  </div>
                  {!!c.referralEnabled && (
                    <div>
                      <p className="mb-1.5 text-[11px] font-bold tracking-wider text-ink-400 uppercase">Referral page</p>
                      <CopyField value={c.referralLink} />
                    </div>
                  )}
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-1 border-t border-line px-3 py-2.5">
                  <Button size="sm" variant="ghost" icon={BarChart3} to={`/publisher/campaigns/${c.id}/stats`}>
                    Stats
                  </Button>
                  <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setModalCampaign(c)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" icon={c.status === 'active' ? Pause : Play} onClick={() => toggleStatus(c)}>
                    {c.status === 'active' ? 'Pause' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="ghost" icon={Share2} href={`https://wa.me/?text=${encodeURIComponent(c.campaignLink)}`} target="_blank" rel="noreferrer">
                    Share
                  </Button>
                  <Button size="sm" variant="ghost" className="ml-auto hover:text-rose-600" icon={Trash2} onClick={() => handleDelete(c)}>
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {modalCampaign !== undefined && (
        <CampaignFormModal campaign={modalCampaign} offers={offers} onClose={() => setModalCampaign(undefined)} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
