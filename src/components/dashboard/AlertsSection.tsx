import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import {
    AlertTriangle,
    AlertCircle,
    Info,
    Milk,
    Egg,
    Receipt,
    Wallet,
    ArrowRight,
    CheckCircle2,
} from 'lucide-react';
import { getAlerts } from '@/api/dashboard';
import type { DashboardAlert, AlertSeverity, AlertType } from '@/types';

// ============================================================
// Severity + type styling maps
// ============================================================

const SEVERITY_STYLES: Record<
    AlertSeverity,
    { bg: string; border: string; text: string; icon: ReactNode }
> = {
    DANGER: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        icon: <AlertTriangle size={16} className="text-red-600 shrink-0" />,
    },
    WARNING: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-900',
        icon: <AlertCircle size={16} className="text-amber-600 shrink-0" />,
    },
    INFO: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        icon: <Info size={16} className="text-blue-600 shrink-0" />,
    },
};

const TYPE_ICONS: Record<AlertType, ReactNode> = {
    LOW_MILK_PRODUCTION: <Milk size={14} />,
    LOW_EGG_PRODUCTION: <Egg size={14} />,
    OVERDUE_PAYMENT: <Receipt size={14} />,
    SALARY_DUE: <Wallet size={14} />,
};

// ============================================================
// Component
// ============================================================

export function AlertsSection() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['dashboard-alerts'],
        queryFn: getAlerts,
        refetchInterval: 120_000, // refresh every 2 min
    });

    // Silent on error — dashboard shouldn't break if alerts fail
    if (isError) return null;

    // Silent while loading
    if (isLoading) return null;

    const alerts = data?.data?.alerts ?? [];

    // All clear state
    if (alerts.length === 0) {
        return (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle2 size={20} className="text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-green-900 text-sm">
                        All clear
                    </div>
                    <div className="text-xs text-green-700 mt-0.5">
                        No alerts right now. Everything looks good.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    Alerts
                </h2>
                <span className="text-xs text-gray-400">
                    {alerts.length} {alerts.length === 1 ? 'item' : 'items'}
                </span>
            </div>

            {/* Alert cards */}
            <div className="space-y-2">
                {alerts.map((alert, idx) => (
                    <AlertCard key={`${alert.type}-${idx}`} alert={alert} />
                ))}
            </div>
        </div>
    );
}

// ============================================================
// Single alert row
// ============================================================

function AlertCard({ alert }: { alert: DashboardAlert }) {
    const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.INFO;

    return (
        <Link
            to={alert.link}
            className={`block ${style.bg} ${style.border} border rounded-xl p-3 hover:shadow-sm transition group`}
        >
            <div className="flex items-start gap-3">
                {/* Severity icon */}
                <div className="mt-0.5">{style.icon}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-semibold ${style.text} truncate`}>
                            {alert.title}
                        </span>
                        {TYPE_ICONS[alert.type] && (
                            <span className={`${style.text} opacity-60 shrink-0`}>
                                {TYPE_ICONS[alert.type]}
                            </span>
                        )}
                    </div>
                    <div className={`text-xs ${style.text} opacity-80`}>
                        {alert.message}
                    </div>
                </div>

                {/* Arrow */}
                <ArrowRight
                    size={16}
                    className={`${style.text} opacity-40 group-hover:opacity-100 shrink-0 mt-1 transition`}
                />
            </div>
        </Link>
    );
}