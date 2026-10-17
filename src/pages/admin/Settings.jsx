import { useEffect, useRef, useState } from 'react';
import { Globe, ImageUp, KeyRound, Loader2, Mail, Save, Send, Settings as SettingsIcon, Wallet } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePageTitle } from '../../context/SiteContext';
import { Alert, Button, Card, CardHeader, Field, Input, PageHeader, PageSkeleton, Toggle, useToast } from '../../components/ui';
import { errorMessage } from '../../utils/format';

// sadmin/settings.php: site_config row 1 + admins.email, banner / favicon
// uploads (stored in the DB — see siteAsset.service.js), withdrawal switch,
// reCAPTCHA values. Telegram fields are shown read-only, as in legacy.
export default function AdminSettings() {
  usePageTitle('Site settings');
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [original, setOriginal] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await apiClient.get('/admin/settings');
    setForm(data.settings);
    setOriginal(data.settings);
    setAdminEmail(data.settings.adminEmail || '');
  }

  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { siteName, domain, currency, minimumWithdrawal, wstatus, recapthaa, sitekey, secret, banner, favicon } = form;
      await apiClient.put('/admin/settings', { siteName, domain, currency, minimumWithdrawal, wstatus, recapthaa, sitekey, secret, banner, favicon });
      if (adminEmail !== (original.adminEmail || '')) await apiClient.put('/admin/settings/admin-email', { email: adminEmail });
      toast.success('Settings saved');
      await load();
    } catch (err) {
      toast.error(errorMessage(err, 'Update failed'));
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <PageSkeleton />;

  return (
    <form onSubmit={handleSubmit}>
      <PageHeader
        eyebrow="System"
        title="Site settings"
        subtitle="Branding, payouts and security settings for the whole network."
        actions={
          <Button type="submit" loading={saving} icon={Save}>
            Save changes
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader title="General" icon={SettingsIcon} />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Site name" required>
                <Input required value={form.siteName ?? ''} onChange={set('siteName')} />
              </Field>
              <Field label="Domain" required hint="Without https://, e.g. rupitask.xyz">
                <Input icon={Globe} required value={form.domain ?? ''} onChange={set('domain')} />
              </Field>
              <Field label="Admin email" required hint="Used to sign in to this console.">
                <Input icon={Mail} type="email" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
              </Field>
              <Field label="Currency code" required>
                <Input required maxLength={3} value={form.currency ?? ''} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))} />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="Payouts" icon={Wallet} />
            <div className="space-y-5 p-5">
              <Toggle
                checked={form.wstatus === '1'}
                onChange={(v) => setForm((f) => ({ ...f, wstatus: v ? '1' : '0' }))}
                label="Accept withdrawal requests"
                description="When off, no publisher can request a payout (individual publishers can also be blocked from their profile)."
              />
              <Field label="Minimum withdrawal (₹)" required className="sm:max-w-xs">
                <Input type="number" step="0.01" min="0" required value={form.minimumWithdrawal ?? ''} onChange={set('minimumWithdrawal')} />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="reCAPTCHA" icon={KeyRound} />
            <div className="space-y-4 p-5">
              <Alert tone="info">
                Login and sign-up verification is enforced with the server's <code className="font-mono">RECAPTCHA_SITE_KEY</code> / <code className="font-mono">RECAPTCHA_SECRET_KEY</code> environment variables. The values below are the stored legacy settings.
              </Alert>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Version">
                  <Input placeholder="v2" value={form.recapthaa ?? ''} onChange={set('recapthaa')} />
                </Field>
                <Field label="Site key">
                  <Input className="font-mono text-xs" value={form.sitekey ?? ''} onChange={set('sitekey')} />
                </Field>
                <Field label="Secret key" className="sm:col-span-2">
                  <Input type="password" className="font-mono text-xs" value={form.secret ?? ''} onChange={set('secret')} autoComplete="off" />
                </Field>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Branding" icon={ImageUp} />
            <div className="space-y-6 p-5">
              <AssetUpload
                kind="banner"
                label="Site banner"
                hint="JPG, PNG, GIF or WebP · up to 2 MB"
                accept="image/jpeg,image/png,image/gif,image/webp"
                value={form.banner}
                onUploaded={(url) => setForm((f) => ({ ...f, banner: url }))}
                wide
              />
              <AssetUpload
                kind="favicon"
                label="Favicon"
                hint="ICO, PNG, GIF or JPG · up to 500 KB"
                accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/gif,image/jpeg"
                value={form.favicon}
                onUploaded={(url) => setForm((f) => ({ ...f, favicon: url }))}
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="Telegram alerts" subtitle="Read-only — configured on the server" icon={Send} />
            <dl className="divide-y divide-line px-5">
              <div className="flex justify-between gap-4 py-3 text-sm">
                <dt className="text-ink-500">Chat ID</dt>
                <dd className="font-mono text-xs font-semibold text-ink-900">{form.telegramChatId || 'Not set'}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3 text-sm">
                <dt className="text-ink-500">Bot token</dt>
                <dd className="font-mono text-xs font-semibold text-ink-900">{form.telegramBotToken ? `${form.telegramBotToken.slice(0, 6)}••••••` : 'Not set'}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </form>
  );
}

function AssetUpload({ kind, label, hint, accept, value, onUploaded, wide }) {
  const toast = useToast();
  const input = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file) {
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    setUploading(true);
    try {
      const { data } = await apiClient.post(`/admin/settings/upload/${kind}`, body);
      onUploaded(data.url);
      toast.success(data.message);
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-ink-700">{label}</p>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files?.[0]);
        }}
        className="group relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-line bg-slate-50/70 p-5 text-center transition hover:border-brand-300 hover:bg-brand-50/40"
        style={{ minHeight: wide ? 140 : 110 }}
      >
        {value ? (
          <img src={value} alt="" className={wide ? 'max-h-28 w-full rounded-lg object-contain' : 'h-12 w-12 rounded-lg object-contain'} />
        ) : (
          <ImageUp className="h-7 w-7 text-ink-400 group-hover:text-brand-500" />
        )}
        <span className="text-xs font-semibold text-ink-700">{uploading ? 'Uploading…' : value ? 'Click or drop to replace' : 'Click or drop an image'}</span>
        <span className="text-[11px] text-ink-400">{hint}</span>
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          </span>
        )}
      </button>
      <input ref={input} type="file" accept={accept} className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
    </div>
  );
}
