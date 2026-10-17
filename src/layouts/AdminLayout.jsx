import {
  Banknote,
  BarChart3,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  Mail,
  Megaphone,
  Settings,
  ShieldCheck,
  Users,
  Webhook,
} from 'lucide-react';
import AppShell from './AppShell';
import { useAdminAuth } from '../context/AuthContext';

// Covers every page of the legacy sadmin/includes/sidebar.php (offers &
// requests, publishers & custom email, conversions/reports/campaign stats,
// withdrawals, gateways, postback logs/approvals + URL/fire tools, general
// settings + IP whitelist), regrouped into labelled sections.
const SECTIONS = [
  { label: 'Overview', items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    label: 'Catalogue',
    items: [
      {
        label: 'Offers',
        icon: Megaphone,
        children: [
          { to: '/admin/offers', label: 'All Offers' },
          { to: '/admin/offer-requests', label: 'Access Requests' },
        ],
      },
      {
        label: 'Publishers',
        icon: Users,
        children: [
          { to: '/admin/publishers', label: 'All Publishers' },
          { to: '/admin/custom-email', label: 'Send Email' },
        ],
      },
    ],
  },
  {
    label: 'Performance',
    items: [
      {
        label: 'Reports',
        icon: BarChart3,
        children: [
          { to: '/admin/conversions', label: 'Conversions' },
          { to: '/admin/reports', label: 'Click Reports' },
          { to: '/admin/campaign-stats', label: 'Offer Stats' },
        ],
      },
      {
        label: 'Postbacks',
        icon: Webhook,
        children: [
          { to: '/admin/postbacks', label: 'Logs & Approvals' },
          { to: '/admin/postback-tools', label: 'Postback URL & Fire' },
        ],
      },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/admin/withdrawals', label: 'Withdrawals', icon: Banknote },
      { to: '/admin/gateways', label: 'Payment Gateways', icon: CreditCard },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/settings', label: 'Site Settings', icon: Settings },
      { to: '/admin/ip-whitelist', label: 'IP Whitelist', icon: ShieldCheck },
    ],
  },
];

const USER_LINKS = [
  { to: '/admin/settings', label: 'Site settings', icon: Settings },
  { to: '/admin/custom-email', label: 'Email publishers', icon: Mail },
];

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  return (
    <AppShell
      sections={SECTIONS}
      subtitle="Admin"
      roleLabel="Super Admin"
      user={user}
      onLogout={logout}
      userLinks={USER_LINKS}
      sidebarFooter={
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5 text-xs font-medium text-slate-400 ring-1 ring-white/[0.06] transition hover:text-white"
        >
          View public site
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      }
    />
  );
}
