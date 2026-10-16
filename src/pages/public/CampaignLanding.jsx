import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';

const MOBILE_RE = /^[0-9]{10}$/;
const UPI_RE = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;

// Public cashback offer landing page — replaces o/index.php. Collects
// name/mobile/UPI, then the backend redirects the browser to /go to record
// the click and forward to the advertiser.
export default function CampaignLanding() {
  const [params] = useSearchParams();
  const o = params.get('o');
  const pid = params.get('pid');
  const cid = params.get('cid');
  const as = params.get('as');

  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState({ name: '', mobile: '', upi_id: '' });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!o || !pid || !cid) {
      setLoadError('Invalid request parameters');
      return;
    }
    apiClient
      .get('/o', { params: { o, pid, cid, as: as || undefined } })
      .then(({ data: res }) => setData(res))
      .catch((err) => setLoadError(err.response?.data?.message || 'Failed to load offer'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');

    if (!/^[A-Za-z ]+$/.test(form.name)) {
      setSubmitError('Please enter a valid name (letters and spaces only)');
      return;
    }
    if (!MOBILE_RE.test(form.mobile)) {
      setSubmitError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!UPI_RE.test(form.upi_id)) {
      setSubmitError('Please enter a valid UPI ID (e.g. name@upi)');
      return;
    }

    setSubmitting(true);
    try {
      const { data: res } = await apiClient.post('/o', form, { params: { o, pid, cid, as: as || undefined } });
      window.location.href = res.redirectTo;
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{loadError}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-8">
      <div className="w-full max-w-lg">
        {data.errorMessage && (
          <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">{data.errorMessage}</p>
        )}

        <div className="campaign-glow-border relative rounded-2xl border border-blue-100 bg-white p-6 shadow-lg">
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">{data.offerName}</h1>
          <div className="mb-6 rounded-xl bg-blue-50 p-4 text-center">
            <p className="text-xs text-blue-600">Your Cashback Reward</p>
            <p className="text-3xl font-extrabold text-blue-700">₹{data.totalUserCashback}.00</p>
          </div>

          {submitError && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Your Name" value={form.name} onChange={update('name')} placeholder="e.g. Rahul Sharma" />
            <Field label="Mobile Number" value={form.mobile} onChange={update('mobile')} placeholder="e.g. 9876543210" />
            <Field label="UPI ID" value={form.upi_id} onChange={update('upi_id')} placeholder="yourname@upi" />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Processing...' : `CLAIM YOUR ₹${data.totalUserCashback}`}
            </button>
          </form>

          {data.steps?.length > 0 && (
            <div className="mt-6 rounded-xl border border-blue-100 bg-white p-4">
              <h2 className="mb-3 text-center text-sm font-semibold text-blue-700">How to Complete</h2>
              <ol className="space-y-2">
                {data.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {data.referrer?.telegram && (
          <a
            href={data.referrer.telegram}
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-6 right-6 rounded-full bg-blue-500 p-4 text-white shadow-lg hover:bg-blue-600"
          >
            Telegram
          </a>
        )}
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-blue-700">{label}</label>
      <input
        {...props}
        required
        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}
