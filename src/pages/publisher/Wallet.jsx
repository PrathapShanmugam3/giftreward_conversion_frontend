import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Banknote, FileText, Send, Wallet as WalletIcon } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import {
  Alert,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Input,
  PageHeader,
  PageSkeleton,
  StatusBadge,
  Table,
  TableEmpty,
  Td,
  Th,
  THead,
  Tr,
  useToast,
} from '../../components/ui';
import { cn, errorMessage, formatCurrency, formatDate, formatDateTime } from '../../utils/format';

// publisher/wallet.php: balance, withdrawal request, last 10 transactions
// and the full withdrawal history (each with an invoice).
export default function PublisherWallet() {
  usePageTitle('Wallet');
  const toast = useToast();
  const [overview, setOverview] = useState(null);
  const [form, setForm] = useState({ amount: '', method: 'bank', accountNumber: '', ifsc: '', accountHolder: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const { data } = await apiClient.get('/publisher/wallet');
    setOverview(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const details = `Account Number: ${form.accountNumber.trim()} | IFSC: ${form.ifsc.trim().toUpperCase()} | Account Holder: ${form.accountHolder.trim()}`;
      const { data } = await apiClient.post('/publisher/wallet/withdrawals', { amount: form.amount, method: 'bank', details });
      toast.success(data.message || 'Withdrawal requested');
      setForm({ amount: '', method: 'bank', accountNumber: '', ifsc: '', accountHolder: '' });
      await load();
    } catch (err) {
      setError(errorMessage(err, 'Request failed'));
    } finally {
      setSubmitting(false);
    }
  }

  if (!overview) return <PageSkeleton />;

  const balance = Number(overview.walletBalance);
  const pendingTotal = overview.withdrawals.filter((w) => w.status === 'pending').reduce((s, w) => s + Number(w.amount), 0);
  const paidTotal = overview.withdrawals.filter((w) => w.status === 'paid').reduce((s, w) => s + Number(w.amount), 0);
  const blockedReason = !overview.withdrawalsEnabled
    ? 'Withdrawals are temporarily disabled by the administrator.'
    : !overview.withdrawalStatus
      ? 'Withdrawals are disabled for your account. Contact support for help.'
      : '';

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Earnings" title="Wallet & payouts" subtitle="Your approved earnings land here. Withdraw by bank transfer." />

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-3">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 p-7 text-white shadow-pop">
            <div className="bg-grid absolute inset-0 opacity-40" />
            <div className="absolute -top-20 -right-10 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-semibold text-brand-100">
                  <WalletIcon className="h-4 w-4" /> Available balance
                </p>
                <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wider uppercase ring-1 ring-white/20">INR</span>
              </div>
              <p className="mt-3 text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">{formatCurrency(balance)}</p>
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/15 pt-5 text-sm">
                <div>
                  <p className="text-xs text-brand-100">In review</p>
                  <p className="mt-0.5 font-bold tabular-nums">{formatCurrency(pendingTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-100">Paid out</p>
                  <p className="mt-0.5 font-bold tabular-nums">{formatCurrency(paidTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-100">Minimum</p>
                  <p className="mt-0.5 font-bold tabular-nums">{formatCurrency(overview.minimumWithdrawal)}</p>
                </div>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader title="Recent transactions" subtitle="Last 10 wallet movements" />
            {overview.transactions.length === 0 ? (
              <EmptyState icon={Banknote} title="No transactions yet" description="Credits from conversions and withdrawals will be listed here." />
            ) : (
              <ul className="divide-y divide-line">
                {overview.transactions.map((t) => {
                  const credit = t.type === 'credit';
                  return (
                    <li key={t.id} className="flex items-center gap-3 px-5 py-3.5">
                      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', credit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
                        {credit ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink-900">{t.reason}</p>
                        <p className="text-xs text-ink-500">{formatDateTime(t.createdAt)}</p>
                      </div>
                      <span className={cn('text-sm font-extrabold tabular-nums', credit ? 'text-emerald-600' : 'text-rose-600')}>
                        {credit ? '+' : '−'}
                        {formatCurrency(t.amount)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <Card className="h-fit xl:col-span-2">
          <CardHeader title="Request a withdrawal" subtitle="Payouts are reviewed and processed by our team." icon={Send} />
          <form onSubmit={handleSubmit} className="space-y-5 p-5">
            {blockedReason && <Alert tone="warning">{blockedReason}</Alert>}
            {error && <Alert tone="danger">{error}</Alert>}
            <Field label="Amount" required hint={`Minimum ${formatCurrency(overview.minimumWithdrawal)} · Available ${formatCurrency(balance)}`}>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-bold text-ink-400">₹</span>
                <Input
                  type="number"
                  step="0.01"
                  min={overview.minimumWithdrawal || 0.01}
                  max={balance}
                  required
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="pl-8 text-base font-bold"
                  disabled={!!blockedReason}
                />
              </div>
              <button type="button" className="mt-2 text-xs font-bold text-brand-600 hover:text-brand-700 disabled:opacity-50" disabled={!!blockedReason} onClick={() => setForm((f) => ({ ...f, amount: balance.toFixed(2) }))}>
                Withdraw full balance
              </button>
            </Field>
            <Field label="Account number" required><Input required inputMode="numeric" pattern="[0-9]{6,20}" placeholder="Bank account number" value={form.accountNumber} onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 20) }))} disabled={!!blockedReason} /></Field>
            <Field label="IFSC" required><Input required maxLength={11} pattern="[A-Za-z]{4}0[A-Za-z0-9]{6}" placeholder="ABCD0123456" value={form.ifsc} onChange={(e) => setForm((f) => ({ ...f, ifsc: e.target.value.toUpperCase() }))} disabled={!!blockedReason} /></Field>
            <Field label="Account holder name" required><Input required maxLength={100} placeholder="Name on bank account" value={form.accountHolder} onChange={(e) => setForm((f) => ({ ...f, accountHolder: e.target.value }))} disabled={!!blockedReason} /></Field>
            <Button type="submit" size="lg" className="w-full" loading={submitting} disabled={!!blockedReason} icon={Send}>
              Request withdrawal
            </Button>
          </form>
        </Card>
      </div>

      <Card>
        <CardHeader title="Withdrawal history" subtitle={`${overview.withdrawals.length} request${overview.withdrawals.length === 1 ? '' : 's'}`} />
        <Table minWidth={720}>
          <THead>
            <tr>
              <Th>Request</Th>
              <Th>Method</Th>
              <Th>Details</Th>
              <Th>Requested</Th>
              <Th>Status</Th>
              <Th align="right">Amount</Th>
              <Th align="right" />
            </tr>
          </THead>
          <tbody>
            {overview.withdrawals.length === 0 ? (
              <TableEmpty colSpan={7} title="No withdrawals yet" description="Your payout requests and their status will appear here." />
            ) : (
              overview.withdrawals.map((w) => (
                <Tr key={w.id}>
                  <Td className="font-mono text-xs font-semibold text-ink-900">WD-{w.id}</Td>
                  <Td className="uppercase">{w.method}</Td>
                  <Td className="max-w-[220px] truncate" title={w.details}>
                    {w.details}
                  </Td>
                  <Td className="whitespace-nowrap text-ink-500">{formatDate(w.createdAt)}</Td>
                  <Td>
                    <StatusBadge status={w.status} />
                  </Td>
                  <Td align="right" className="font-extrabold text-ink-900 tabular-nums">
                    {formatCurrency(w.amount)}
                  </Td>
                  <Td align="right">
                    <Button size="xs" variant="ghost" icon={FileText} to={`/publisher/wallet/withdrawals/${w.id}/invoice`}>
                      Invoice
                    </Button>
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
