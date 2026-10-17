import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Rocket,
  UserRound,
  Wallet,
  Webhook,
  CheckCircle2,
} from 'lucide-react';
import AppShell from './AppShell';
import { usePublisherAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { formatCurrency } from '../utils/format';

// Same destinations as the legacy publisher/sidebar.php, grouped into
// sections: dashboard, offers & campaigns, reports & conversions, wallet,
// and the account/settings pages (profile, postback, API docs, support).
const SECTIONS = [
  { label: 'Overview', items: [{ to: '/publisher/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    label: 'Monetize',
    items: [
      { to: '/publisher/offers', label: 'Offers', icon: Megaphone },
      { to: '/publisher/campaigns', label: 'Campaigns', icon: Rocket },
    ],
  },
  {
    label: 'Performance',
    items: [
      { to: '/publisher/reports', label: 'Reports', icon: BarChart3 },
      { to: '/publisher/conversions', label: 'Conversions', icon: CheckCircle2 },
    ],
  },
  { label: 'Earnings', items: [{ to: '/publisher/wallet', label: 'Wallet', icon: Wallet }] },
  {
    label: 'Developers',
    items: [
      { to: '/publisher/postback', label: 'Postbacks', icon: Webhook },
      { to: '/publisher/api-documentation', label: 'API Documentation', icon: BookOpen },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/publisher/profile', label: 'Profile', icon: UserRound },
      { to: '/publisher/support', label: 'Support', icon: LifeBuoy },
    ],
  },
];

const USER_LINKS = [
  { to: '/publisher/profile', label: 'Profile settings', icon: UserRound },
  { to: '/publisher/wallet', label: 'Wallet & payouts', icon: Wallet },
  { to: '/publisher/support', label: 'Help & support', icon: LifeBuoy },
];

function SupportCard() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand-600/40 to-accent-600/30 p-4 ring-1 ring-white/10">
      <p className="text-sm font-bold text-white">Need a hand?</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-300">Our affiliate team replies fast on Telegram and WhatsApp.</p>
      <Link
        to="/publisher/support"
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ink-900 transition hover:bg-brand-50"
      >
        <LifeBuoy className="h-3.5 w-3.5" /> Contact support
      </Link>
    </div>
  );
}

export default function PublisherLayout() {
  const { user, logout } = usePublisherAuth();
  const { pathname } = useLocation();
  const [balance, setBalance] = useState(null);

  // Refresh the balance chip on navigation so it reflects withdrawals and
  // new conversions without a full reload.
  useEffect(() => {
    apiClient
      .get('/publisher/wallet')
      .then(({ data }) => setBalance(Number(data.walletBalance)))
      .catch(() => {});
  }, [pathname]);

  return (
    <AppShell
      sections={SECTIONS}
      subtitle="Publisher"
      roleLabel="Publisher"
      user={user}
      onLogout={logout}
      userLinks={USER_LINKS}
      sidebarFooter={<SupportCard />}
      headerExtra={
        balance !== null && (
          <Link
            to="/publisher/wallet"
            className="hidden items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 px-3.5 py-2 text-sm ring-1 ring-emerald-200/70 transition hover:ring-emerald-300 sm:flex"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <Wallet className="h-3.5 w-3.5" />
            </span>
            <span className="font-extrabold text-emerald-800 tabular-nums">{formatCurrency(balance)}</span>
          </Link>
        )
      }
    />
  );
}

