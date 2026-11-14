import { useEffect, useState } from 'react';
import { RefreshCw, Send } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import { Button, Card, PageHeader, Segmented, StatusBadge, Table, TableEmpty, TableSkeleton, Td, Th, THead, Tr, useToast } from '../../components/ui';
import { errorMessage, formatCurrency, formatDateTime } from '../../utils/format';

export default function CampaignPayouts() {
  usePageTitle('Campaign payouts');
  const toast = useToast();
  const [status, setStatus] = useState('pending');
  const [rows, setRows] = useState(null);
  const [gateways, setGateways] = useState([]);
  const [gatewayId, setGatewayId] = useState('');

  async function load() {
    const { data } = await apiClient.get('/admin/campaign-payouts', { params: { status } });
    setRows(data.payouts || []);
  }
  useEffect(() => { setRows(null); load().catch((e) => toast.error(errorMessage(e, 'Could not load campaign payouts'))); }, [status]);
  useEffect(() => {
    apiClient.get('/admin/gateways').then(({ data }) => {
      const active = (data.gateways || []).filter((g) => g.type === 'api' && g.status === 'active' && g.name?.toLowerCase() === 'rupiyax');
      setGateways(active);
      setGatewayId(active[0]?.id || '');
    }).catch(() => setGateways([]));
  }, []);

  async function act(path, success) {
    try { await path(); toast.success(success); await load(); }
    catch (e) { toast.error(errorMessage(e, 'Could not update campaign payout')); }
  }

  return <div className="space-y-6">
    <PageHeader eyebrow="Finance" title="Campaign cashback payouts" subtitle="Review bank details for approved offer users and referrers, then send or refresh payouts through RupiyaX." />
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
        <Segmented value={status} onChange={setStatus} options={[{ value: 'pending', label: 'Pending / processing' }, { value: 'paid', label: 'Paid' }, { value: 'failed', label: 'Failed' }, { value: 'all', label: 'All' }]} />
        <select aria-label="RupiyaX gateway" value={gatewayId} onChange={(e) => setGatewayId(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 text-sm">
          {gateways.length ? gateways.map((g) => <option key={g.id} value={g.id}>{g.name}</option>) : <option value="">No active RupiyaX gateway</option>}
        </select>
      </div>
      <Table minWidth={1050}>
        <THead><tr><Th>Conversion</Th><Th>Recipient</Th><Th>Bank account</Th><Th>Amount</Th><Th>Status</Th><Th>UTR / reference</Th><Th>Created</Th><Th>Actions</Th></tr></THead>
        <tbody>
          {rows === null ? <TableSkeleton rows={4} columns={8} /> : rows.length === 0 ? <TableEmpty colSpan={8} title="No campaign payouts" description="Payouts appear here after an admin approves a conversion." /> : rows.map((row) => <Tr key={row.id}>
            <Td>#{row.conversionId}</Td><Td><div className="font-medium">{row.recipientName}</div><div className="text-xs text-slate-500">{row.recipientType}</div></Td>
            <Td><div>{row.accountNumber}</div><div className="text-xs text-slate-500">{row.ifsc}</div></Td><Td>{formatCurrency(row.amount)}</Td><Td><StatusBadge status={row.status} /></Td><Td>{row.utr || row.rupiyaxTrxId || row.refId || '—'}</Td><Td>{formatDateTime(row.createdAt)}</Td>
            <Td><div className="flex gap-2">{['pending', 'failed'].includes(row.status) && <Button size="sm" disabled={!gatewayId} onClick={() => act(() => apiClient.post(`/admin/campaign-payouts/${row.id}/pay`, { gatewayId }), `Payout #${row.id} sent to RupiyaX`)}><Send className="mr-1 h-3.5 w-3.5" />Pay</Button>}{row.gatewayId && ['processing', 'pending'].includes(row.status) && <Button size="sm" variant="secondary" onClick={() => act(() => apiClient.get(`/admin/campaign-payouts/${row.id}/status`), `Payout #${row.id} status refreshed`)}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>}</div></Td>
          </Tr>)}
        </tbody>
      </Table>
    </Card>
  </div>;
}
