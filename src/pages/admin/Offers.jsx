import { useEffect, useState } from 'react';
import { Megaphone, Pencil, Plus, ShieldCheck, Trash2, Zap } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import OfferFormModal from '../../components/OfferFormModal';
import OfferThumb from '../../components/OfferThumb';
import { Badge, Button, Card, PageHeader, Pagination, Segmented, Table, TableEmpty, TableSkeleton, Td, Th, THead, Tr, useConfirm, useToast } from '../../components/ui';
import { cn, errorMessage, formatCurrency } from '../../utils/format';

const STATUS_STYLES = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  paused: 'bg-slate-100 text-slate-700 ring-slate-200',
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
};

// sadmin/offers.php: paginated offer list (10/page) with status filter,
// create / edit (events diffed server-side), quick status switch, delete.
export default function AdminOffers() {
  usePageTitle('Offers');
  const toast = useToast();
  const confirm = useConfirm();
  const [offers, setOffers] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [status, setStatus] = useState('');
  const [modalOffer, setModalOffer] = useState(undefined); // undefined closed, null create, object edit

  async function load(page = 1) {
    const { data } = await apiClient.get('/admin/offers', { params: { status: status || undefined, page } });
    setOffers(data.offers);
    setPagination(data.pagination);
  }

  useEffect(() => {
    setOffers(null);
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function handleSubmit(payload) {
    if (modalOffer) await apiClient.put(`/admin/offers/${modalOffer.id}`, payload);
    else await apiClient.post('/admin/offers', payload);
    toast.success(modalOffer ? 'Offer updated' : 'Offer created');
    setModalOffer(undefined);
    load(pagination.page).catch(() => {});
  }

  async function changeStatus(offer, next) {
    try {
      await apiClient.patch(`/admin/offers/${offer.id}/status`, { status: next });
      setOffers((list) => list.map((o) => (o.id === offer.id ? { ...o, status: next } : o)));
      toast.success(`"${offer.name}" is now ${next}`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function handleDelete(offer) {
    const ok = await confirm({
      title: `Delete "${offer.name}"?`,
      message: 'This also deletes its events and every conversion recorded against them. This cannot be undone.',
      confirmLabel: 'Delete offer',
    });
    if (!ok) return;
    try {
      await apiClient.delete(`/admin/offers/${offer.id}`);
      toast.success('Offer deleted');
      await load(pagination.page);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Offers"
        subtitle="Advertiser offers, their payable events and who can promote them."
        actions={
          <Button icon={Plus} onClick={() => setModalOffer(null)}>
            New offer
          </Button>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <Segmented
            value={status}
            onChange={setStatus}
            options={[
              { value: '', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'paused', label: 'Paused' },
              { value: 'pending', label: 'Private' },
            ]}
          />
          {pagination.total !== undefined && <p className="text-xs text-ink-500">{pagination.total} offers</p>}
        </div>
        <Table minWidth={920}>
          <THead>
            <tr>
              <Th>Offer</Th>
              <Th>Type</Th>
              <Th>Events</Th>
              <Th align="right">Payout</Th>
              <Th>Access</Th>
              <Th>Status</Th>
              <Th align="right" />
            </tr>
          </THead>
          <tbody>
            {!offers ? (
              <TableSkeleton rows={6} cols={7} />
            ) : offers.length === 0 ? (
              <TableEmpty colSpan={7} icon={Megaphone} title="No offers found" description="Create an offer to start sending traffic." />
            ) : (
              offers.map((offer) => {
                const events = offer.OfferEvents || [];
                const total = events.reduce((s, e) => s + Number(e.payoutAmount), 0);
                return (
                  <Tr key={offer.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <OfferThumb offer={offer} />
                        <div className="min-w-0">
                          <p className="max-w-[240px] truncate font-bold text-ink-900">{offer.name}</p>
                          <p className="text-xs text-ink-500">
                            #{offer.id} · {offer.category || 'General'}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Badge tone="brand">{offer.payoutType}</Badge>
                    </Td>
                    <Td>
                      <div className="flex max-w-[220px] flex-wrap gap-1">
                        {events.slice(0, 3).map((e) => (
                          <span key={e.id} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-ink-700">
                            {e.eventName}
                          </span>
                        ))}
                        {events.length > 3 && <span className="text-[11px] text-ink-400">+{events.length - 3}</span>}
                      </div>
                    </Td>
                    <Td align="right" className="font-bold text-ink-900 tabular-nums">
                      {formatCurrency(total)}
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {offer.autoApprovalEnabled ? (
                          <Badge tone="success">
                            <Zap className="h-3 w-3" /> Auto
                          </Badge>
                        ) : (
                          <Badge tone="neutral">Manual</Badge>
                        )}
                        {!!offer.ipWhitelistEnabled && (
                          <Badge tone="violet">
                            <ShieldCheck className="h-3 w-3" /> IP lock
                          </Badge>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <select
                        value={offer.status}
                        onChange={(e) => changeStatus(offer, e.target.value)}
                        aria-label="Change status"
                        className={cn('cursor-pointer appearance-none rounded-full border-0 px-3 py-1 text-xs font-bold capitalize ring-1 ring-inset focus:ring-2 focus:ring-brand-500', STATUS_STYLES[offer.status])}
                      >
                        <option value="active">active</option>
                        <option value="paused">paused</option>
                        <option value="pending">pending</option>
                      </select>
                    </Td>
                    <Td align="right" className="whitespace-nowrap">
                      <Button size="icon-sm" variant="ghost" icon={Pencil} onClick={() => setModalOffer(offer)} aria-label="Edit offer" />
                      <Button size="icon-sm" variant="ghost" className="hover:text-rose-600" icon={Trash2} onClick={() => handleDelete(offer)} aria-label="Delete offer" />
                    </Td>
                  </Tr>
                );
              })
            )}
          </tbody>
        </Table>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onChange={(p) => load(p)} />
      </Card>

      {modalOffer !== undefined && <OfferFormModal offer={modalOffer} onClose={() => setModalOffer(undefined)} onSubmit={handleSubmit} />}
    </div>
  );
}
