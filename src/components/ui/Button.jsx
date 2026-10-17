import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/format';

const VARIANTS = {
  primary:
    'bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_6px_16px_-6px_rgba(79,70,229,0.6)] hover:from-brand-600 hover:to-brand-700',
  secondary: 'bg-white text-ink-700 ring-1 ring-line shadow-card hover:bg-slate-50 hover:text-ink-900',
  ghost: 'text-ink-500 hover:bg-slate-100 hover:text-ink-900',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  danger: 'bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_6px_16px_-6px_rgba(225,29,72,0.55)] hover:from-rose-600 hover:to-rose-700',
  'danger-soft': 'bg-rose-50 text-rose-700 hover:bg-rose-100',
  success: 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.55)] hover:from-emerald-600 hover:to-emerald-700',
  'success-soft': 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  dark: 'bg-ink-900 text-white hover:bg-ink-700',
  white: 'bg-white text-ink-900 shadow-card hover:bg-brand-50',
  // For dark backgrounds (hero panels, auth/landing sections).
  'outline-light': 'text-white ring-1 ring-white/25 hover:bg-white/10',
  telegram: 'bg-gradient-to-b from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700',
};

const SIZES = {
  xs: 'h-7 gap-1 rounded-lg px-2.5 text-xs',
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-xs',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-6 text-sm',
  icon: 'h-9 w-9 rounded-xl',
  'icon-sm': 'h-8 w-8 rounded-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  to,
  href,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}) {
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-all duration-150 select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
    'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55',
    VARIANTS[variant],
    SIZES[size],
    className
  );
  const iconSize = size === 'xs' || size === 'sm' || size === 'icon-sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const content = (
    <>
      {loading ? <Loader2 className={cn(iconSize, 'animate-spin')} /> : Icon && <Icon className={iconSize} />}
      {children}
      {IconRight && !loading && <IconRight className={iconSize} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
