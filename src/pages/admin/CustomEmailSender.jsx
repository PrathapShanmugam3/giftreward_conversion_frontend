import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Mail, Paperclip, Search, Send, UserCheck, Users, X } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import { BRAND } from '../../config/brand';
import { Alert, Avatar, Button, Card, CardHeader, Checkbox, Field, Input, PageHeader, PageSkeleton, Segmented, Select, StatCard, Textarea, useToast } from '../../components/ui';
import { cn, errorMessage, formatNumber } from '../../utils/format';

const MAX_FILES = 5;
const MAX_FILE_BYTES = 3 * 1024 * 1024;

// sadmin/custom_email_sender.php: HTML email to all active / selected /
// single publisher(s) with {name} {company_name} {year} substitution and
// optional attachments (sent as multipart, kept in memory server-side).
export default function CustomEmailSender() {
  usePageTitle('Email publishers');
  const toast = useToast();
  const fileInput = useRef(null);
  const [publishers, setPublishers] = useState(null);
  const [stats, setStats] = useState(null);
  const [recipientType, setRecipientType] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [singleId, setSingleId] = useState('');
  const [filter, setFilter] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    apiClient.get('/admin/custom-email/publishers').then(({ data }) => setPublishers(data.publishers));
    apiClient.get('/admin/custom-email/stats').then(({ data }) => setStats(data.stats));
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return (publishers || []).filter((p) => !q || `${p.name} ${p.email} ${p.companyName || ''}`.toLowerCase().includes(q));
  }, [publishers, filter]);

  if (!publishers || !stats) return <PageSkeleton />;

  const preview = message.replaceAll('{name}', 'Rahul Sharma').replaceAll('{company_name}', BRAND.name).replaceAll('{year}', String(new Date().getFullYear()));
  const recipientCount = recipientType === 'all' ? stats.activePublishers : recipientType === 'selected' ? selectedIds.size : singleId ? 1 : 0;

  function addFiles(list) {
    const incoming = [...list];
    const tooBig = incoming.find((f) => f.size > MAX_FILE_BYTES);
    if (tooBig) toast.error(`${tooBig.name} is larger than 3 MB`);
    setFiles((cur) => [...cur, ...incoming.filter((f) => f.size <= MAX_FILE_BYTES)].slice(0, MAX_FILES));
    if (fileInput.current) fileInput.current.value = '';
  }

  function toggle(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSend(e) {
    e.preventDefault();
    setResult(null);
    if (recipientCount === 0) {
      toast.error('Choose at least one recipient');
      return;
    }
    const body = new FormData();
    body.append('recipientType', recipientType);
    body.append('subject', subject);
    body.append('message', message);
    if (recipientType === 'selected') body.append('publisherIds', JSON.stringify([...selectedIds]));
    if (recipientType === 'single') body.append('singlePublisherId', singleId);
    files.forEach((f) => body.append('attachments', f));

    setSending(true);
    try {
      const { data } = await apiClient.post('/admin/custom-email/send', body);
      setResult(data);
      toast.success(`Sent to ${data.successCount} of ${data.total} recipient${data.total === 1 ? '' : 's'}`);
      setSubject('');
      setMessage('');
      setFiles([]);
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to send email'));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Catalogue" title="Email publishers" subtitle="Send announcements, payout notices or offer news to your publishers." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total publishers" value={formatNumber(stats.totalPublishers)} icon={Users} tone="brand" />
        <StatCard label="Active (reachable)" value={formatNumber(stats.activePublishers)} icon={UserCheck} tone="success" />
        <StatCard label="Inactive" value={formatNumber(stats.inactivePublishers)} icon={Users} tone="slate" />
      </div>

      {result && (
        <Alert tone={result.errorCount ? 'warning' : 'success'} title={`Delivered to ${result.successCount} of ${result.total}`}>
          {result.errorCount > 0 && <>Failures: {result.errors.join(' · ')}</>}
        </Alert>
      )}

      <form onSubmit={handleSend} className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-3">
          <Card>
            <CardHeader title="Recipients" subtitle={`${recipientCount} recipient${recipientCount === 1 ? '' : 's'}`} icon={Users} />
            <div className="space-y-4 p-5">
              <Segmented
                value={recipientType}
                onChange={setRecipientType}
                options={[
                  { value: 'all', label: 'All active' },
                  { value: 'selected', label: 'Pick publishers' },
                  { value: 'single', label: 'One publisher' },
                ]}
              />
              {recipientType === 'all' && <p className="text-sm text-ink-500">Goes to every active publisher ({stats.activePublishers}).</p>}
              {recipientType === 'single' && (
                <Select value={singleId} onChange={(e) => setSingleId(e.target.value)}>
                  <option value="">Choose a publisher…</option>
                  {publishers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.email}
                    </option>
                  ))}
                </Select>
              )}
              {recipientType === 'selected' && (
                <div className="overflow-hidden rounded-2xl ring-1 ring-line">
                  <div className="flex items-center gap-2 border-b border-line bg-slate-50 p-2">
                    <Input icon={Search} placeholder="Filter publishers…" value={filter} onChange={(e) => setFilter(e.target.value)} className="flex-1" />
                    <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set(filtered.map((p) => p.id)))}>
                      All
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                      None
                    </Button>
                  </div>
                  <div className="scroll-thin max-h-72 divide-y divide-line overflow-y-auto">
                    {filtered.map((p) => (
                      <label key={p.id} className={cn('flex cursor-pointer items-center gap-3 px-4 py-2.5 transition hover:bg-slate-50', selectedIds.has(p.id) && 'bg-brand-50/50')}>
                        <Checkbox checked={selectedIds.has(p.id)} onChange={() => toggle(p.id)} />
                        <Avatar name={p.name} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink-900">{p.name}</span>
                          <span className="block truncate text-xs text-ink-500">{p.email}</span>
                        </span>
                      </label>
                    ))}
                    {filtered.length === 0 && <p className="px-4 py-6 text-center text-sm text-ink-500">No publishers match.</p>}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Message" icon={Mail} />
            <div className="space-y-4 p-5">
              <Field label="Subject" required>
                <Input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. New high-payout offers this week" />
              </Field>
              <Field label="Body (HTML allowed)" required hint="Use {name}, {company_name} and {year} — they're filled in per recipient.">
                <Textarea rows={10} required value={message} onChange={(e) => setMessage(e.target.value)} placeholder={'<p>Hi {name},</p>\n<p>…</p>'} className="font-mono text-xs" />
              </Field>
              <div className="flex flex-wrap gap-1.5">
                {['{name}', '{company_name}', '{year}'].map((v) => (
                  <button key={v} type="button" onClick={() => setMessage((m) => `${m}${v}`)} className="rounded-lg bg-brand-50 px-2 py-1 font-mono text-[11px] font-medium text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100">
                    {v}
                  </button>
                ))}
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-ink-700">Attachments</p>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    addFiles(e.dataTransfer.files);
                  }}
                  className="rounded-2xl border-2 border-dashed border-line bg-slate-50/70 p-4"
                >
                  {files.length > 0 && (
                    <ul className="mb-3 space-y-1.5">
                      {files.map((f, i) => (
                        <li key={`${f.name}-${i}`} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-line">
                          <Paperclip className="h-4 w-4 text-ink-400" />
                          <span className="min-w-0 flex-1 truncate font-medium text-ink-900">{f.name}</span>
                          <span className="text-xs text-ink-400">{(f.size / 1024).toFixed(0)} KB</span>
                          <button type="button" onClick={() => setFiles((cur) => cur.filter((_, j) => j !== i))} className="text-ink-400 hover:text-rose-600" aria-label="Remove attachment">
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-ink-500">Drop files here · up to {MAX_FILES} files, 3 MB each</p>
                    <Button size="sm" variant="secondary" icon={Paperclip} disabled={files.length >= MAX_FILES} onClick={() => fileInput.current?.click()}>
                      Attach files
                    </Button>
                  </div>
                  <input ref={fileInput} type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-2">
          <div className="space-y-4 xl:sticky xl:top-24">
            <Card className="overflow-hidden">
              <CardHeader title="Preview" subtitle="With sample values" icon={Eye} />
              <div className="bg-slate-100 p-4">
                <div className="overflow-hidden rounded-xl bg-white shadow-card">
                  <div className="border-b border-line px-4 py-3">
                    <p className="text-[11px] text-ink-400">Subject</p>
                    <p className="truncate text-sm font-bold text-ink-900">{subject || 'Your subject line'}</p>
                  </div>
                  <div
                    className="min-h-[200px] px-4 py-4 text-sm leading-relaxed text-ink-700 [&_a]:text-brand-600 [&_a]:underline [&_p]:mb-3"
                    dangerouslySetInnerHTML={{ __html: preview || '<p style="color:#94a3b8">Your message preview appears here.</p>' }}
                  />
                  {files.length > 0 && (
                    <div className="border-t border-line px-4 py-2.5 text-xs text-ink-500">
                      <Paperclip className="mr-1 inline h-3.5 w-3.5" />
                      {files.length} attachment{files.length === 1 ? '' : 's'}
                    </div>
                  )}
                </div>
              </div>
            </Card>
            <Button type="submit" size="lg" className="w-full" loading={sending} icon={Send}>
              Send to {recipientCount} recipient{recipientCount === 1 ? '' : 's'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
