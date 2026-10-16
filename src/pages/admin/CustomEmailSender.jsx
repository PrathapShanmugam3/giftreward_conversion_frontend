import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import { apiClient } from '../../api/client';
import Loader from '../../components/Loader';

// Mirrors sadmin/custom_email_sender.php. File attachments were deferred
// along with the rest of file-upload support for this port — see
// CUTOVER.md — so this sends HTML-only messages.
export default function CustomEmailSender() {
  const [publishers, setPublishers] = useState(null);
  const [stats, setStats] = useState(null);
  const [recipientType, setRecipientType] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [singleId, setSingleId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get('/admin/custom-email/publishers').then(({ data }) => setPublishers(data.publishers));
    apiClient.get('/admin/custom-email/stats').then(({ data }) => setStats(data.stats));
  }, []);

  if (!publishers || !stats) return <Loader />;

  const previewMessage = message
    .replaceAll('{name}', 'John Doe')
    .replaceAll('{company_name}', 'GiftReward')
    .replaceAll('{year}', String(new Date().getFullYear()));

  async function handleSend(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (recipientType === 'selected' && selectedIds.length === 0) {
      setError('Select at least one publisher');
      return;
    }
    if (recipientType === 'single' && !singleId) {
      setError('Select a publisher');
      return;
    }

    setSending(true);
    try {
      const { data } = await apiClient.post('/admin/custom-email/send', {
        recipientType,
        publisherIds: selectedIds,
        singlePublisherId: singleId || undefined,
        subject,
        message,
      });
      setResult(data);
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="admin-theme">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-admin-dark">Custom Email Sender</h1>
          <p className="text-sm text-admin-gray">Send custom emails to your publishers</p>
        </div>
        <Link to="/admin/publishers" className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
          Back to Publishers
        </Link>
      </div>

      {result && (
        <p className="mb-4 rounded-md bg-admin-success/10 px-3 py-2 text-sm text-admin-success">
          Emails sent! {result.successCount} delivered{result.errorCount ? `, ${result.errorCount} failed` : ''}.
        </p>
      )}
      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-admin-danger">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <form onSubmit={handleSend} className="rounded-admin bg-white p-6 shadow-admin-card">
          <h2 className="mb-4 text-sm font-semibold text-admin-dark">Compose Email</h2>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">Recipient(s)</label>
            <div className="space-y-1.5">
              {[
                ['all', 'All Active Publishers'],
                ['selected', 'Selected Publishers'],
                ['single', 'Single Publisher'],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="recipientType"
                    value={value}
                    checked={recipientType === value}
                    onChange={() => setRecipientType(value)}
                  />
                  {label}
                </label>
              ))}
            </div>

            {recipientType === 'selected' && (
              <select
                multiple
                size={5}
                value={selectedIds.map(String)}
                onChange={(e) => setSelectedIds(Array.from(e.target.selectedOptions, (o) => Number(o.value)))}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {publishers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.email}
                  </option>
                ))}
              </select>
            )}

            {recipientType === 'single' && (
              <select
                value={singleId}
                onChange={(e) => setSingleId(e.target.value)}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Choose a publisher...</option>
                {publishers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
            <textarea
              rows={10}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="Compose your message here... (HTML tags allowed)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {sending ? 'Sending...' : 'Send Email'}
          </button>
        </form>

        <div className="space-y-4">
          <div className="rounded-admin bg-white p-4 shadow-admin-card">
            <h3 className="mb-3 text-sm font-semibold text-admin-dark">Available Variables</h3>
            <div className="space-y-2 text-xs text-admin-gray">
              <div>
                <span className="mr-1.5 rounded bg-admin-primary/10 px-1.5 py-0.5 font-mono text-admin-primary">{'{name}'}</span>
                Publisher's name
              </div>
              <div>
                <span className="mr-1.5 rounded bg-admin-primary/10 px-1.5 py-0.5 font-mono text-admin-primary">{'{company_name}'}</span>
                Your company name
              </div>
              <div>
                <span className="mr-1.5 rounded bg-admin-primary/10 px-1.5 py-0.5 font-mono text-admin-primary">{'{year}'}</span>
                Current year
              </div>
            </div>
            <h4 className="mt-4 mb-1 text-xs font-semibold text-admin-dark">Preview</h4>
            <div
              className="min-h-[100px] rounded-md border border-admin-gray-light bg-admin-light p-3 text-xs text-gray-700"
              dangerouslySetInnerHTML={{ __html: previewMessage || '<span class="text-admin-gray">Preview will appear here</span>' }}
            />
          </div>

          <div className="rounded-admin bg-white p-4 shadow-admin-card">
            <h3 className="mb-3 text-sm font-semibold text-admin-dark">Sending Statistics</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-admin-gray">Total Publishers</dt>
                <dd className="font-semibold text-admin-dark">{stats.totalPublishers}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-admin-gray">Active Publishers</dt>
                <dd className="font-semibold text-admin-dark">{stats.activePublishers}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-admin-gray">Inactive Publishers</dt>
                <dd className="font-semibold text-admin-dark">{stats.inactivePublishers}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
