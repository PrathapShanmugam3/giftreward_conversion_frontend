import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';

export default function Invoice() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    apiClient.get(`/publisher/wallet/withdrawals/${id}/invoice`).then(({ data }) => setInvoice(data));
  }, [id]);

  if (!invoice) return <p className="text-sm text-gray-500">Loading...</p>;

  const { withdrawal, user } = invoice;

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-8 print:border-0">
      <h1 className="mb-6 text-center text-xl font-bold text-gray-800">Withdrawal Invoice</h1>
      <dl className="space-y-3 text-sm">
        <Row label="Invoice #" value={`WD-${withdrawal.id}`} />
        <Row label="Publisher" value={`${user.name} (${user.email})`} />
        <Row label="Amount" value={`₹${withdrawal.amount}`} />
        <Row label="Method" value={withdrawal.method} />
        <Row label="Details" value={withdrawal.details} />
        <Row label="Status" value={withdrawal.status} />
        <Row label="Requested" value={new Date(withdrawal.createdAt).toLocaleString()} />
        {withdrawal.processedAt && <Row label="Processed" value={new Date(withdrawal.processedAt).toLocaleString()} />}
        {withdrawal.notes && <Row label="Notes" value={withdrawal.notes} />}
      </dl>
      <button onClick={() => window.print()} className="mt-6 w-full rounded-md bg-gray-100 py-2 text-sm font-medium text-gray-700 print:hidden">
        Print
      </button>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-800">{value}</dd>
    </div>
  );
}
