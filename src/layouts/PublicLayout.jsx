import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { BrandMark } from './AppShell';
import { BRAND } from '../config/brand';
import { Button } from '../components/ui';
import { cn } from '../utils/format';

const NAV = [
  { href: '/#models', label: 'Payment models' },
  { href: '/#features', label: 'Features' },
  { href: '/#how', label: 'How it works' },
  { href: '/#offers', label: 'Offers' },
  { href: '/tracking', label: 'Track cashback', route: true },
];

export function PublicNav({ dark = false }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = scrolled || !dark;

  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 transition-all duration-300', solid ? 'border-b border-line/70 bg-white/80 backdrop-blur-xl' : 'bg-transparent')}>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/">
          <BrandMark light={!solid} />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) =>
            n.route ? (
              <NavLink key={n.href} to={n.href} className={cn('rounded-lg px-3 py-2 text-sm font-semibold transition', solid ? 'text-ink-700 hover:text-ink-900' : 'text-slate-300 hover:text-white')}>
                {n.label}
              </NavLink>
            ) : (
              <a key={n.href} href={n.href} className={cn('rounded-lg px-3 py-2 text-sm font-semibold transition', solid ? 'text-ink-700 hover:text-ink-900' : 'text-slate-300 hover:text-white')}>
                {n.label}
              </a>
            )
          )}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Button to="/publisher/login" variant={solid ? 'ghost' : 'outline-light'}>
            Sign in
          </Button>
          <Button to="/publisher/register">Join free</Button>
        </div>
        <button type="button" onClick={() => setOpen((o) => !o)} className={cn('rounded-xl p-2 lg:hidden', solid ? 'text-ink-900' : 'text-white')} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="animate-slide-up border-t border-line bg-white px-4 pt-2 pb-5 shadow-pop lg:hidden">
          {NAV.map((n) =>
            n.route ? (
              <Link key={n.href} to={n.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-sm font-semibold text-ink-700 hover:bg-slate-50">
                {n.label}
              </Link>
            ) : (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-sm font-semibold text-ink-700 hover:bg-slate-50">
                {n.label}
              </a>
            )
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button to="/publisher/login" variant="secondary">
              Sign in
            </Button>
            <Button to="/publisher/register">Join free</Button>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden bg-sidebar text-slate-400">
      <div className="absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">India's affiliate network. Monetise your traffic with high-converting offers and get paid in INR.</p>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Platform</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><a href="/#models" className="hover:text-white">Payment models</a></li>
            <li><a href="/#features" className="hover:text-white">Features</a></li>
            <li><a href="/#how" className="hover:text-white">How it works</a></li>
            <li><Link to="/tracking" className="hover:text-white">Track your cashback</Link></li>
            <li><Link to="/publisher/register" className="hover:text-white">Become a publisher</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Legal</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link to="/terms-conditions" className="hover:text-white">Terms & Conditions</Link></li>
            <li><Link to="/cookie-policy" className="hover:text-white">Cookie Policy</Link></li>
            <li><Link to="/affiliate-agreement" className="hover:text-white">Affiliate Agreement</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Contact</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" /><a href={`mailto:${BRAND.email}`} className="hover:text-white">{BRAND.email}</a></li>
            <li className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />{BRAND.phone}</li>
            <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />{BRAND.address}</li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <Link to="/admin/login" className="hover:text-white">Admin console</Link>
        </div>
      </div>
    </footer>
  );
}
