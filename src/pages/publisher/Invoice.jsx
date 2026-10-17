import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import { BrandMark } from '../../layouts/AppShell';
import { BRAND } from '../../config/brand';
import { Button, PageSkeleton, StatusBadge } from '../../components/ui';
import { formatCurrency, formatDateTime } from '../../utils/format';

// publisher/invoice.php — printable receipt for one withdrawal request.
export default function Invoice() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  usePageTitle(`Invoice WD-${id}`);

  useEffect(() => {
    apiClient.get(`/publisher/wallet/withdrawals/${id}/invoice`).then(({ data }) => setInvoice(data));
  }, [id]);

  if (!invoice) return <PageSkeleton />;
  const { withdrawal, user } = invoice;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-5 flex items-center justify-between">
        <Link to="/publisher/wallet" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Wallet
        </Link>
        <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
          Print / save PDF
        </Button>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-line print:shadow-none print:ring-0">
        <div className="flex flex-wrap items-start justify-between gap-6 bg-sidebar px-8 py-8 text-white print:bg-white print:text-ink-900">
          <div>
            <BrandMark />
            <p className="mt-3 text-xs text-slate-400">{BRAND.address}</p>
            <p className="text-xs text-slate-400">{BRAND.email}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">Withdrawal invoice</p>
            <p className="mt-1 font-mono text-2xl font-extrabold">WD-{withdrawal.id}</p>
            <div className="mt-2">
              <StatusBadge status={withdrawal.status} />
            </div>
          </div>
        </div>

        <div className="grid gap-8 px-8 py-8 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold tracking-wider text-ink-400 uppercase">Billed to</p>
            <p className="mt-2 text-base font-extrabold text-ink-900">{user.name}</p>
            {user.companyName && <p className="text-sm text-ink-500">{user.companyName}</p>}
            <p className="text-sm text-ink-500">{user.email}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] font-bold tracking-wider text-ink-400 uppercase">Dates</p>
            <p className="mt-2 text-sm text-ink-700">
              Requested <span className="font-semibold text-ink-900">{formatDateTime(withdrawal.createdAt)}</span>
            </p>
            {withdrawal.processedAt && (
              <p className="text-sm text-ink-700">
                Processed <span className="font-semibold text-ink-900">{formatDateTime(withdrawal.processedAt)}</span>
              </p>
            )}
          </div>
        </div>

        <div className="mx-8 overflow-hidden rounded-2xl ring-1 ring-line">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold tracking-wider text-ink-500 uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Description</th>
                <th className="px-5 py-3 text-left">Method</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-line">
                <td className="px-5 py-4">
                  <p className="font-semibold text-ink-900">Publisher earnings withdrawal</p>
                  <p className="mt-0.5 text-xs break-all text-ink-500">{withdrawal.details}</p>
                </td>
                <td className="px-5 py-4 uppercase">{withdrawal.method}</td>
                <td className="px-5 py-4 text-right font-bold tabular-nums">{formatCurrency(withdrawal.amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end px-8 py-6">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-ink-500">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(withdrawal.amount)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold text-ink-900">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(withdrawal.amount)}</span>
            </div>
          </div>
        </div>

        {withdrawal.notes && (
          <div className="mx-8 mb-8 rounded-2xl bg-slate-50 px-5 py-4 text-sm ring-1 ring-line">
            <p className="text-[11px] font-bold tracking-wider text-ink-400 uppercase">Notes from the team</p>
            <p className="mt-1 text-ink-700">{withdrawal.notes}</p>
          </div>
        )}

        <p className="border-t border-line px-8 py-5 text-center text-xs text-ink-400">Thank you for partnering with {BRAND.name}. This is a system-generated invoice.</p>
      </div>
    </div>
  );
}
