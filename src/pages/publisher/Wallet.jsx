import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import Loader from '../../components/Loader';

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function PublisherWallet() {
  const [overview, setOverview] = useState(null);
  const [form, setForm] = useState({ amount: '', method: 'upi', details: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const { data } = await apiClient.get('/publisher/wallet');
    setOverview(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const { data } = await apiClient.post('/publisher/wallet/withdrawals', form);
      setMessage(data.message);
      setForm({ amount: '', method: 'upi', details: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.details?.[0]?.msg || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (!overview) return <Loader />;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-800">Wallet</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-xs text-gray-500">Wallet Balance</p>
          <p className="mt-1 text-3xl font-bold text-gray-800">₹{Number(overview.walletBalance).toFixed(2)}</p>
          {!overview.withdrawalStatus && (
            <p className="mt-2 rounded-md bg-yellow-50 px-2 py-1 text-xs text-yellow-700">
              Withdrawals are currently disabled for your account.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Request Withdrawal</h2>
          {error && <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          {message && <p className="mb-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              required
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <select
              value={form.method}
              onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="upi">UPI</option>
              <option value="bank">Bank Transfer</option>
              <option value="paypal">PayPal</option>
            </select>
            <input
              type="text"
              placeholder="Account details (UPI ID / bank info)"
              required
              value={form.details}
              onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Request Withdrawal'}
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Recent Transactions</h2>
          <TransactionsTable transactions={overview.transactions} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Withdrawal Requests</h2>
          <WithdrawalsTable withdrawals={overview.withdrawals} />
        </div>
      </div>
    </div>
  );
}

function TransactionsTable({ transactions }) {
  if (transactions.length === 0) return <p className="text-sm text-gray-500">No transactions yet.</p>;
  return (
    <table className="min-w-full divide-y divide-gray-200 text-sm">
      <tbody className="divide-y divide-gray-100">
        {transactions.map((t) => (
          <tr key={t.id}>
            <td className="py-2 pr-2 text-gray-700">{t.reason}</td>
            <td className={`py-2 text-right font-medium ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
              {t.type === 'credit' ? '+' : '-'}₹{t.amount}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function WithdrawalsTable({ withdrawals }) {
  if (withdrawals.length === 0) return <p className="text-sm text-gray-500">No withdrawal requests yet.</p>;
  return (
    <table className="min-w-full divide-y divide-gray-200 text-sm">
      <tbody className="divide-y divide-gray-100">
        {withdrawals.map((w) => (
          <tr key={w.id}>
            <td className="py-2 pr-2 text-gray-700">
              ₹{w.amount} via {w.method}
            </td>
            <td className="py-2 text-right">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[w.status]}`}>{w.status}</span>
            </td>
            <td className="py-2 pl-2 text-right">
              <a href={`/publisher/wallet/withdrawals/${w.id}/invoice`} className="text-xs font-medium text-blue-600">
                Invoice
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
