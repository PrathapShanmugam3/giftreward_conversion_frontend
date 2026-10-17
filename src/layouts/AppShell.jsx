import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, LogOut, Menu, X } from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary';
import { Avatar } from '../components/ui';
import { BRAND } from '../config/brand';
import { cn } from '../utils/format';

// Shared chrome for the publisher panel and the admin console: dark
// gradient sidebar (sections -> items -> optional collapsible children),
// off-canvas drawer on mobile, frosted sticky top bar with the current
// page title and a user menu.

function isActivePath(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function findCurrent(sections, pathname) {
  for (const section of sections) {
    for (const item of section.items) {
      if (item.children) {
        const child = item.children.find((c) => isActivePath(pathname, c.to));
        if (child) return { section: item.label, label: child.label };
      } else if (isActivePath(pathname, item.to)) {
        return { section: section.label, label: item.label };
      }
    }
  }
  return null;
}

export function BrandMark({ className, light = true }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-600 to-accent-600 shadow-glow">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12v9H4v-9" />
          <path d="M2 7h20v5H2z" />
          <path d="M12 21V7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      </span>
      <span className={cn('text-[17px] font-extrabold tracking-tight', light ? 'text-white' : 'text-ink-900')}>{BRAND.name}</span>
    </span>
  );
}

function NavItem({ item, pathname, onNavigate }) {
  const childActive = item.children?.some((c) => isActivePath(pathname, c.to));
  const [open, setOpen] = useState(childActive);

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  const Icon = item.icon;
  const base = 'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150';

  if (!item.children) {
    return (
      <NavLink
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            base,
            isActive
              ? 'bg-gradient-to-r from-white/[0.14] to-white/[0.04] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
              : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && <span className="absolute top-1/2 -left-3 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-brand-300 to-accent-500" />}
            <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300')} />
            <span className="truncate">{item.label}</span>
            {item.badge}
          </>
        )}
      </NavLink>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(base, childActive ? 'text-white' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white')}
      >
        <Icon className={cn('h-[18px] w-[18px] shrink-0', childActive ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300')} />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <div className={cn('grid transition-all duration-200', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
        <div className="overflow-hidden">
          <div className="mt-1 mb-1 ml-[21px] space-y-0.5 border-l border-white/10 pl-3">
            {item.children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'block rounded-lg px-3 py-2 text-[13px] transition',
                    isActive ? 'bg-white/[0.08] font-semibold text-white' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                  )
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ sections, subtitle, footer, pathname, onNavigate }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-sidebar">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-24 h-64 w-64 rounded-full bg-accent-600/15 blur-3xl" />

      <div className="relative flex h-[68px] shrink-0 items-center justify-between border-b border-white/[0.06] px-5">
        <Link to="/" onClick={onNavigate}>
          <BrandMark />
        </Link>
        <span className="rounded-md bg-white/[0.07] px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-300 uppercase ring-1 ring-white/10">
          {subtitle}
        </span>
      </div>

      <nav className="scroll-thin relative flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[10.5px] font-bold tracking-[0.12em] text-slate-500 uppercase">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem key={item.label} item={item} pathname={pathname} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {footer && <div className="relative shrink-0 border-t border-white/[0.06] p-3 [@media(max-height:940px)]:hidden">{footer}</div>}
    </div>
  );
}

function UserMenu({ user, links, onLogout, roleLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const name = user?.name || user?.username || user?.email || 'Account';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-2xl py-1 pr-2 pl-1 transition hover:bg-slate-100"
      >
        <Avatar name={name} size="sm" />
        <span className="hidden text-left sm:block">
          <span className="block max-w-[160px] truncate text-[13px] leading-tight font-bold text-ink-900">{name}</span>
          <span className="block text-[11px] leading-tight text-ink-500">{roleLabel}</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-ink-400 sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right animate-scale-in overflow-hidden rounded-2xl bg-white shadow-pop ring-1 ring-line">
          <div className="flex items-center gap-3 border-b border-line bg-slate-50/70 px-4 py-3.5">
            <Avatar name={name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink-900">{name}</p>
              <p className="truncate text-xs text-ink-500">{user?.email}</p>
            </div>
          </div>
          <div className="p-1.5">
            {links?.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-700 transition hover:bg-slate-50 hover:text-ink-900"
              >
                <l.icon className="h-4 w-4 text-ink-400" />
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppShell({ sections, subtitle, roleLabel, user, onLogout, userLinks, headerExtra, sidebarFooter }) {
  const { pathname } = useLocation();
  const [drawer, setDrawer] = useState(false);
  const current = useMemo(() => findCurrent(sections, pathname), [sections, pathname]);

  useEffect(() => {
    setDrawer(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const sidebarProps = { sections, subtitle, footer: sidebarFooter, pathname };

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] lg:block">
        <Sidebar {...sidebarProps} />
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink-900/50 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] animate-slide-up shadow-pop">
            <Sidebar {...sidebarProps} onNavigate={() => setDrawer(false)} />
            <button
              type="button"
              onClick={() => setDrawer(false)}
              className="absolute top-4 -right-12 rounded-xl bg-white/10 p-2 text-white backdrop-blur"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </aside>
        </div>
      )}

      <div className="lg:pl-[268px]">
        <header className="no-print sticky top-0 z-30 border-b border-line/80 bg-white/75 backdrop-blur-xl">
          <div className="flex h-[68px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="-ml-1 rounded-xl p-2 text-ink-700 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              {current && (
                <div className="flex items-center gap-1.5 text-xs text-ink-500">
                  <span className="hidden sm:inline">{current.section}</span>
                  <ChevronRight className="hidden h-3 w-3 sm:inline" />
                  <span className="truncate font-semibold text-ink-900">{current.label}</span>
                </div>
              )}
            </div>
            {headerExtra}
            <UserMenu user={user} links={userLinks} onLogout={onLogout} roleLabel={roleLabel} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <ErrorBoundary key={pathname}>
            <div className="animate-slide-up">
              <Outlet />
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
