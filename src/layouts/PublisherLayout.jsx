import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { usePublisherAuth } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

// Mirrors public_html/publisher/sidebar.php: Dashboard, Offers, a
// collapsible "Reports" group (Daily/Monthly/Custom + Conversions),
// Payments (Wallet), Create Campaign (Campaigns), Support-less here, and
// Account & Settings group (Profile, Postback, API docs — API/Support not
// yet implemented in React so omitted). Active/hover classes copied
// verbatim from the legacy Tailwind markup: active = bg-gray-100
// text-blue-600, inactive = text-gray-900 hover:bg-gray-100.
const singleItems = [
  { to: '/publisher/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/publisher/offers', label: 'Offers', icon: 'offers' },
];

const reportsGroup = {
  key: 'reports',
  label: 'Reports',
  icon: 'reports',
  items: [
    { to: '/publisher/reports', label: 'Reports' },
    { to: '/publisher/conversions', label: 'Conversions' },
  ],
};

const afterReports = [
  { to: '/publisher/wallet', label: 'Wallet', icon: 'wallet' },
  { to: '/publisher/campaigns', label: 'Campaigns', icon: 'campaigns' },
];

const settingsGroup = {
  key: 'settings',
  label: 'Account & Settings',
  icon: 'settings',
  items: [
    { to: '/publisher/profile', label: 'Profile' },
    { to: '/publisher/postback', label: 'Postback' },
    { to: '/publisher/api-documentation', label: 'API Documentation' },
    { to: '/publisher/support', label: 'Support' },
  ],
};

const ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0">
      <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  offers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0">
      <path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0">
      <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
    </svg>
  ),
  campaigns: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0">
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
  return `flex items-center gap-3 rounded-lg p-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-gray-100 text-blue-600' : 'text-gray-900 hover:bg-gray-100'
  }`;
}

function NavGroup({ group, openKey, setOpenKey }) {
  const isOpen = openKey === group.key;
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpenKey(isOpen ? null : group.key)}
        className="flex w-full items-center justify-between gap-3 rounded-lg p-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
      >
        <span className="flex items-center gap-3">
          {ICONS[group.icon]}
          {group.label}
        </span>
        <span className={isOpen ? 'rotate-180' : ''}>{ICONS.chevron}</span>
      </button>
      {isOpen && (
        <div className="mt-1 space-y-1 pl-8">
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

export default function PublisherLayout() {
  const { user, logout } = usePublisherAuth();
  const [openKey, setOpenKey] = useState(null);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 shrink-0 border-r border-gray-200 bg-white">
        <div className="px-4 py-5 text-lg font-bold text-blue-600">GiftReward</div>
        <nav className="flex flex-col gap-1 px-3 pb-4">
          {singleItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {ICONS[item.icon]}
              {item.label}
            </NavLink>
          ))}

          <NavGroup group={reportsGroup} openKey={openKey} setOpenKey={setOpenKey} />

          {afterReports.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {ICONS[item.icon]}
              {item.label}
            </NavLink>
          ))}

          <NavGroup group={settingsGroup} openKey={openKey} setOpenKey={setOpenKey} />
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <span className="text-sm text-gray-500">Publisher Panel</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-800">{user?.name}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="p-6">
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
