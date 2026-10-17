import { useEffect, useMemo, useState } from 'react';
import { Banknote, Check, CheckCircle2, Clock, IndianRupee, X, XCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import {
  Alert,
  Avatar,
  Button,
  Card,
  CopyButton,
  DetailRow,
  Field,
  Modal,
  PageHeader,
  Segmented,
  StatCard,
  StatusBadge,
  Table,
  TableEmpty,
  TableSkeleton,
  Td,
  Textarea,
  Th,
  THead,
  Tr,
  useToast,
} from '../../components/ui';
import { errorMessage, formatCurrency, formatDateTime, formatNumber } from '../../utils/format';

// sadmin/WithdrawalRequest.php: moderate payout requests with notes.
// Rejecting refunds the publisher's wallet (fixed vs legacy) and a request
// can only be resolved once.
export default function AdminWithdrawals() {
  usePageTitle('Withdrawals');
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [all, setAll] = useState([]);
  const [status, setStatus] = useState('pending');
  const [review, setReview] = useState(null); // { withdrawal, action }

  async function load() {
    const [filtered, everything] = await Promise.all([apiClient.get('/admin/withdrawals', { params: { status } }), apiClient.get('/admin/withdrawals', { params: { status: 'all' } })]);
    setRows(filtered.data.withdrawals);
    setAll(everything.data.withdrawals);
  }

  useEffect(() => {
    setRows(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const stats = useMemo(() => {
    const sum = (s) => all.filter((w) => w.status === s).reduce((t, w) => t + Number(w.amount), 0);
    return {
      pendingCount: all.filter((w) => w.status === 'pending').length,
      pending: sum('pending'),
      approved: sum('approved'),
      rejected: all.filter((w) => w.status === 'rejected').length,
    };
  }, [all]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Finance" title="Withdrawal requests" subtitle="Approve payouts after sending them; rejected amounts go straight back to the publisher's wallet." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Awaiting review" value={formatNumber(stats.pendingCount)} icon={Clock} tone="warning" />
        <StatCard label="Pending amount" value={formatCurrency(stats.pending)} icon={IndianRupee} tone="brand" />
        <StatCard label="Paid out" value={formatCurrency(stats.approved)} icon={CheckCircle2} tone="success" />
        <StatCard label="Rejected" value={formatNumber(stats.rejected)} icon={XCircle} tone="danger" />
      </div>

      <Card>
        <div className="border-b border-line p-4">
          <Segmented
            value={status}
            onChange={setStatus}
            options={[
              { value: 'pending', label: 'Pending', count: stats.pendingCount },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'all', label: 'All' },
            ]}
          />
        </div>
        <Table minWidth={1000}>
          <THead>
            <tr>
              <Th>Request</Th>
              <Th>Publisher</Th>
              <Th>Payout to</Th>
              <Th align="right">Amount</Th>
              <Th>Status</Th>
              <Th>Notes</Th>
              <Th align="right">Actions</Th>
            </tr>
          </THead>
          <tbody>
            {!rows ? (
              <TableSkeleton rows={5} cols={7} />
            ) : rows.length === 0 ? (
              <TableEmpty colSpan={7} icon={Banknote} title={status === 'pending' ? 'All caught up' : 'No withdrawals found'} description={status === 'pending' ? 'No payout requests are waiting for review.' : undefined} />
            ) : (
              rows.map((w) => (
                <Tr key={w.id}>
                  <Td>
                    <p className="font-mono text-xs font-bold text-ink-900">WD-{w.id}</p>
                    <p className="text-xs whitespace-nowrap text-ink-500">{formatDateTime(w.createdAt)}</p>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={w.User?.name || '?'} size="sm" />
                      <div className="min-w-0">
                        <p className="max-w-[160px] truncate font-semibold text-ink-900">{w.User?.name}</p>
                        <p className="max-w-[160px] truncate text-xs text-ink-500">{w.User?.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold tracking-wider text-ink-400 uppercase">{w.method}</p>
                        <p className="max-w-[200px] truncate font-mono text-xs text-ink-700" title={w.details}>
                          {w.details}
                        </p>
                      </div>
                      <CopyButton text={w.details} label="" className="px-1.5" />
                    </div>
                  </Td>
                  <Td align="right" className="text-base font-extrabold text-ink-900 tabular-nums">
                    {formatCurrency(w.amount)}
                  </Td>
                  <Td>
                    <StatusBadge status={w.status} />
                    {w.processedAt && <p className="mt-1 text-[11px] whitespace-nowrap text-ink-400">{formatDateTime(w.processedAt)}</p>}
                  </Td>
                  <Td className="max-w-[200px] truncate text-xs text-ink-500" title={w.notes}>
                    {w.notes || '—'}
                  </Td>
                  <Td align="right" className="whitespace-nowrap">
                    {w.status === 'pending' ? (
                      <>
                        <Button size="xs" variant="success-soft" icon={Check} onClick={() => setReview({ withdrawal: w, action: 'approved' })}>
                          Approve
                        </Button>
                        <Button size="xs" variant="danger-soft" icon={X} className="ml-1" onClick={() => setReview({ withdrawal: w, action: 'rejected' })}>
                          Reject
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-ink-400">Resolved</span>
                    )}
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {review && (
        <ReviewModal
          {...review}
          onClose={() => setReview(null)}
          onDone={async () => {
            toast.success(`WD-${review.withdrawal.id} ${review.action}`);
            setReview(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function ReviewModal({ withdrawal, action, onClose, onDone }) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const approve = action === 'approved';

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiClient.post(`/admin/withdrawals/${withdrawal.id}/status`, { status: action, notes });
      await onDone();
    } catch (err) {
      setError(errorMessage(err, 'Update failed'));
      setSaving(false);
    }
  }

  return (
    <Modal
      title={approve ? 'Approve withdrawal' : 'Reject withdrawal'}
      icon={approve ? CheckCircle2 : XCircle}
      size="sm"
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant={approve ? 'success' : 'danger'} loading={saving}>
            {approve ? 'Mark as paid' : 'Reject & refund'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}
        <dl className="divide-y divide-line rounded-2xl px-4 ring-1 ring-line">
          <DetailRow label="Publisher">{withdrawal.User?.name}</DetailRow>
          <DetailRow label="Amount">{formatCurrency(withdrawal.amount)}</DetailRow>
          <DetailRow label={withdrawal.method?.toUpperCase()}>{withdrawal.details}</DetailRow>
        </dl>
        {!approve && <Alert tone="warning">{formatCurrency(withdrawal.amount)} will be refunded to the publisher's wallet.</Alert>}
        <Field label="Notes" hint="Shown to the publisher on their invoice.">
          <Textarea rows={3} placeholder={approve ? 'e.g. Paid via UPI, ref 4182…' : 'Reason for rejection'} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
