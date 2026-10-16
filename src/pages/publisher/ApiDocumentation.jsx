import { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import { apiClient } from '../../api/client';
import Loader from '../../components/Loader';

// Mirrors publisher/api-documentation.php: the publisher's own API key
// (users.auth_token) plus usage docs for GET /report (replaces the legacy
// api.php — see CUTOVER.md's URL-rename note).
export default function PublisherApiDocumentation() {
  const [info, setInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiClient.get('/publisher/api-info').then(({ data }) => setInfo(data));
  }, []);

  if (!info) return <Loader />;

  function handleCopy() {
    navigator.clipboard.writeText(info.authToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const exampleUrl = `${info.reportUrl}?auth-token=${info.authToken}&report=3`;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">API Documentation</h1>
        <p className="text-gray-600">Access your conversion data programmatically using our API</p>
      </div>

      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Your API Authentication</h2>
        <label className="mb-2 block text-sm font-medium text-gray-900">Your API Key</label>
        <div className="flex">
          <input
            readOnly
            value={info.authToken}
            className="block w-full rounded-l-lg border border-gray-300 bg-gray-50 p-2.5 font-mono text-sm text-gray-900"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-r-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
          >
            <Copy className="h-4 w-4" />
            {copied ? 'Copied!' : ''}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">Keep this token secure. Do not share it with anyone.</p>
      </div>

      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-800">API Endpoints</h2>

        <h3 className="mb-2 text-lg font-semibold">Conversion Reports</h3>
        <div className="mb-4 overflow-x-auto rounded-lg bg-gray-800 p-4 text-gray-100">
          <code className="text-sm">
            GET {info.reportUrl}?auth-token=YOUR_AUTH_TOKEN&report=TIME_PERIOD
          </code>
        </div>

        <h4 className="mb-2 font-medium text-gray-700">Parameters</h4>
        <div className="mb-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-4 py-2">Parameter</th>
                <th className="px-4 py-2">Required</th>
                <th className="px-4 py-2">Values</th>
                <th className="px-4 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b bg-white">
                <td className="px-4 py-3 font-medium text-gray-900">auth-token</td>
                <td className="px-4 py-3">Yes</td>
                <td className="px-4 py-3">Your API key</td>
                <td className="px-4 py-3">Authentication token</td>
              </tr>
              <tr className="border-b bg-white">
                <td className="px-4 py-3 font-medium text-gray-900">report</td>
                <td className="px-4 py-3">Yes</td>
                <td className="px-4 py-3">1-5</td>
                <td className="px-4 py-3">
                  1 = Today, 2 = Yesterday, 3 = Last 7 days, 4 = Last 30 days, 5 = This month
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="mb-2 font-medium text-gray-700">Example Request</h4>
        <div className="mb-4 overflow-x-auto rounded-lg bg-gray-800 p-4 text-gray-100">
          <code className="text-sm">curl -X GET "{exampleUrl}"</code>
        </div>

        <h4 className="mb-2 font-medium text-gray-700">Example Response</h4>
        <pre className="overflow-x-auto rounded-lg bg-gray-800 p-4 text-sm text-gray-100">
{`{
  "success": true,
  "message": "Success",
  "data": [
    {
      "offerid": 123,
      "clickid": "abc123xyz",
      "event": "lead",
      "payout": 1.50,
      "status": "approved",
      "timestamp": "2026-07-20 14:30:22"
    }
  ]
}`}
        </pre>

        <h3 className="mt-6 mb-2 text-lg font-semibold">Response Codes</h3>
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b bg-white">
              <td className="px-4 py-3 font-medium text-gray-900">200</td>
              <td className="px-4 py-3">Always returned — check the "success" field in the body for errors</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Example (Python)</h2>
        <pre className="overflow-x-auto rounded-lg bg-gray-800 p-4 text-sm text-gray-100">
{`import requests

response = requests.get("${info.reportUrl}", params={
    "auth-token": "YOUR_AUTH_TOKEN",
    "report": 3,
})
data = response.json()
if data["success"]:
    for conversion in data["data"]:
        print(conversion)`}
        </pre>
      </div>
    </div>
  );
}
