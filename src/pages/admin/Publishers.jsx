import { useEffect, useState } from 'react';
import { Building2, IndianRupee, KeyRound, Mail, Pencil, Phone, Plus, Search, Trash2, UserPlus, Users, Wallet } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Field,
  Input,
  Modal,
  PageHeader,
  Pagination,
  Segmented,
  StatusBadge,
  Table,
  TableEmpty,
  TableSkeleton,
  Td,
  Th,
  THead,
  Toggle,
  Tr,
  useConfirm,
  useToast,
} from '../../components/ui';
import { errorMessage, formatCurrency, formatDate } from '../../utils/format';

// sadmin/publishers.php: search + paginate publishers; create (status 1,
// welcome email), edit (incl. postback URL, Telegram chat id, withdrawal
// switch), set/add balance, reset password, delete.
export default function AdminPublishers() {
  usePageTitle('Publishers');
  const toast = useToast();
  const confirm = useConfirm();
  const [publishers, setPublishers] = useState(null);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [modal, setModal] = useState(undefined);

  async function load(page = 1) {
    const { data } = await apiClient.get('/admin/publishers', { params: { search: query || undefined, page } });
    setPublishers(data.publishers);
    setPagination(data.pagination);
  }

  useEffect(() => {
    setPublishers(null);
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function handleDelete(p) {
    const ok = await confirm({ title: `Delete ${p.name}?`, message: 'Their account is removed permanently and they get an account-deleted email. This cannot be undone.', confirmLabel: 'Delete publisher' });
    if (!ok) return;
    try {
      await apiClient.delete(`/admin/publishers/${p.id}`);
      toast.success('Publisher deleted');
      await load(pagination.page);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Publishers"
        subtitle="Accounts, balances and payout permissions for everyone sending traffic."
        actions={
          <>
            <Button to="/admin/custom-email" variant="secondary" icon={Mail}>
              Email publishers
            </Button>
            <Button icon={UserPlus} onClick={() => setModal({ mode: 'create' })}>
              Add publisher
            </Button>
          </>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(search.trim());
            }}
            className="w-full sm:w-96"
          >
            <Input icon={Search} placeholder="Search name, email or company…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
          {pagination.total !== undefined && (
            <p className="flex items-center gap-1.5 text-xs text-ink-500">
              <Users className="h-3.5 w-3.5" /> {pagination.total} publishers
            </p>
          )}
        </div>
        <Table minWidth={980}>
          <THead>
            <tr>
              <Th>Publisher</Th>
              <Th>Company</Th>
              <Th>Contact</Th>
              <Th align="right">Wallet</Th>
              <Th>Account</Th>
              <Th>Withdrawals</Th>
              <Th>Joined</Th>
              <Th align="right" />
            </tr>
          </THead>
          <tbody>
            {!publishers ? (
              <TableSkeleton rows={6} cols={8} />
            ) : publishers.length === 0 ? (
              <TableEmpty colSpan={8} icon={Users} title="No publishers found" description={query ? 'Try a different search.' : 'Add your first publisher to get started.'} />
            ) : (
              publishers.map((p) => (
                <Tr key={p.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={p.name} size="sm" />
                      <div className="min-w-0">
                        <p className="max-w-[200px] truncate font-bold text-ink-900">{p.name}</p>
                        <p className="max-w-[200px] truncate text-xs text-ink-500">{p.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="max-w-[160px] truncate">{p.companyName || '—'}</Td>
                  <Td className="font-mono text-xs">{p.contactNumber || '—'}</Td>
                  <Td align="right" className="font-extrabold text-ink-900 tabular-nums">
                    {formatCurrency(p.walletBalance)}
                  </Td>
                  <Td>
                    <StatusBadge status={p.status ? 'active' : 'locked'} label={p.status ? 'Active' : 'Locked'} />
                  </Td>
                  <Td>
                    <Badge tone={p.withdrawalStatus ? 'success' : 'neutral'} dot>
                      {p.withdrawalStatus ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </Td>
                  <Td className="whitespace-nowrap text-ink-500">{formatDate(p.createdAt)}</Td>
                  <Td align="right" className="whitespace-nowrap">
                    <Button size="icon-sm" variant="ghost" icon={Pencil} title="Edit" onClick={() => setModal({ mode: 'edit', publisher: p })} aria-label="Edit" />
                    <Button size="icon-sm" variant="ghost" icon={Wallet} title="Adjust balance" onClick={() => setModal({ mode: 'balance', publisher: p })} aria-label="Adjust balance" />
                    <Button size="icon-sm" variant="ghost" icon={KeyRound} title="Reset password" onClick={() => setModal({ mode: 'password', publisher: p })} aria-label="Reset password" />
                    <Button size="icon-sm" variant="ghost" className="hover:text-rose-600" icon={Trash2} title="Delete" onClick={() => handleDelete(p)} aria-label="Delete" />
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onChange={(p) => load(p)} />
      </Card>

      {modal !== undefined && (
        <PublisherModal
          modal={modal}
          onClose={() => setModal(undefined)}
          onDone={(msg) => {
            setModal(undefined);
            toast.success(msg);
            load(pagination.page);
          }}
        />
      )}
    </div>
  );
}

function PublisherModal({ modal, onClose, onDone }) {
  const { mode, publisher } = modal;
  const [form, setForm] = useState(
    publisher
      ? {
          name: publisher.name,
          email: publisher.email,
          companyName: publisher.companyName || '',
          contactNumber: publisher.contactNumber || '',
          postbackUrl: publisher.postbackUrl || '',
          tgChatId: publisher.tgChatId || '',
          status: !!publisher.status,
          withdrawalStatus: !!publisher.withdrawalStatus,
        }
      : { name: '', email: '', password: '', companyName: '', contactNumber: '', postbackUrl: '', tgChatId: '', withdrawalStatus: true }
  );
  const [balance, setBalance] = useState({ action: 'add', amount: '' });
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      let msg;
      if (mode === 'create') {
        await apiClient.post('/admin/publishers', form);
        msg = 'Publisher created and welcome email sent';
      } else if (mode === 'edit') {
        await apiClient.put(`/admin/publishers/${publisher.id}`, form);
        msg = 'Publisher updated';
      } else if (mode === 'balance') {
        await apiClient.post(`/admin/publishers/${publisher.id}/adjust-balance`, { action: balance.action, amount: Number(balance.amount) });
        msg = 'Wallet balance updated';
      } else {
        await apiClient.post(`/admin/publishers/${publisher.id}/reset-password`, { newPassword });
        msg = 'Password reset — the publisher has been emailed';
      }
      onDone(msg);
    } catch (err) {
      setError(errorMessage(err, 'Save failed'));
      setSaving(false);
    }
  }

  const meta = {
    create: { title: 'Add publisher', icon: UserPlus, size: 'lg', description: 'Admin-created accounts are active immediately.' },
    edit: { title: `Edit ${publisher?.name}`, icon: Pencil, size: 'lg' },
    balance: { title: 'Adjust wallet balance', icon: IndianRupee, size: 'sm', description: `Current balance ${formatCurrency(publisher?.walletBalance)}` },
    password: { title: 'Reset password', icon: KeyRound, size: 'sm', description: `Set a new password for ${publisher?.email}` },
  }[mode];

  return (
    <Modal
      {...meta}
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} icon={mode === 'create' ? Plus : undefined}>
            {mode === 'create' ? 'Create publisher' : 'Save'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}

        {(mode === 'create' || mode === 'edit') && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required>
                <Input required value={form.name} onChange={set('name')} />
              </Field>
              <Field label="Email" required>
                <Input icon={Mail} type="email" required value={form.email} onChange={set('email')} />
              </Field>
              {mode === 'create' && (
                <Field label="Password" required hint="At least 6 characters — emailed to the publisher." className="sm:col-span-2">
                  <Input icon={KeyRound} type="text" required minLength={6} value={form.password} onChange={set('password')} />
                </Field>
              )}
              <Field label="Company" required>
                <Input icon={Building2} required value={form.companyName} onChange={set('companyName')} />
              </Field>
              <Field label="Contact number" required>
                <Input icon={Phone} required value={form.contactNumber} onChange={set('contactNumber')} />
              </Field>
              <Field label="Default postback URL" className="sm:col-span-2" hint="Optional publisher-level callback.">
                <Input type="url" placeholder="https://…" className="font-mono" value={form.postbackUrl} onChange={set('postbackUrl')} />
              </Field>
              <Field label="Telegram chat ID" className="sm:col-span-2">
                <Input placeholder="e.g. 123456789" value={form.tgChatId} onChange={set('tgChatId')} />
              </Field>
            </div>
            <div className="space-y-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-line">
              {mode === 'edit' && <Toggle checked={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} label="Account active" description="Locked accounts can't sign in." />}
              <Toggle checked={form.withdrawalStatus} onChange={(v) => setForm((f) => ({ ...f, withdrawalStatus: v }))} label="Allow withdrawals" description="When off, this publisher can't request payouts." />
            </div>
          </>
        )}

        {mode === 'balance' && (
          <>
            <Segmented
              value={balance.action}
              onChange={(v) => setBalance((b) => ({ ...b, action: v }))}
              options={[
                { value: 'add', label: 'Add to balance' },
                { value: 'set', label: 'Set balance to' },
              ]}
            />
            <Field label="Amount (₹)" required>
              <Input type="number" step="0.01" min="0" required value={balance.amount} onChange={(e) => setBalance((b) => ({ ...b, amount: e.target.value }))} />
            </Field>
            <p className="text-xs text-ink-500">Every change is written to the publisher's wallet ledger.</p>
          </>
        )}

        {mode === 'password' && (
          <Field label="New password" required hint="At least 6 characters.">
            <Input icon={KeyRound} type="text" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </Field>
        )}
      </div>
    </Modal>
  );
}
