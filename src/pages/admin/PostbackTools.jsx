import { useEffect, useState } from 'react';
import { CheckCircle2, Link2, RefreshCw, Send, ShieldAlert, XCircle, Zap } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import { Alert, Badge, Button, Card, CardHeader, CopyField, Field, PageHeader, PageSkeleton, Segmented, Select, Textarea, useConfirm, useToast } from '../../components/ui';
import { errorMessage, formatCurrency } from '../../utils/format';

// sadmin/postback.php (advertiser postback URL + token reset) and
// sadmin/firepostback.php (replay conversions for a batch of click IDs).
export default function AdminPostbackTools() {
  usePageTitle('Postback tools');
  const [tab, setTab] = useState('url');
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Performance"
        title="Postback tools"
        subtitle="The URL advertisers call to report conversions — and a manual fire tool for missed ones."
        actions={
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: 'url', label: 'Advertiser URL' },
              { value: 'fire', label: 'Fire postbacks' },
            ]}
          />
        }
      />
      {tab === 'url' ? <PostbackUrlTab /> : <FirePostbackTab />}
    </div>
  );
}

function PostbackUrlTab() {
  const toast = useToast();
  const confirm = useConfirm();
  const [info, setInfo] = useState(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    apiClient.get('/admin/postback-tools').then(({ data }) => setInfo(data));
  }, []);

  if (!info) return <PageSkeleton />;

  const base = info.postbackUrl.split('/postback/')[0];
  const longForm = `${base}/postback?click_id={tid}&event={event}&key=${info.token}`;

  async function handleReset() {
    const ok = await confirm({
      title: 'Regenerate the postback token?',
      message: 'Every advertiser integration using the current URL will stop crediting conversions until it is updated with the new one.',
      confirmLabel: 'Regenerate token',
    });
    if (!ok) return;
    setResetting(true);
    try {
      const { data } = await apiClient.post('/admin/postback-tools/reset-token');
      setInfo(data);
      toast.success(data.message);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <Card className="xl:col-span-3">
        <CardHeader title="Advertiser postback URL" subtitle="Give this to advertisers as their conversion pixel / S2S URL." icon={Link2} />
        <div className="space-y-5 p-5">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <p className="text-xs font-semibold text-ink-700">Short form</p>
              <Badge tone="brand">recommended</Badge>
            </div>
            <CopyField value={info.postbackUrl} />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-ink-700">Query-string form</p>
            <CopyField value={longForm} />
          </div>
          <Alert tone="info" title="Placeholders">
            The advertiser replaces <code className="font-mono font-bold">{'{tid}'}</code> with the click ID we sent them and <code className="font-mono font-bold">{'{event}'}</code> with the event name configured on the offer. The token at the end authenticates the call.
          </Alert>
        </div>
      </Card>

      <Card className="h-fit xl:col-span-2">
        <CardHeader title="Security token" icon={ShieldAlert} />
        <div className="space-y-4 p-5">
          <CopyField value={info.token} />
          <p className="text-sm text-ink-500">If the token leaks, anyone can post fake conversions. Regenerate it, then send the new URL to every advertiser.</p>
          <Button variant="danger-soft" icon={RefreshCw} loading={resetting} onClick={handleReset} className="w-full">
            Regenerate token
          </Button>
        </div>
      </Card>
    </div>
  );
}

function FirePostbackTab() {
  const toast = useToast();
  const [offers, setOffers] = useState([]);
  const [offerId, setOfferId] = useState('');
  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState('');
  const [tids, setTids] = useState('');
  const [results, setResults] = useState(null);
  const [firing, setFiring] = useState(false);

  useEffect(() => {
    apiClient.get('/admin/postback-tools/fire/offers').then(({ data }) => setOffers(data.offers));
  }, []);

  useEffect(() => {
    if (!offerId) return;
    apiClient.get(`/admin/postback-tools/fire/offers/${offerId}/events`).then(({ data }) => setEvents(data.events));
  }, [offerId]);

  const list = tids
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  async function handleFire(e) {
    e.preventDefault();
    if (list.length === 0 || !eventName) return;
    setFiring(true);
    setResults(null);
    try {
      const { data } = await apiClient.post('/admin/postback-tools/fire', { tids: list, eventName });
      setResults(data.results);
      const ok = data.results.filter((r) => r.success).length;
      toast.info(`${ok} of ${data.results.length} postbacks credited`);
    } catch (err) {
      toast.error(errorMessage(err, 'Fire failed'));
    } finally {
      setFiring(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <Card className="h-fit xl:col-span-2">
        <CardHeader title="Fire postbacks" subtitle="Runs the full postback flow for each click ID." icon={Zap} />
        <form onSubmit={handleFire} className="space-y-4 p-5">
          <Field label="Offer" required>
            <Select
              required
              value={offerId}
              onChange={(e) => {
                setOfferId(e.target.value);
                setEventName('');
                setEvents([]);
              }}
            >
              <option value="">Choose offer…</option>
              {offers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Event" required>
            <Select required value={eventName} disabled={!offerId} onChange={(e) => setEventName(e.target.value)}>
              <option value="">{offerId ? 'Choose event…' : 'Choose an offer first'}</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.eventName}>
                  {ev.eventName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Click IDs" required hint={`${list.length} click ID${list.length === 1 ? '' : 's'} — separate with commas, spaces or new lines.`}>
            <Textarea rows={6} required className="font-mono text-xs" placeholder={'65f1c2a9e4b7d\n65f1c2b31a0f2'} value={tids} onChange={(e) => setTids(e.target.value)} />
          </Field>
          <Alert tone="warning">Each successful fire inserts a conversion and credits the publisher's wallet, exactly like a real advertiser postback.</Alert>
          <Button type="submit" className="w-full" loading={firing} icon={Send} disabled={!eventName || list.length === 0}>
            Fire {list.length || ''} postback{list.length === 1 ? '' : 's'}
          </Button>
        </form>
      </Card>

      <Card className="xl:col-span-3">
        <CardHeader title="Results" subtitle={results ? `${results.filter((r) => r.success).length} succeeded · ${results.filter((r) => !r.success).length} failed` : 'Run a batch to see per-click outcomes'} />
        {!results ? (
          <div className="p-10 text-center text-sm text-ink-500">Nothing fired yet.</div>
        ) : (
          <ul className="divide-y divide-line">
            {results.map((r) => (
              <li key={r.tid} className="flex items-center gap-3 px-5 py-3">
                {r.success ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> : <XCircle className="h-5 w-5 shrink-0 text-rose-500" />}
                <span className="font-mono text-xs text-ink-900">{r.tid}</span>
                <span className={`ml-auto text-right text-sm ${r.success ? 'font-bold text-emerald-700' : 'text-rose-600'}`}>
                  {r.success ? `Conversion #${r.conversionId} · ${formatCurrency(r.payout)}` : r.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
