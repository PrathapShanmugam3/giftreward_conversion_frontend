import { Link } from 'react-router-dom';
import { BadgeIndianRupee, ShieldCheck, Zap } from 'lucide-react';
import { BrandMark } from './AppShell';
import { cn } from '../utils/format';

const POINTS = [
  { icon: BadgeIndianRupee, title: 'INR payouts', text: 'Withdraw straight to UPI or bank — no conversion fees.' },
  { icon: Zap, title: 'Real-time tracking', text: 'Clicks and conversions land on your dashboard instantly.' },
  { icon: ShieldCheck, title: 'Fraud protection', text: 'Proxy & VPN filtering keeps your traffic quality high.' },
];

// Split-screen auth layout: brand story on the left (desktop), form card on
// the right. `variant="admin"` swaps the copy for the console.
export default function AuthShell({ title, subtitle, children, footer, variant = 'publisher' }) {
  const admin = variant === 'admin';
  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden w-[46%] overflow-hidden bg-sidebar lg:flex lg:flex-col">
        <div className="bg-grid absolute inset-0 opacity-60" />
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-brand-600/40 blur-[110px]" />
        <div className="absolute -right-24 bottom-0 h-[360px] w-[360px] rounded-full bg-accent-600/30 blur-[110px]" />

        <div className="relative flex flex-1 flex-col justify-between p-12">
          <Link to="/">
            <BrandMark />
          </Link>

          <div className="max-w-md">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-100 ring-1 ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {admin ? 'Network control centre' : "India's performance network"}
            </p>
            <h2 className="text-4xl leading-[1.1] font-extrabold tracking-tight text-white">
              {admin ? (
                <>
                  Run the whole network
                  <span className="bg-gradient-to-r from-brand-300 to-violet-300 bg-clip-text text-transparent"> from one console.</span>
                </>
              ) : (
                <>
                  Turn your traffic into
                  <span className="bg-gradient-to-r from-brand-300 to-violet-300 bg-clip-text text-transparent"> real rupees.</span>
                </>
              )}
            </h2>
            <div className="mt-10 space-y-5">
              {(admin
                ? [
                    { icon: Zap, title: 'Live performance', text: 'Clicks, conversions and payouts across every publisher.' },
                    { icon: ShieldCheck, title: 'Moderation', text: 'Approve offers, postbacks and withdrawals in one place.' },
                    { icon: BadgeIndianRupee, title: 'Payouts', text: 'Wallet ledger with refunds handled automatically.' },
                  ]
                : POINTS
              ).map((p) => (
                <div key={p.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-brand-200 ring-1 ring-white/15">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold text-white">{p.title}</p>
                    <p className="mt-0.5 text-sm text-slate-400">{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500">© {new Date().getFullYear()} GiftReward. All rights reserved.</p>
        </div>
      </div>

      <div className="bg-grid-dark relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[420px] animate-slide-up">
          <Link to="/" className="mb-8 inline-block lg:hidden">
            <BrandMark light={false} />
          </Link>
          <div className={cn('rounded-3xl bg-white p-7 shadow-pop ring-1 ring-line sm:p-9')}>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>}
            <div className="mt-7">{children}</div>
          </div>
          {footer && <div className="mt-6 text-center text-sm text-ink-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
