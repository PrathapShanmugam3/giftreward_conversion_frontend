import { useEffect, useState } from 'react';
import { BookOpen, Building2, KeyRound, Lock, Mail, Phone, Save, ShieldCheck, User } from 'lucide-react';
import { apiClient } from '../../api/client';
import { usePublisherAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../context/SiteContext';
import { Alert, Avatar, Button, Card, CardHeader, Field, Input, PageHeader, PageSkeleton, StatusBadge } from '../../components/ui';
import { errorMessage, formatCurrency, formatDate } from '../../utils/format';

// publisher/profile.php: edit details (unique email) and change password,
// which requires the current password (min 8 chars for the new one).
export default function PublisherProfile() {
  usePageTitle('Profile');
  const { updateUser } = usePublisherAuth();
  const [form, setForm] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [detailsMsg, setDetailsMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    apiClient.get('/publisher/profile').then(({ data }) => {
      setProfile(data.user);
      setForm({ name: data.user.name, email: data.user.email, companyName: data.user.companyName, contactNumber: data.user.contactNumber });
    });
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function saveDetails(e) {
    e.preventDefault();
    setDetailsMsg(null);
    setSavingDetails(true);
    try {
      const { data } = await apiClient.put('/publisher/profile', form);
      setProfile(data.user);
      updateUser({ name: data.user.name, email: data.user.email });
      setDetailsMsg({ tone: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setDetailsMsg({ tone: 'danger', text: errorMessage(err, 'Update failed') });
    } finally {
      setSavingDetails(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwMsg(null);
    if (pw.newPassword !== pw.confirm) {
      setPwMsg({ tone: 'danger', text: 'New passwords do not match.' });
      return;
    }
    setSavingPw(true);
    try {
      await apiClient.put('/publisher/profile', { ...form, currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwMsg({ tone: 'success', text: 'Password changed. Use it next time you sign in.' });
    } catch (err) {
      setPwMsg({ tone: 'danger', text: errorMessage(err, 'Password change failed') });
    } finally {
      setSavingPw(false);
    }
  }

  if (!form) return <PageSkeleton />;

  return (
    <div>
      <PageHeader eyebrow="Account" title="Profile settings" subtitle="Keep your contact details current so payouts and notices reach you." />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="h-fit overflow-hidden">
          <div className="h-24 bg-gradient-to-br from-brand-600 via-brand-500 to-accent-600" />
          <div className="-mt-10 px-6 pb-6 text-center">
            <Avatar name={profile.name} size="lg" className="mx-auto h-20 w-20 text-2xl ring-4" />
            <p className="mt-3 text-lg font-extrabold text-ink-900">{profile.name}</p>
            <p className="text-sm text-ink-500">{profile.email}</p>
            <div className="mt-3 flex justify-center">
              <StatusBadge status={profile.status ? 'active' : 'locked'} label={profile.status ? 'Active account' : 'Locked'} />
            </div>
            <dl className="mt-6 divide-y divide-line rounded-2xl text-left ring-1 ring-line">
              <div className="flex justify-between px-4 py-3 text-sm">
                <dt className="text-ink-500">Publisher ID</dt>
                <dd className="font-mono font-bold text-ink-900">#{profile.id}</dd>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <dt className="text-ink-500">Wallet</dt>
                <dd className="font-bold text-emerald-600 tabular-nums">{formatCurrency(profile.walletBalance)}</dd>
              </div>
              {profile.createdAt && (
                <div className="flex justify-between px-4 py-3 text-sm">
                  <dt className="text-ink-500">Member since</dt>
                  <dd className="font-semibold text-ink-900">{formatDate(profile.createdAt)}</dd>
                </div>
              )}
            </dl>
            <Button to="/publisher/api-documentation" variant="soft" className="mt-4 w-full" icon={BookOpen}>
              API key & docs
            </Button>
          </div>
        </Card>

        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader title="Personal details" icon={User} />
            <form onSubmit={saveDetails} className="space-y-4 p-5">
              {detailsMsg && <Alert tone={detailsMsg.tone}>{detailsMsg.text}</Alert>}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required>
                  <Input icon={User} required value={form.name} onChange={update('name')} />
                </Field>
                <Field label="Email" required>
                  <Input icon={Mail} type="email" required value={form.email} onChange={update('email')} />
                </Field>
                <Field label="Company" required>
                  <Input icon={Building2} required value={form.companyName} onChange={update('companyName')} />
                </Field>
                <Field label="Contact number" required>
                  <Input icon={Phone} required value={form.contactNumber} onChange={update('contactNumber')} />
                </Field>
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={savingDetails} icon={Save}>
                  Save details
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader title="Change password" subtitle="You'll need your current password." icon={ShieldCheck} />
            <form onSubmit={savePassword} className="space-y-4 p-5">
              {pwMsg && <Alert tone={pwMsg.tone}>{pwMsg.text}</Alert>}
              <Field label="Current password" required>
                <Input icon={Lock} type="password" required autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="New password" required hint="At least 8 characters.">
                  <Input icon={KeyRound} type="password" required minLength={8} autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} />
                </Field>
                <Field label="Confirm new password" required>
                  <Input icon={KeyRound} type="password" required minLength={8} autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} />
                </Field>
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="dark" loading={savingPw} icon={ShieldCheck}>
                  Update password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
