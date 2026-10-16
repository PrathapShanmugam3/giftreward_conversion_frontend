import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

// Mirrors the legacy sadmin/includes/sidebar.php grouping: Dashboard,
// a collapsible "Offers" group (All Offers + Requested Offers), Publishers,
// Send Mail (not yet implemented in React — omitted), a collapsible
// "Reports & Conversions" group (Conversions, Campaign Stats, Reports),
// Withdrawals, Payment Gateways, Postbacks, and Settings (General + IP
// Whitelist). Icons are simple inline SVGs standing in for the legacy
// Font Awesome glyphs (fa-tachometer-alt, fa-ad, fa-users, fa-chart-bar,
// fa-money-bill-wave, fa-server, fa-cog, etc).
const singleItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
];

const groups = [
  {
    key: 'offers',
    label: 'Offers',
    icon: 'offers',
    items: [
      { to: '/admin/offers', label: 'All Offers' },
      { to: '/admin/offer-requests', label: 'Requested Offers' },
    ],
  },
];

const publishersGroup = {
  key: 'publishers',
  label: 'Publishers',
  icon: 'publishers',
  items: [
    { to: '/admin/publishers', label: 'All Publishers' },
    { to: '/admin/custom-email', label: 'Send Custom Email' },
  ],
};

const reportGroup = {
  key: 'reports',
  label: 'Reports & Conversions',
  icon: 'reports',
  items: [
    { to: '/admin/conversions', label: 'Conversions' },
    { to: '/admin/campaign-stats', label: 'Campaign Stats' },
    { to: '/admin/reports', label: 'Reports' },
  ],
};

const afterReports = [
  { to: '/admin/withdrawals', label: 'Withdrawals', icon: 'withdrawals' },
  { to: '/admin/gateways', label: 'Payment Gateways', icon: 'withdrawals' },
];

// Legacy has 4 sub-items here (Postback Logs / User Postbacks / Postback
// Fire / Postback Link). Logs & approvals live together as tabs inside
// /admin/postbacks (Phase 7); Postback Fire + Postback Link (the token/URL
// display) now live together as tabs inside /admin/postback-tools — see
// PostbackTools.jsx.
const postbackGroup = {
  key: 'postbacks',
  label: 'Postbacks',
  icon: 'postbacks',
  items: [
    { to: '/admin/postbacks', label: 'Postback Logs & Approvals' },
    { to: '/admin/postback-tools', label: 'Postback URL & Fire' },
  ],
};

const settingsGroup = {
  key: 'settings',
  label: 'Settings',
  icon: 'settings',
  items: [
    { to: '/admin/settings', label: 'General Settings' },
    { to: '/admin/ip-whitelist', label: 'IP Whitelist' },
  ],
};

const ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  offers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  ),
  publishers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
    </svg>
  ),
  withdrawals: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M2 10h20" />
    </svg>
  ),
  postbacks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="2" y="3" width="20" height="6" rx="1" /><rect x="2" y="15" width="20" height="6" rx="1" />
      <line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852 1 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 shrink-0 transition-transform">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

function navLinkClass({ isActive }) {
  return `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
  }`;
}

function NavGroup({ group, openKey, setOpenKey }) {
  const isOpen = openKey === group.key;
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpenKey(isOpen ? null : group.key)}
        className="flex w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        <span className="flex items-center gap-2.5">
          {ICONS[group.icon]}
          {group.label}
        </span>
        <span className={isOpen ? 'rotate-180' : ''}>{ICONS.chevron}</span>
      </button>
      {isOpen && (
        <div className="mt-1 space-y-1 pl-6">
          {group.items.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const [openKey, setOpenKey] = useState('offers');
  const location = useLocation();

  return (
    <div className="admin-theme flex min-h-screen bg-[#f5f7fb]">
      <aside className="w-64 shrink-0 bg-admin-dark text-white">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="text-lg font-bold text-white">GiftReward</div>
          <p className="mt-0.5 text-xs text-white/60">Admin Panel</p>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {singleItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {ICONS[item.icon]}
              {item.label}
            </NavLink>
          ))}

          {groups.map((group) => (
            <NavGroup key={group.key} group={group} openKey={openKey} setOpenKey={setOpenKey} />
          ))}

          <NavGroup group={publishersGroup} openKey={openKey} setOpenKey={setOpenKey} />

          <NavGroup group={reportGroup} openKey={openKey} setOpenKey={setOpenKey} />

          {afterReports.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {ICONS[item.icon]}
              {item.label}
            </NavLink>
          ))}

          <NavGroup group={postbackGroup} openKey={openKey} setOpenKey={setOpenKey} />
          <NavGroup group={settingsGroup} openKey={openKey} setOpenKey={setOpenKey} />
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <span className="text-sm text-admin-gray">Super Admin</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-800">{user?.email}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="admin-theme p-6">
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
