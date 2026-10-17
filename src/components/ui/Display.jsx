import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Copy, Inbox } from 'lucide-react';
import { cn, initials } from '../../utils/format';

export function PageHeader({ title, subtitle, eyebrow, actions, className }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-bold tracking-wider text-brand-600 uppercase">{eyebrow}</p>}
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[26px]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const STAT_TONES = {
  brand: 'from-brand-500 to-accent-600 shadow-[0_8px_20px_-8px_rgba(79,70,229,0.7)]',
  success: 'from-emerald-400 to-teal-600 shadow-[0_8px_20px_-8px_rgba(16,185,129,0.7)]',
  warning: 'from-amber-400 to-orange-500 shadow-[0_8px_20px_-8px_rgba(245,158,11,0.7)]',
  danger: 'from-rose-400 to-pink-600 shadow-[0_8px_20px_-8px_rgba(244,63,94,0.7)]',
  info: 'from-sky-400 to-blue-600 shadow-[0_8px_20px_-8px_rgba(14,165,233,0.7)]',
  slate: 'from-slate-500 to-slate-700 shadow-[0_8px_20px_-8px_rgba(51,65,85,0.6)]',
};

export function StatCard({ label, value, sub, icon: Icon, tone = 'brand', footer, loading, className }) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-white p-5 shadow-card ring-1 ring-line transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover',
        className
      )}
    >
      <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br from-brand-100/60 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-ink-500">{label}</p>
          {loading ? (
            <div className="skeleton mt-2 h-7 w-24 rounded-lg" />
          ) : (
            <p className="mt-1.5 truncate text-2xl font-extrabold tracking-tight text-ink-900 tabular-nums">{value}</p>
          )}
          {sub && <p className="mt-1 truncate text-xs text-ink-500">{sub}</p>}
        </div>
        {Icon && (
          <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white', STAT_TONES[tone])}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      {footer && <div className="relative mt-4 border-t border-line pt-3 text-xs">{footer}</div>}
    </div>
  );
}

// Pill-style filter / tab switcher.
export function Segmented({ options, value, onChange, className, size = 'md' }) {
  return (
    <div className={cn('scroll-thin inline-flex max-w-full overflow-x-auto rounded-xl bg-slate-100 p-1 ring-1 ring-line/60', className)}>
      {options.map((opt) => {
        const o = typeof opt === 'string' ? { value: opt, label: opt } : opt;
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg font-semibold whitespace-nowrap transition',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
              active ? 'bg-white text-ink-900 shadow-card ring-1 ring-line' : 'text-ink-500 hover:text-ink-900'
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span className={cn('rounded-full px-1.5 text-[10px] tabular-nums', active ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-ink-500')}>
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Pagination({ page, totalPages, onChange, total, className }) {
  if (!totalPages || totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  for (let p = start; p <= Math.min(totalPages, start + 4); p += 1) pages.push(p);
  const btn = 'inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition';
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3', className)}>
      <p className="text-xs text-ink-500">
        Page <span className="font-semibold text-ink-900">{page}</span> of {totalPages}
        {total !== undefined && <> · {total} records</>}
      </p>
      <div className="flex items-center gap-1">
        <button className={cn(btn, 'text-ink-500 hover:bg-slate-100 disabled:opacity-40')} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(btn, p === page ? 'bg-brand-600 text-white shadow-glow' : 'text-ink-700 hover:bg-slate-100')}
          >
            {p}
          </button>
        ))}
        <button className={cn(btn, 'text-ink-500 hover:bg-slate-100 disabled:opacity-40')} disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function useCopy(timeout = 1600) {
  const [copied, setCopied] = useState(false);
  function copy(text) {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), timeout);
  }
  return [copied, copy];
}

export function CopyButton({ text, className, label }) {
  const [copied, copy] = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition',
        copied ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-ink-700 ring-1 ring-line hover:bg-slate-50',
        className
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : label || 'Copy'}
    </button>
  );
}

// Read-only value with a copy button — tracking links, API keys, postback URLs.
export function CopyField({ value, className, mono = true }) {
  return (
    <div className={cn('flex w-full min-w-0 items-center gap-2 rounded-xl bg-slate-50 p-1.5 pl-3.5 ring-1 ring-line', className)}>
      <code className={cn('scroll-thin min-w-0 flex-1 overflow-x-auto py-1 text-xs whitespace-nowrap text-ink-700', mono && 'font-mono')}>{value}</code>
      <CopyButton text={value} />
    </div>
  );
}

function hue(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = str.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % 360;
}

export function Avatar({ name, size = 'md', className }) {
  const s = size === 'sm' ? 'h-8 w-8 text-[11px]' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-9 w-9 text-xs';
  const h = hue(name);
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-2 ring-white', s, className)}
      style={{ background: `linear-gradient(135deg, hsl(${h} 70% 58%), hsl(${(h + 40) % 360} 65% 45%))` }}
    >
      {initials(name)}
    </span>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-14 text-center', className)}>
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-violet-50 text-brand-500 ring-1 ring-brand-100">
        <Icon className="h-6 w-6" />
      </span>
      <p className="text-sm font-bold text-ink-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('skeleton rounded-xl', className)} />;
}

export function PageSkeleton() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

// Key/value row used in detail panels (invoice, offer detail sidebar).
export function DetailRow({ label, children, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 py-2.5', className)}>
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="text-right text-sm font-semibold break-all text-ink-900">{children}</dd>
    </div>
  );
}
