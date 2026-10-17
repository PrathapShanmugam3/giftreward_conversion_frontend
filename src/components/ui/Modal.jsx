import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/format';

const SIZES = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

// Portal-mounted dialog with blurred backdrop, Esc-to-close and a sticky
// footer. When `onSubmit` is given the body is a <form>, so Enter submits.
export default function Modal({ open = true, onClose, title, description, icon: Icon, size = 'md', footer, onSubmit, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const Body = onSubmit ? 'form' : 'div';

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fade-in bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <Body
        onSubmit={onSubmit}
        className={cn(
          'relative flex max-h-[92vh] w-full animate-scale-in flex-col overflow-hidden rounded-t-3xl bg-white shadow-pop ring-1 ring-line sm:rounded-3xl',
          SIZES[size]
        )}
      >
        <div className="flex items-start gap-3 border-b border-line px-6 py-5">
          {Icon && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 text-white shadow-glow">
              <Icon className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-ink-900">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mt-1 -mr-2 rounded-xl p-2 text-ink-400 transition hover:bg-slate-100 hover:text-ink-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-slate-50/70 px-6 py-4">{footer}</div>}
      </Body>
    </div>,
    document.body
  );
}
