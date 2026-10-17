import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Lock, Megaphone, Search, SlidersHorizontal, XCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import OfferThumb from '../../components/OfferThumb';
import { Badge, Button, Card, EmptyState, Input, PageHeader, Segmented, Select, Skeleton, useToast } from '../../components/ui';
import { errorMessage, formatCurrency } from '../../utils/format';

// publisher/offers.php: active + pending offers with category / payout
// type / search filters and request-access (auto-approval aware).
export default function PublisherOffers() {
  usePageTitle('Offers');
  const toast = useToast();
  const [offers, setOffers] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [payoutType, setPayoutType] = useState('');
  const [access, setAccess] = useState('all');
  const [busyId, setBusyId] = useState(null);

  async function load() {
    const { data } = await apiClient.get('/publisher/offers');
    setOffers(data.offers);
  }

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(() => [...new Set((offers || []).map((o) => o.category).filter(Boolean))].sort(), [offers]);
  const payoutTypes = useMemo(() => [...new Set((offers || []).map((o) => o.payoutType).filter(Boolean))].sort(), [offers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (offers || []).filter((o) => {
      if (category && o.category !== category) return false;
      if (payoutType && o.payoutType !== payoutType) return false;
      if (q && !`${o.name} ${o.description || ''}`.toLowerCase().includes(q)) return false;
      if (access === 'available' && !o.canAccess) return false;
      if (access === 'pending' && o.requestStatus !== 'requested') return false;
      if (access === 'locked' && (o.canAccess || o.requestStatus === 'requested')) return false;
      return true;
    });
  }, [offers, search, category, payoutType, access]);

  const counts = useMemo(() => {
    const list = offers || [];
    return {
      all: list.length,
      available: list.filter((o) => o.canAccess).length,
      pending: list.filter((o) => o.requestStatus === 'requested').length,
      locked: list.filter((o) => !o.canAccess && o.requestStatus !== 'requested').length,
    };
  }, [offers]);

  async function requestOffer(offer) {
    setBusyId(offer.id);
    try {
      const { data } = await apiClient.post(`/publisher/offers/${offer.id}/request`);
      toast.success(data.message);
      await load();
    } catch (err) {
      toast.error(errorMessage(err, 'Request failed'));
    } finally {
      setBusyId(null);
    }
  }

  const hasFilters = search || category || payoutType || access !== 'all';

  return (
    <div>
      <PageHeader eyebrow="Monetize" title="Offer marketplace" subtitle="Find high-converting offers, request access, and grab your tracking link." />

      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Input icon={Search} placeholder="Search offers by name or description…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
          <div className="grid grid-cols-2 gap-3 lg:flex">
            <Select value={category} onChange={(e) => setCategory(e.target.value)} className="lg:w-48">
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select value={payoutType} onChange={(e) => setPayoutType(e.target.value)} className="lg:w-40">
              <option value="">All payout types</option>
              {payoutTypes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Segmented
            value={access}
            onChange={setAccess}
            options={[
              { value: 'all', label: 'All', count: counts.all },
              { value: 'available', label: 'Ready to promote', count: counts.available },
              { value: 'pending', label: 'Pending approval', count: counts.pending },
              { value: 'locked', label: 'Request access', count: counts.locked },
            ]}
          />
          {hasFilters && (
            <Button
              size="sm"
              variant="ghost"
              icon={SlidersHorizontal}
              onClick={() => {
                setSearch('');
                setCategory('');
                setPayoutType('');
                setAccess('all');
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </Card>

      {!offers ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={Megaphone} title="No offers match" description="Try a different search or clear the filters to see every offer." />
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((offer) => (
            <OfferCard key={offer.id} offer={offer} busy={busyId === offer.id} onRequest={() => requestOffer(offer)} />
          ))}
        </div>
      )}
    </div>
  );
}

function OfferCard({ offer, busy, onRequest }) {
  const eventCount = offer.OfferEvents?.length || 0;
  let cta;
  if (offer.canAccess) {
    cta = (
      <Button to={`/publisher/offers/${offer.id}`} className="w-full" iconRight={ArrowRight}>
        Get tracking link
      </Button>
    );
  } else if (offer.requestStatus === 'requested') {
    cta = (
      <Button variant="soft" className="w-full" disabled icon={Clock}>
        Awaiting approval
      </Button>
    );
  } else if (offer.requestStatus === 'rejected') {
    cta = (
      <Button variant="danger-soft" className="w-full" disabled icon={XCircle}>
        Request declined
      </Button>
    );
  } else {
    cta = (
      <Button variant="secondary" className="w-full" loading={busy} icon={Lock} onClick={onRequest}>
        Request access
      </Button>
    );
  }

  return (
    <Card hover className="group flex flex-col overflow-hidden">
      <div className="relative h-24 bg-gradient-to-br from-brand-600 via-brand-500 to-accent-600">
        <div className="bg-grid absolute inset-0 opacity-40" />
        {offer.image && <img src={offer.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" onError={(e) => e.currentTarget.remove()} />}
        <div className="absolute top-3 right-3 flex gap-1.5">
          <Badge tone="neutral" className="bg-white/90 ring-white/60 backdrop-blur">
            {offer.payoutType}
          </Badge>
          {offer.status === 'pending' && (
            <Badge tone="warning" className="bg-amber-50/95">
              Private
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 pt-0">
        <div className="relative z-10 -mt-7 mb-3">
          <span className="inline-block rounded-2xl bg-white p-1 shadow-card">
            <OfferThumb offer={offer} size="lg" />
          </span>
        </div>
        <Link to={`/publisher/offers/${offer.id}`} className="text-base font-extrabold tracking-tight text-ink-900 hover:text-brand-700">
          {offer.name}
        </Link>
        <p className="mt-0.5 text-xs font-semibold text-ink-500">{offer.category || 'General'}</p>
        <p className="mt-3 line-clamp-2 min-h-10 text-sm text-ink-500">{offer.description || 'No description provided.'}</p>
        <div className="mt-4 flex items-end justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-line/70">
          <div>
            <p className="text-[11px] font-semibold text-ink-500">Total payout</p>
            <p className="text-xl font-extrabold text-ink-900 tabular-nums">{formatCurrency(offer.totalPayout)}</p>
          </div>
          <p className="text-xs text-ink-500">
            {eventCount} event{eventCount === 1 ? '' : 's'}
          </p>
        </div>
        <div className="mt-4">{cta}</div>
      </div>
    </Card>
  );
}
