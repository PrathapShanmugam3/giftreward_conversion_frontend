import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { cn } from '../../utils/format';

// App-wide toasts + confirm dialog. Replaces the scattered inline
// success/error paragraphs and window.confirm() calls of the first port.

const ToastCtx = createContext(null);
const ConfirmCtx = createContext(null);

const TOAST_STYLES = {
  success: { icon: CheckCircle2, ring: 'ring-emerald-200', iconCls: 'text-emerald-500' },
  error: { icon: XCircle, ring: 'ring-rose-200', iconCls: 'text-rose-500' },
  info: { icon: Info, ring: 'ring-brand-200', iconCls: 'text-brand-500' },
  warning: { icon: AlertTriangle, ring: 'ring-amber-200', iconCls: 'text-amber-500' },
};

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const resolver = useRef(null);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (type, message, title) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t.slice(-3), { id, type, message, title }]);
      setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3500);
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (m, t) => push('success', m, t),
      error: (m, t) => push('error', m, t),
      info: (m, t) => push('info', m, t),
      warning: (m, t) => push('warning', m, t),
    }),
    [push]
  );

  const confirm = useCallback((options) => {
    setConfirmState(typeof options === 'string' ? { message: options } : options);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  function settle(value) {
    resolver.current?.(value);
    resolver.current = null;
    setConfirmState(null);
  }

  return (
    <ToastCtx.Provider value={toast}>
      <ConfirmCtx.Provider value={confirm}>
        {children}

        <div className="pointer-events-none fixed top-4 right-4 left-4 z-[80] flex flex-col items-end gap-2 sm:left-auto">
          {toasts.map((t) => {
            const s = TOAST_STYLES[t.type];
            const Icon = s.icon;
            return (
              <div
                key={t.id}
                className={cn(
                  'pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-pop ring-1 backdrop-blur',
                  s.ring
                )}
              >
                <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', s.iconCls)} />
                <div className="min-w-0 flex-1">
                  {t.title && <p className="text-sm font-semibold text-ink-900">{t.title}</p>}
                  <p className="text-sm text-ink-700">{t.message}</p>
                </div>
                <button onClick={() => dismiss(t.id)} className="text-ink-400 hover:text-ink-900" aria-label="Dismiss">
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        {confirmState && (
          <Modal
            title={confirmState.title || 'Are you sure?'}
            icon={AlertTriangle}
            size="sm"
            onClose={() => settle(false)}
            footer={
              <>
                <Button variant="secondary" onClick={() => settle(false)}>
                  Cancel
                </Button>
                <Button variant={confirmState.tone === 'primary' ? 'primary' : 'danger'} onClick={() => settle(true)} autoFocus>
                  {confirmState.confirmLabel || 'Confirm'}
                </Button>
              </>
            }
          >
            <p className="text-sm leading-relaxed text-ink-700">{confirmState.message}</p>
          </Modal>
        )}
      </ConfirmCtx.Provider>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}

export function useConfirm() {
  return useContext(ConfirmCtx);
}

const ALERT_TONES = {
  info: { cls: 'bg-brand-50 text-brand-800 ring-brand-200', icon: Info },
  success: { cls: 'bg-emerald-50 text-emerald-800 ring-emerald-200', icon: CheckCircle2 },
  warning: { cls: 'bg-amber-50 text-amber-900 ring-amber-200', icon: AlertTriangle },
  danger: { cls: 'bg-rose-50 text-rose-800 ring-rose-200', icon: XCircle },
};

export function Alert({ tone = 'info', title, children, className }) {
  const { cls, icon: Icon } = ALERT_TONES[tone];
  return (
    <div className={cn('flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ring-1 ring-inset', cls, className)}>
      <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? 'mt-0.5 opacity-90' : ''}>{children}</div>
      </div>
    </div>
  );
}
