import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';

const UPI_RE = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/i;

// Public referral-code generator — replaces refer/index.php. Lets an end
// user who already completed an offer generate a shareable code so friends
// get credited back to them on the /o landing page.
export default function Referral() {
  const [params] = useSearchParams();
  const o = params.get('o');
  const pid = params.get('pid');
  const cid = params.get('cid');

  const [data, setData] = useState(null);
  const [form, setForm] = useState({ upi_id: '', telegram_channel: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiClient.get('/refer', { params: { o, cid } }).then(({ data: res }) => setData(res));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!UPI_RE.test(form.upi_id)) {
      setError('Please enter a valid UPI ID (e.g. 1234567890@upi)');
      return;
    }
    setSubmitting(true);
    try {
      const { data: res } = await apiClient.post('/refer', form, { params: { o, pid, cid } });
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (!data) return null;

  const referralLink = result
    ? `${window.location.origin}/o?o=${o}&pid=${pid}&cid=${cid}&as=${result.referralCode}`
    : '';
  const shareText = `Join this offer using my referral link: ${referralLink}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-8">
      <div className="campaign-glow-border relative w-full max-w-md rounded-2xl border border-blue-100 bg-white p-6 shadow-lg">
        <h1 className="mb-2 text-center text-xl font-bold text-gray-800">Refer & Earn — {data.offerName}</h1>
        <div className="mb-6 rounded-xl bg-blue-50 p-4 text-center">
          <p className="text-xs text-blue-600">Referral Cashback</p>
          <p className="text-2xl font-extrabold text-blue-700">₹{data.totalReferralCashback}.00 per referral</p>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        {result ? (
          <div className="space-y-4 text-center">
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{result.message}</p>
            <div className="break-all rounded-md bg-gray-100 p-3 text-xs text-gray-700">{referralLink}</div>
            <div className="flex justify-center gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Share on WhatsApp
              </a>
              <button
                onClick={() => navigator.clipboard?.writeText(referralLink)}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Copy Link
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-blue-700">Your UPI ID</label>
              <input
                required
                value={form.upi_id}
                onChange={(e) => setForm((f) => ({ ...f, upi_id: e.target.value }))}
                placeholder="yourname@upi"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-blue-700">Telegram Channel (optional)</label>
              <input
                value={form.telegram_channel}
                onChange={(e) => setForm((f) => ({ ...f, telegram_channel: e.target.value }))}
                placeholder="https://t.me/yourchannel"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Generating...' : 'Get My Referral Link'}
            </button>
          </form>
        )}

        {data.steps?.length > 0 && (
          <ol className="mt-6 space-y-2 border-t border-gray-100 pt-4">
            {data.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
