import { cn } from '../../utils/format';

export function Card({ className, children, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-2xl bg-white ring-1 ring-line shadow-card',
        hover && 'transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, actions, className }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4', className)}>
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Icon className="h-4.5 w-4.5" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-ink-900">{title}</h2>
          {subtitle && <p className="mt-0.5 truncate text-xs text-ink-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
