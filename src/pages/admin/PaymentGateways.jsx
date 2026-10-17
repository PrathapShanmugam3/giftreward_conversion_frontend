import { useEffect, useState } from 'react';
import { CircleDot, Cloud, CreditCard, Hand, Pencil, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import { Alert, Badge, Button, Card, EmptyState, Field, Input, Modal, PageHeader, Segmented, Select, Skeleton, StatCard, StatusBadge, Textarea, useConfirm, useToast } from '../../components/ui';
import { errorMessage, formatDate } from '../../utils/format';

// sadmin/gateway_management.php: payment_gateways CRUD; API-type gateways
// also carry a gateway_config row (endpoint, method, credentials, success
// codes, UPI ids).
export default function PaymentGateways() {
  usePageTitle('Payment gateways');
  const toast = useToast();
  const confirm = useConfirm();
  const [gateways, setGateways] = useState(null);
  const [stats, setStats] = useState(null);
  const [modal, setModal] = useState(undefined);

  async function load() {
    const { data } = await apiClient.get('/admin/gateways');
    setGateways(data.gateways);
    setStats(data.stats);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(payload) {
    if (modal) await apiClient.put(`/admin/gateways/${modal.id}`, payload);
    else await apiClient.post('/admin/gateways', payload);
    toast.success(modal ? 'Gateway updated' : 'Gateway added');
    setModal(undefined);
    await load();
  }

  async function handleDelete(g) {
    if (!(await confirm({ title: `Delete ${g.name}?`, message: 'Its API configuration is removed too.', confirmLabel: 'Delete gateway' }))) return;
    try {
      await apiClient.delete(`/admin/gateways/${g.id}`);
      toast.success('Gateway deleted');
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Payment gateways"
        subtitle="Payout rails used to pay publishers — manual transfers or API-driven providers."
        actions={
          <Button icon={Plus} onClick={() => setModal(null)}>
            Add gateway
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Gateways" value={stats?.total ?? '—'} icon={CreditCard} tone="brand" loading={!stats} />
        <StatCard label="Active" value={stats?.active ?? '—'} icon={CircleDot} tone="success" loading={!stats} />
        <StatCard label="API" value={stats?.apiType ?? '—'} icon={Cloud} tone="info" loading={!stats} />
        <StatCard label="Manual" value={stats?.manualType ?? '—'} icon={Hand} tone="slate" loading={!stats} />
      </div>

      {!gateways ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : gateways.length === 0 ? (
        <Card>
          <EmptyState icon={CreditCard} title="No gateways yet" description="Add a manual or API gateway to record how payouts are sent." action={<Button icon={Plus} onClick={() => setModal(null)}>Add gateway</Button>} />
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {gateways.map((g) => (
            <Card key={g.id} hover className="flex flex-col gap-4 p-5">
              <div className="flex items-start gap-3">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white ${g.type === 'api' ? 'bg-gradient-to-br from-sky-400 to-blue-600' : 'bg-gradient-to-br from-slate-500 to-slate-700'}`}>
                  {g.type === 'api' ? <Cloud className="h-6 w-6" /> : <Hand className="h-6 w-6" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-extrabold text-ink-900">{g.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge tone={g.type === 'api' ? 'info' : 'neutral'}>{g.type === 'api' ? 'API' : 'Manual'}</Badge>
                    <StatusBadge status={g.status} />
                  </div>
                </div>
              </div>
              {g.type === 'api' && g.GatewayConfig && (
                <dl className="space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs ring-1 ring-line">
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-ink-500">Endpoint</dt>
                    <dd className="truncate font-mono text-ink-900" title={g.GatewayConfig.apiEndpoint}>
                      {g.GatewayConfig.apiMethod} {g.GatewayConfig.apiEndpoint || '—'}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-ink-500">Success</dt>
                    <dd className="font-mono text-ink-900">{g.GatewayConfig.successCodes || '—'}</dd>
                  </div>
                </dl>
              )}
              <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
                <span className="text-xs text-ink-400">Added {formatDate(g.createdAt)}</span>
                <div>
                  <Button size="icon-sm" variant="ghost" icon={Pencil} onClick={() => setModal(g)} aria-label="Edit" />
                  <Button size="icon-sm" variant="ghost" className="hover:text-rose-600" icon={Trash2} onClick={() => handleDelete(g)} aria-label="Delete" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal !== undefined && <GatewayModal gateway={modal} onClose={() => setModal(undefined)} onSubmit={handleSubmit} />}
    </div>
  );
}

function GatewayModal({ gateway, onClose, onSubmit }) {
  const cfg = gateway?.GatewayConfig || {};
  const [form, setForm] = useState({ name: gateway?.name || '', type: gateway?.type || 'manual', status: gateway?.status || 'testing' });
  const [config, setConfig] = useState({
    apiEndpoint: cfg.apiEndpoint || '',
    apiMethod: cfg.apiMethod || 'POST',
    apiKey: cfg.apiKey || '',
    apiSecret: cfg.apiSecret || '',
    successCodes: cfg.successCodes || '200,201',
    upiIds: cfg.upiIds || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const setC = (k) => (e) => setConfig((c) => ({ ...c, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit(form.type === 'api' ? { ...form, config } : form);
    } catch (err) {
      setError(errorMessage(err, 'Save failed'));
      setSaving(false);
    }
  }

  return (
    <Modal
      title={gateway ? `Edit ${gateway.name}` : 'Add gateway'}
      icon={CreditCard}
      size="lg"
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save gateway
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {error && <Alert tone="danger">{error}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required className="sm:col-span-2">
            <Input required placeholder="e.g. Razorpay Payouts" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Type">
            <Segmented
              value={form.type}
              onChange={(v) => setForm((f) => ({ ...f, type: v }))}
              options={[
                { value: 'manual', label: 'Manual' },
                { value: 'api', label: 'API' },
              ]}
            />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="testing">Testing</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
        </div>

        {form.type === 'api' && (
          <div className="space-y-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-line">
            <p className="text-xs font-bold tracking-wider text-ink-500 uppercase">API configuration</p>
            <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
              <Field label="Method">
                <Select value={config.apiMethod} onChange={setC('apiMethod')}>
                  {['POST', 'GET', 'PUT', 'DELETE'].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Endpoint">
                <Input type="url" className="font-mono text-xs" placeholder="https://api.provider.com/payouts" value={config.apiEndpoint} onChange={setC('apiEndpoint')} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="API key">
                <Input className="font-mono text-xs" value={config.apiKey} onChange={setC('apiKey')} autoComplete="off" />
              </Field>
              <Field label="API secret">
                <Input type="password" className="font-mono text-xs" value={config.apiSecret} onChange={setC('apiSecret')} autoComplete="off" />
              </Field>
              <Field label="Success HTTP codes" hint="Comma-separated">
                <Input className="font-mono text-xs" value={config.successCodes} onChange={setC('successCodes')} />
              </Field>
            </div>
            <Field label="UPI IDs" hint="Optional, one per line or comma-separated">
              <Textarea rows={2} className="font-mono text-xs" value={config.upiIds} onChange={setC('upiIds')} />
            </Field>
          </div>
        )}
      </div>
    </Modal>
  );
}
