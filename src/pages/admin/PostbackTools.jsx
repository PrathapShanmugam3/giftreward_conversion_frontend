import { useEffect, useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { apiClient } from '../../api/client';
import Loader from '../../components/Loader';

// Combines sadmin/postback.php (token/URL display + reset) and
// sadmin/firepostback.php (replay a batch of click IDs) into one page with
// tabs, matching how AdminPostbacks.jsx already combines the legacy
// postback log/approval pages — see AdminLayout.jsx's sidebar comment.
export default function AdminPostbackTools() {
  const [tab, setTab] = useState('url');

  return (
    <div className="admin-theme">
      <h1 className="mb-4 text-xl font-bold text-admin-dark">Postback Tools</h1>
      <div className="mb-4 flex gap-2">
        {[
          ['url', 'Postback URL'],
          ['fire', 'Fire Postback'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === key ? 'bg-admin-primary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'url' ? <PostbackUrlTab /> : <FirePostbackTab />}
    </div>
  );
}

function PostbackUrlTab() {
  const [info, setInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    apiClient.get('/admin/postback-tools').then(({ data }) => setInfo(data));
  }, []);

  if (!info) return <Loader />;

  async function handleReset() {
    if (!confirm('Reset your postback token? The old postback URL will stop working immediately.')) return;
    setResetting(true);
    try {
      const { data } = await apiClient.post('/admin/postback-tools/reset-token');
      setInfo(data);
    } finally {
      setResetting(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(info.postbackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-admin bg-white p-6 shadow-admin-card">
      <h2 className="mb-3 text-lg font-bold text-admin-dark">Your Postback Link</h2>
      <div className="mb-4 rounded-md bg-admin-info/10 px-3 py-2 text-sm text-[#1b5fa8]">
        <strong>Important:</strong> Replace <code>{'{tid}'}</code> and <code>{'{event}'}</code> with the real
        click ID and event name when configuring this URL with an advertiser. Your token is already included
        for security.
      </div>

      <div className="mb-4 flex gap-2">
        <input
          readOnly
          value={info.postbackUrl}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 font-mono text-xs text-gray-700"
        />
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          <Copy className="h-4 w-4" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <button
        onClick={handleReset}
        disabled={resetting}
        className="flex items-center gap-1.5 rounded-lg bg-admin-warning px-4 py-2 text-sm font-semibold text-admin-dark hover:opacity-90 disabled:opacity-60"
      >
        <RefreshCw className="h-4 w-4" />
        {resetting ? 'Resetting...' : 'Reset Token'}
      </button>

      <h3 className="mt-6 mb-2 text-sm font-semibold text-admin-dark">How to use</h3>
      <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-600">
        <li>Copy the URL above.</li>
        <li>
          Replace <code>{'{tid}'}</code> and <code>{'{event}'}</code> with the real tracking ID and event name.
        </li>
        <li>Configure this URL with the advertiser as the postback/conversion-pixel URL.</li>
      </ol>
    </div>
  );
}

function FirePostbackTab() {
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

  async function handleFire(e) {
    e.preventDefault();
    const list = tids
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (list.length === 0 || !eventName) return;

    setFiring(true);
    setResults(null);
    try {
      const { data } = await apiClient.post('/admin/postback-tools/fire', { tids: list, eventName });
      setResults(data.results);
    } finally {
      setFiring(false);
    }
  }

  return (
    <div className="rounded-admin bg-white p-6 shadow-admin-card">
      <h2 className="mb-1 text-lg font-bold text-admin-dark">Fire Postback</h2>
      <p className="mb-4 text-sm text-admin-gray">
        Replay the postback flow for a batch of click IDs — useful for crediting conversions an advertiser
        missed firing automatically.
      </p>

      <form onSubmit={handleFire} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Offer</label>
          <select
            value={offerId}
            onChange={(e) => {
              setOfferId(e.target.value);
              setEventName('');
              setEvents([]);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">-- Choose Offer --</option>
            {offers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        {offerId && events.length > 0 && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Event</label>
              <select
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">-- Choose Event --</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.eventName}>
                    {ev.eventName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Click IDs (comma-separated)</label>
              <textarea
                rows={3}
                value={tids}
                onChange={(e) => setTids(e.target.value)}
                placeholder="tid1,tid2,tid3"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={firing}
              className="rounded-lg bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark disabled:opacity-60"
            >
              {firing ? 'Firing...' : 'Generate & Fire Postbacks'}
            </button>
          </>
        )}
      </form>

      {results && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-admin-dark">Results</h3>
          <ul className="divide-y divide-admin-gray-light rounded-md border border-admin-gray-light">
            {results.map((r) => (
              <li key={r.tid} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="font-mono text-xs text-gray-700">{r.tid}</span>
                {r.success ? (
                  <span className="text-admin-success">
                    Conversion #{r.conversionId} — ₹{r.payout}
                  </span>
                ) : (
                  <span className="text-admin-danger">{r.message}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
