import { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => string;
  hideToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: 'bg-system-green/10 text-system-green border-system-green/20 dark:bg-system-green/20',
  error: 'bg-system-red/10 text-system-red border-system-red/20 dark:bg-system-red/20',
  warning: 'bg-system-amber/10 text-system-amber border-system-amber/20 dark:bg-system-amber/20',
  info: 'bg-system-blue/10 text-system-blue border-system-blue/20 dark:bg-system-blue/20',
};

function ToastItem({ toast, onClose, style }: { toast: Toast; onClose: (id: string) => void; style?: React.CSSProperties }) {
  const Icon = ICONS[toast.type];
  const colorClass = COLORS[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.95 }}
      className={`flex items-start gap-3 p-4 rounded-xl border ${colorClass} shadow-lg`}
      role="alert"
      aria-live="polite"
      style={style}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{toast.title}</p>
        {toast.message && (
          <p className="text-sm opacity-90 mt-0.5">{toast.message}</p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onClose(toast.id);
            }}
            className="mt-2 text-sm font-medium underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 opacity-60 hover:opacity-100" />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, toast.duration ?? 5000);
    }

    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Listen for custom toast events from main.tsx
  useEffect(() => {
    const handleCustomToast = (event: CustomEvent) => {
      showToast(event.detail);
    };

    window.addEventListener('show-toast', handleCustomToast as EventListener);
    return () => window.removeEventListener('show-toast', handleCustomToast as EventListener);
  }, [showToast]);

  const value = useMemo(() => ({ toasts, showToast, hideToast, clearToasts }), [
    toasts,
    showToast,
    hideToast,
    clearToasts,
  ]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <AnimatePresence>
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-1rem)] pointer-events-none">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onClose={hideToast} style={{ pointerEvents: 'auto' }} />
          ))}
        </div>
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Convenience functions
export function useToastHelpers() {
  const { showToast } = useToast();

  return useMemo(() => ({
    success: (title: string, message?: string, options?: Partial<Toast>) =>
      showToast({ type: 'success', title, message, ...options }),
    error: (title: string, message?: string, options?: Partial<Toast>) =>
      showToast({ type: 'error', title, message, duration: 0, ...options }),
    warning: (title: string, message?: string, options?: Partial<Toast>) =>
      showToast({ type: 'warning', title, message, ...options }),
    info: (title: string, message?: string, options?: Partial<Toast>) =>
      showToast({ type: 'info', title, message, ...options }),
  }), [showToast]);
}