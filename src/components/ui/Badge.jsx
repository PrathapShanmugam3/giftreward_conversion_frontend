import { cn } from '../../utils/format';

const TONES = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
};

const DOTS = {
  neutral: 'bg-slate-400',
  brand: 'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  violet: 'bg-violet-500',
};

export function Badge({ tone = 'neutral', dot = false, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap capitalize ring-1 ring-inset',
        TONES[tone],
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', DOTS[tone])} />}
      {children}
    </span>
  );
}

// One place that decides what colour each status word gets, so "pending"
// looks the same on conversions, withdrawals, postbacks and offer requests.
const STATUS_TONES = {
  approved: 'success',
  active: 'success',
  converted: 'success',
  allowed: 'success',
  enabled: 'success',
  pending: 'warning',
  requested: 'warning',
  testing: 'warning',
  paused: 'neutral',
  inactive: 'neutral',
  disabled: 'neutral',
  'not converted': 'neutral',
  rejected: 'danger',
  blocked: 'danger',
  deleted: 'danger',
  locked: 'danger',
};

export function StatusBadge({ status, label, className }) {
  const key = String(status ?? '').toLowerCase();
  return (
    <Badge tone={STATUS_TONES[key] || 'neutral'} dot className={className}>
      {label || status || '—'}
    </Badge>
  );
}
