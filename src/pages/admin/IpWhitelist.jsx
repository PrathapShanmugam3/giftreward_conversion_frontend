import { useEffect, useState } from 'react';
import { Ban, Globe, Plus, Search, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import {
  Alert,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Field,
  Input,
  PageHeader,
  Pagination,
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
import { errorMessage, formatDate } from '../../utils/format';

// sadmin/ip_whitelist.php. Despite the table name, an entry with status=1
// BLOCKS postbacks from that IP (see postback.service.js) — the UI says
// "Blocked"/"Allowed" so the effect is unambiguous.
export default function AdminIpWhitelist() {
  usePageTitle('IP whitelist');
  const toast = useToast();
  const confirm = useConfirm();
  const [entries, setEntries] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [form, setForm] = useState({ input: '', description: '', block: true });
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  async function load(page = 1) {
    const { data } = await apiClient.get('/admin/ip-whitelist', { params: { search: query || undefined, page } });
    setEntries(data.entries || []);
    setPagination(data.pagination || { page: 1, totalPages: 1 });
    setSelected(new Set());
  }

  useEffect(() => {
    setEntries(null);
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    setAdding(true);
    try {
      await apiClient.post('/admin/ip-whitelist', { input: form.input, description: form.description, status: form.block ? 1 : 0 });
      toast.success('Entry added');
      setForm({ input: '', description: '', block: true });
      await load(1);
    } catch (err) {
      setError(errorMessage(err, 'Failed to add'));
    } finally {
      setAdding(false);
    }
  }

  async function toggle(entry) {
    try {
      await apiClient.post(`/admin/ip-whitelist/${entry.id}/toggle`);
      toast.success(`${entry.ip} is now ${entry.status ? 'allowed' : 'blocked'}`);
      await load(pagination.page);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function remove(entry) {
    if (!(await confirm({ title: `Remove ${entry.ip}?`, message: 'The entry is deleted; postbacks from this IP will be accepted.', confirmLabel: 'Remove' }))) return;
    try {
      await apiClient.delete(`/admin/ip-whitelist/${entry.id}`);
      toast.success('Entry removed');
      await load(pagination.page);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function bulk(action) {
    if (selected.size === 0) return;
    if (action === 'delete' && !(await confirm({ title: `Delete ${selected.size} entr${selected.size === 1 ? 'y' : 'ies'}?`, confirmLabel: 'Delete' }))) return;
    try {
      const { data } = await apiClient.post('/admin/ip-whitelist/bulk', { action, ids: [...selected] });
      toast.success(data.message);
      await load(pagination.page);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allSelected = entries?.length > 0 && entries.every((e) => selected.has(e.id));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="System" title="Postback IP list" subtitle="Block advertiser postbacks coming from specific IP addresses or hostnames." />

      <Alert tone="info" title="How this list works">
        A <strong>Blocked</strong> entry makes <code className="font-mono">/postback</code> reject calls from that IP. Per-offer allow-lists are set on each offer instead.
      </Alert>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="h-fit">
          <CardHeader title="Add entry" icon={Plus} />
          <form onSubmit={handleAdd} className="space-y-4 p-5">
            {error && <Alert tone="danger">{error}</Alert>}
            <Field label="IP address or URL" required hint="A URL or hostname is resolved to its IP via DNS.">
              <Input icon={Globe} required placeholder="203.0.113.10 or https://example.com" value={form.input} onChange={(e) => setForm((f) => ({ ...f, input: e.target.value }))} />
            </Field>
            <Field label="Description">
              <Input placeholder="e.g. Fraudulent advertiser server" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </Field>
            <Toggle checked={form.block} onChange={(v) => setForm((f) => ({ ...f, block: v }))} label="Block immediately" description="Turn off to add the entry as allowed." />
            <Button type="submit" className="w-full" loading={adding} icon={Plus}>
              Add to list
            </Button>
          </form>
        </Card>

        <Card className="xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setQuery(search.trim());
              }}
              className="w-full sm:w-72"
            >
              <Input icon={Search} placeholder="Search IP or description…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </form>
            {selected.size > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant="danger-soft" icon={Ban} onClick={() => bulk('activate')}>
                  Block {selected.size}
                </Button>
                <Button size="sm" variant="success-soft" icon={ShieldCheck} onClick={() => bulk('deactivate')}>
                  Allow
                </Button>
                <Button size="sm" variant="ghost" icon={Trash2} onClick={() => bulk('delete')}>
                  Delete
                </Button>
              </div>
            )}
          </div>
          <Table minWidth={640}>
            <THead>
              <tr>
                <Th className="w-10">
                  <Checkbox checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(entries.map((e) => e.id)))} aria-label="Select all" />
                </Th>
                <Th>IP address</Th>
                <Th>Description</Th>
                <Th>Status</Th>
                <Th>Added</Th>
                <Th align="right" />
              </tr>
            </THead>
            <tbody>
              {!entries ? (
                <TableSkeleton rows={5} cols={6} />
              ) : entries.length === 0 ? (
                <TableEmpty colSpan={6} icon={ShieldCheck} title="No entries" description="Postbacks are accepted from every IP." />
              ) : (
                entries.map((e) => (
                  <Tr key={e.id} selected={selected.has(e.id)}>
                    <Td>
                      <Checkbox checked={selected.has(e.id)} onChange={() => toggleSelect(e.id)} aria-label="Select entry" />
                    </Td>
                    <Td className="font-mono text-xs font-bold text-ink-900">{e.ip}</Td>
                    <Td className="max-w-[220px] truncate">{e.description || '—'}</Td>
                    <Td>
                      <StatusBadge status={e.status ? 'blocked' : 'allowed'} label={e.status ? 'Blocked' : 'Allowed'} />
                    </Td>
                    <Td className="whitespace-nowrap text-ink-500">{formatDate(e.createdAt)}</Td>
                    <Td align="right" className="whitespace-nowrap">
                      <Button size="xs" variant="ghost" icon={e.status ? ShieldCheck : ShieldOff} onClick={() => toggle(e)}>
                        {e.status ? 'Allow' : 'Block'}
                      </Button>
                      <Button size="icon-sm" variant="ghost" className="hover:text-rose-600" icon={Trash2} onClick={() => remove(e)} aria-label="Delete" />
                    </Td>
                  </Tr>
                ))
              )}
            </tbody>
          </Table>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onChange={(p) => load(p)} />
        </Card>
      </div>
    </div>
  );
}
