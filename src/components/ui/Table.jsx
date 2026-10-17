import { Inbox } from 'lucide-react';
import { cn } from '../../utils/format';

export function Table({ className, children, minWidth }) {
  return (
    <div className={cn('scroll-thin overflow-x-auto', className)}>
      <table className="w-full border-separate border-spacing-0 text-sm" style={minWidth ? { minWidth } : undefined}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children }) {
  return <thead>{children}</thead>;
}

export function Th({ className, align = 'left', children, ...props }) {
  return (
    <th
      className={cn(
        'sticky top-0 z-[1] border-b border-line bg-slate-50/80 px-4 py-3 text-[11px] font-bold tracking-wider whitespace-nowrap text-ink-500 uppercase backdrop-blur',
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Tr({ className, children, selected, ...props }) {
  return (
    <tr className={cn('group transition-colors hover:bg-brand-50/40', selected && 'bg-brand-50/60', className)} {...props}>
      {children}
    </tr>
  );
}

export function Td({ className, align = 'left', children, ...props }) {
  return (
    <td
      className={cn(
        'border-b border-line/70 px-4 py-3.5 align-middle text-ink-700 group-last:border-b-0',
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableEmpty({ colSpan, title = 'Nothing here yet', description, icon: Icon = Inbox }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14">
        <div className="flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-ink-400">
            <Icon className="h-6 w-6" />
          </span>
          <p className="text-sm font-semibold text-ink-900">{title}</p>
          {description && <p className="mt-1 max-w-sm text-xs text-ink-500">{description}</p>}
        </div>
      </td>
    </tr>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return Array.from({ length: rows }, (_, r) => (
    <tr key={r}>
      {Array.from({ length: cols }, (_, c) => (
        <td key={c} className="border-b border-line/70 px-4 py-4">
          <div className="skeleton h-3.5 rounded-full" style={{ width: `${55 + ((r * 7 + c * 13) % 40)}%` }} />
        </td>
      ))}
    </tr>
  ));
}
