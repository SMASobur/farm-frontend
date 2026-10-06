import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    kind: ToastKind;
    message: string;
}

interface ToastContextValue {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 3500;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const remove = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const add = useCallback((kind: ToastKind, message: string) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, kind, message }]);
        setTimeout(() => remove(id), AUTO_DISMISS_MS);
    }, [remove]);

    const value: ToastContextValue = {
        success: (msg) => add('success', msg),
        error: (msg) => add('error', msg),
        info: (msg) => add('info', msg),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}

            {/* Toast viewport — fixed top-center on mobile, top-right on desktop */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={() => remove(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const styles = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            icon: <CheckCircle2 size={18} className="text-green-600 shrink-0" />,
            text: 'text-green-900',
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: <AlertCircle size={18} className="text-red-600 shrink-0" />,
            text: 'text-red-900',
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: <AlertCircle size={18} className="text-blue-600 shrink-0" />,
            text: 'text-blue-900',
        },
    }[toast.kind];

    return (
        <div
            className={`pointer-events-auto ${styles.bg} ${styles.border} border rounded-xl shadow-lg p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200`}
        >
            {styles.icon}
            <div className={`flex-1 text-sm font-medium ${styles.text}`}>{toast.message}</div>
            <button
                type="button"
                onClick={onDismiss}
                className={`${styles.text} opacity-60 hover:opacity-100 transition`}
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