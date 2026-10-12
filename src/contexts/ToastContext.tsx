import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    kind: ToastKind;
    message: string;
    /** Optional: smaller second line */
    details?: string;
    /** Optional: auto-dismiss duration in ms */
    duration?: number;
}

interface ToastContextValue {
    success: (message: string, details?: string) => void;
    error: (message: string, details?: string) => void;
    info: (message: string, details?: string) => void;
    /** Rich version with custom duration */
    show: (kind: ToastKind, message: string, details?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 3500;
const ERROR_DURATION_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const remove = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const show = useCallback(
        (kind: ToastKind, message: string, details?: string, duration?: number) => {
            const id = Date.now() + Math.random();
            const autoDismissMs =
                duration ?? (kind === 'error' ? ERROR_DURATION_MS : DEFAULT_DURATION_MS);

            setToasts((prev) => [...prev, { id, kind, message, details, duration: autoDismissMs }]);
            setTimeout(() => remove(id), autoDismissMs);
        },
        [remove]
    );

    const value: ToastContextValue = {
        success: (msg, details) => show('success', msg, details),
        error: (msg, details) => show('error', msg, details),
        info: (msg, details) => show('info', msg, details),
        show,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}

            {/*
              Toast viewport — FIXED BOTTOM CENTER
              - Mobile: full-width minus padding, above bottom nav
              - Desktop: narrow column, bottom-right
              - Stacked newest at bottom (new toasts push up)

              The `md:bottom-4` avoids overlapping the mobile bottom nav.
              On mobile we set `bottom-20` (5rem) to sit above the nav bar.
            */}
            <div className="fixed bottom-24 md:bottom-4 left-1/2 md:left-auto md:right-4 -translate-x-1/2 md:translate-x-0 z-[9999] flex flex-col-reverse gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={() => remove(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// ============================================================
// Individual toast
// ============================================================

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const styles = {
        success: {
            bg: 'bg-white',
            border: 'border-l-4 border-l-green-500 border-gray-100',
            iconWrap: 'bg-green-100 text-green-600',
            icon: <CheckCircle2 size={18} />,
            title: 'text-gray-900',
            details: 'text-gray-500',
        },
        error: {
            bg: 'bg-white',
            border: 'border-l-4 border-l-red-500 border-gray-100',
            iconWrap: 'bg-red-100 text-red-600',
            icon: <AlertCircle size={18} />,
            title: 'text-gray-900',
            details: 'text-gray-500',
        },
        info: {
            bg: 'bg-white',
            border: 'border-l-4 border-l-blue-500 border-gray-100',
            iconWrap: 'bg-blue-100 text-blue-600',
            icon: <Info size={18} />,
            title: 'text-gray-900',
            details: 'text-gray-500',
        },
    }[toast.kind];

    return (
        <div
            className={`pointer-events-auto ${styles.bg} border ${styles.border} rounded-xl shadow-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300`}
            role={toast.kind === 'error' ? 'alert' : 'status'}
        >
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${styles.iconWrap}`}
            >
                {styles.icon}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
                <div className={`text-sm font-semibold ${styles.title} leading-snug`}>
                    {toast.message}
                </div>
                {toast.details && (
                    <div className={`text-xs ${styles.details} mt-1 leading-snug whitespace-pre-line`}>
                        {toast.details}
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={onDismiss}
                className="text-gray-400 hover:text-gray-600 transition shrink-0 p-0.5"
                aria-label="Dismiss"
            >
                <X size={16} />
            </button>
        </div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}