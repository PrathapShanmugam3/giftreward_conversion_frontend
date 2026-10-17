import { useEffect, useState } from 'react';
import { BookOpen, KeyRound, ShieldAlert, Terminal } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import { Alert, Badge, Card, CardHeader, CopyButton, CopyField, PageHeader, PageSkeleton, Segmented, Table, Td, Th, THead, Tr } from '../../components/ui';

const REPORTS = [
  ['1', 'Today'],
  ['2', 'Yesterday'],
  ['3', 'Last 7 days'],
  ['4', 'Last 30 days'],
  ['5', 'This month'],
];

function CodeBlock({ code, label }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#0b1020] ring-1 ring-white/5">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          {label && <span className="ml-2 text-[11px] font-semibold text-slate-500">{label}</span>}
        </div>
        <CopyButton text={code} className="bg-white/10 text-slate-200 ring-white/10 hover:bg-white/15" />
      </div>
      <pre className="scroll-thin overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-slate-200">{code}</pre>
    </div>
  );
}

// publisher/api-documentation.php: the publisher's API key (users.auth_token)
// and usage of GET /report (the endpoint that replaced the legacy api.php).
export default function PublisherApiDocumentation() {
  usePageTitle('API documentation');
  const [info, setInfo] = useState(null);
  const [lang, setLang] = useState('curl');

  useEffect(() => {
    apiClient.get('/publisher/api-info').then(({ data }) => setInfo(data));
  }, []);

  if (!info) return <PageSkeleton />;

  const url = `${info.reportUrl}?auth-token=YOUR_API_KEY&report=3`;
  const samples = {
    curl: `curl -X GET "${url}"`,
    python: `import requests

response = requests.get("${info.reportUrl}", params={
    "auth-token": "YOUR_API_KEY",
    "report": 3,  # last 7 days
})
data = response.json()
if data["success"]:
    for conversion in data["data"]:
        print(conversion["clickid"], conversion["payout"])`,
    node: `const res = await fetch("${url}");
const data = await res.json();
if (data.success) {
  for (const c of data.data) console.log(c.clickid, c.payout);
}`,
    php: `<?php
$res = file_get_contents("${url}");
$data = json_decode($res, true);
if ($data["success"]) {
    foreach ($data["data"] as $c) echo $c["clickid"] . " " . $c["payout"] . PHP_EOL;
}`,
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Developers" title="Reporting API" subtitle="Pull your conversions into your own dashboards, sheets or tracking stack." />

      <Card>
        <CardHeader title="Your API key" subtitle="Authenticates every request — treat it like a password." icon={KeyRound} />
        <div className="space-y-4 p-5">
          <CopyField value={info.authToken} />
          <Alert tone="warning">Never share this key or put it in client-side code. Anyone with it can read your conversion data.</Alert>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Conversion report" icon={BookOpen} actions={<Badge tone="success">GET</Badge>} />
          <div className="space-y-6 p-5">
            <CodeBlock label="Endpoint" code={`GET ${info.reportUrl}?auth-token={API_KEY}&report={1-5}`} />

            <div>
              <h3 className="mb-3 text-sm font-bold text-ink-900">Query parameters</h3>
              <div className="overflow-hidden rounded-2xl ring-1 ring-line">
                <Table>
                  <THead>
                    <tr>
                      <Th>Parameter</Th>
                      <Th>Required</Th>
                      <Th>Description</Th>
                    </tr>
                  </THead>
                  <tbody>
                    <Tr>
                      <Td className="font-mono text-xs font-semibold text-brand-700">auth-token</Td>
                      <Td>
                        <Badge tone="danger">required</Badge>
                      </Td>
                      <Td>Your API key from above.</Td>
                    </Tr>
                    <Tr>
                      <Td className="font-mono text-xs font-semibold text-brand-700">report</Td>
                      <Td>
                        <Badge tone="danger">required</Badge>
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-1.5">
                          {REPORTS.map(([v, l]) => (
                            <span key={v} className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs">
                              <span className="font-mono font-bold">{v}</span> {l}
                            </span>
                          ))}
                        </div>
                      </Td>
                    </Tr>
                  </tbody>
                </Table>
              </div>
            </div>

            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-bold text-ink-900">
                  <Terminal className="h-4 w-4 text-ink-400" /> Example request
                </h3>
                <Segmented size="sm" value={lang} onChange={setLang} options={[{ value: 'curl', label: 'cURL' }, { value: 'python', label: 'Python' }, { value: 'node', label: 'Node.js' }, { value: 'php', label: 'PHP' }]} />
              </div>
              <CodeBlock code={samples[lang]} />
            </div>
          </div>
        </Card>

        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader title="Example response" />
            <div className="p-5">
              <CodeBlock
                code={`{
  "success": true,
  "message": "Success",
  "data": [
    {
      "offerid": 123,
      "clickid": "65f1c2a9e4b7d",
      "event": "install",
      "payout": 1.50,
      "status": "approved",
      "timestamp": "2026-07-20 14:30:22"
    }
  ]
}`}
              />
            </div>
          </Card>
          <Card>
            <CardHeader title="Errors" icon={ShieldAlert} />
            <div className="space-y-3 p-5 text-sm text-ink-700">
              <p>
                Responses always return HTTP <span className="font-mono font-bold">200</span>. Check the <span className="font-mono font-bold">success</span> field — when it's{' '}
                <span className="font-mono">false</span>, <span className="font-mono">message</span> explains why (missing or invalid key, bad report value).
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
