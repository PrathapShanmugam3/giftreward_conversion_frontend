import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/format';

const CONTROL =
  'block w-full rounded-xl border-0 bg-white text-sm text-ink-900 ring-1 ring-line shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition placeholder:text-ink-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-ink-500';

export function Field({ label, hint, error, required, className, children, htmlFor }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-ink-700">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>
      )}
    </div>
  );
}

export const Input = forwardRef(function Input({ icon: Icon, className, inputClassName, ...props }, ref) {
  if (!Icon) return <input ref={ref} className={cn(CONTROL, 'h-10 px-3.5', className)} {...props} />;
  return (
    <div className={cn('relative', className)}>
      <Icon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input ref={ref} className={cn(CONTROL, 'h-10 pr-3.5 pl-10', inputClassName)} {...props} />
    </div>
  );
});

export function Select({ className, children, ...props }) {
  return (
    <div className={cn('relative', className)}>
      <select className={cn(CONTROL, 'h-10 appearance-none pr-9 pl-3.5')} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-ink-400" />
    </div>
  );
}

export function Textarea({ className, rows = 4, ...props }) {
  return <textarea rows={rows} className={cn(CONTROL, 'px-3.5 py-2.5', className)} {...props} />;
}

// Accessible on/off switch used for boolean settings.
export function Toggle({ checked, onChange, label, description, disabled, className }) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn('flex cursor-pointer items-start justify-between gap-4', disabled && 'opacity-60', className)}>
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-sm font-semibold text-ink-900">{label}</span>}
          {description && <span className="mt-0.5 block text-xs text-ink-500">{description}</span>}
        </span>
      )}
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          className="peer sr-only"
          checked={!!checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <span className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2" />
        <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export function Checkbox({ className, ...props }) {
  return (
    <input
      type="checkbox"
      className={cn(
        'h-4 w-4 cursor-pointer rounded border-slate-300 text-brand-600 accent-brand-600 focus:ring-2 focus:ring-brand-500',
        className
      )}
      {...props}
    />
  );
}
