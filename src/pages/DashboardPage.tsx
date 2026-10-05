import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getSummary } from '@/api/dashboard';
import { formatCurrency, formatNumber, formatDateLong } from '@/lib/format';
import {
    Milk,
    Egg,
    TrendingUp,
    TrendingDown,
    Receipt,
    Users,
    AlertCircle,
    RefreshCw,
    Loader2,
    Wifi,
} from 'lucide-react';

// ============================================================
// Hook: track how long we've been waiting (for time-aware text)
// ============================================================
function useElapsedSeconds(active: boolean): number {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        if (!active) {
            setSeconds(0);
            return;
        }
        const start = Date.now();
        const interval = setInterval(() => {
            setSeconds(Math.floor((Date.now() - start) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [active]);

    return seconds;
}

// ============================================================
// Component
// ============================================================
export function DashboardPage() {
    const { user } = useAuth();

    const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: getSummary,
        refetchInterval: 60_000,
    });

    const elapsed = useElapsedSeconds(isLoading);

    // ============ First-time Loading ============
    if (isLoading) {
        return <DashboardSkeleton elapsedSeconds={elapsed} />;
    }

    // ============ Error ============
    if (isError) {
        return <DashboardError error={error} onRetry={() => refetch()} />;
    }

    // ============ Loaded ============
    const summary = data!.data;

    return (
        <div className="p-4 md:p-6 space-y-6 fade-in">
            {/* Background refresh chip */}
            {isFetching && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-blue-800">
                    <Loader2 size={14} className="animate-spin shrink-0" />
                    <span>Refreshing…</span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome, {user?.fullName || user?.username}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {formatDateLong(summary.date)}
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                    title="Refresh"
                >
                    <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Today */}
            <section>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Today
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <StatCard
                        icon={<Milk size={20} />}
                        label="Milk"
                        value={`${formatNumber(summary.today.milkLiters, 1)} L`}
                        color="blue"
                    />
                    <StatCard
                        icon={<Egg size={20} />}
                        label="Eggs"
                        value={`${summary.today.eggs} pcs`}
                        color="amber"
                    />
                    <StatCard
                        icon={<TrendingUp size={20} />}
                        label="Sales"
                        value={formatCurrency(summary.today.salesRevenue)}
                        color="green"
                    />
                    <StatCard
                        icon={<Receipt size={20} />}
                        label="Expenses"
                        value={formatCurrency(summary.today.expenses)}
                        color="red"
                    />
                </div>
            </section>

            {/* This Month */}
            <section>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    This Month
                </h2>
                <div
                    className={`rounded-2xl p-5 ${
                        summary.thisMonth.netProfit >= 0
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                            : 'bg-gradient-to-br from-red-500 to-rose-600'
                    } text-white`}
                >
                    <div className="flex items-center gap-2 mb-1">
                        {summary.thisMonth.netProfit >= 0 ? (
                            <TrendingUp size={18} />
                        ) : (
                            <TrendingDown size={18} />
                        )}
                        <span className="text-sm font-medium opacity-90">
              {summary.thisMonth.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}
            </span>
                    </div>
                    <div className="text-3xl font-bold">
                        {formatCurrency(Math.abs(summary.thisMonth.netProfit))}
                    </div>
                    <div className="text-sm opacity-90 mt-1">
                        {summary.thisMonth.profitMargin.toFixed(2)}% margin
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <div className="opacity-75">Sales</div>
                            <div className="font-semibold">
                                {formatCurrency(summary.thisMonth.grossSales)}
                            </div>
                        </div>
                        <div>
                            <div className="opacity-75">Expenses</div>
                            <div className="font-semibold">
                                {formatCurrency(summary.thisMonth.expenses)}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Outstanding */}
            <section>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Outstanding
                </h2>
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <Users size={20} />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">
                                {summary.outstanding.customersWithDues} customer
                                {summary.outstanding.customersWithDues !== 1 ? 's' : ''} owe you
                            </div>
                            <div className="text-xl font-bold text-gray-900 mt-0.5">
                                {formatCurrency(summary.outstanding.totalDues)}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Livestock */}
            <section>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Livestock
                </h2>
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <LivestockCount label="Cows" count={summary.counts.cows} />
                        <LivestockCount label="Goats" count={summary.counts.goats} />
                        <LivestockCount label="Chickens" count={summary.counts.chickens} />
                        <LivestockCount label="Ducks" count={summary.counts.ducks} />
                        <LivestockCount label="Sheep" count={summary.counts.sheep} />
                        <LivestockCount label="Buffaloes" count={summary.counts.buffaloes} />
                    </div>
                    {summary.counts.activeFlocks > 0 && (
                        <div className="border-t mt-4 pt-3 text-sm text-gray-500 text-center">
                            + {summary.counts.activeFlocks} active{' '}
                            {summary.counts.activeFlocks === 1 ? 'flock' : 'flocks'}
                        </div>
                    )}
                </div>
            </section>

            <div className="text-center text-xs text-gray-400 py-2">
                Auto-refreshes every 60 seconds
            </div>
        </div>
    );
}

// ============================================================
// Skeleton Component with shimmer + time-aware messaging
// ============================================================
function DashboardSkeleton({ elapsedSeconds }: { elapsedSeconds: number }) {
    // Time-aware message
    let title = 'Loading your dashboard…';
    let subtitle = 'Fetching today\u2019s milk, sales, and expenses';

    if (elapsedSeconds >= 20) {
        title = 'Still loading…';
        subtitle = 'The server was asleep. Waking it up (up to 30s on free tier).';
    } else if (elapsedSeconds >= 8) {
        title = 'Almost there…';
        subtitle = 'Connecting to the server. This may take a few more seconds.';
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Info banner */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
                <Loader2 size={20} className="text-green-600 animate-spin shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-green-900 text-sm flex items-center gap-2">
                        {title}
                        {elapsedSeconds > 0 && (
                            <span className="text-xs font-normal text-green-700">
                {elapsedSeconds}s
              </span>
                        )}
                    </div>
                    <div className="text-xs text-green-700 mt-0.5">{subtitle}</div>

                    {/* Wake-up icon appears after 15 seconds */}
                    {elapsedSeconds >= 15 && (
                        <div className="flex items-center gap-1.5 text-xs text-green-700 mt-2 fade-in">
                            <Wifi size={12} />
                            <span>Free-tier servers sleep after 15 minutes of inactivity</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Skeleton */}
            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <div className="h-7 shimmer rounded w-2/3"></div>
                    <div className="h-4 shimmer rounded w-1/3"></div>
                </div>

                {/* Today */}
                <div className="space-y-3">
                    <div className="h-3 shimmer rounded w-16"></div>
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4">
                                <div className="w-9 h-9 rounded-full shimmer"></div>
                                <div className="h-3 shimmer rounded w-16 mt-3"></div>
                                <div className="h-5 shimmer rounded w-20 mt-2"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* This month */}
                <div className="space-y-3">
                    <div className="h-3 shimmer rounded w-24"></div>
                    <div className="shimmer rounded-2xl h-40"></div>
                </div>

                {/* Outstanding */}
                <div className="space-y-3">
                    <div className="h-3 shimmer rounded w-24"></div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full shimmer"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 shimmer rounded w-32"></div>
                                <div className="h-5 shimmer rounded w-24"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Livestock */}
                <div className="space-y-3">
                    <div className="h-3 shimmer rounded w-20"></div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4">
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="text-center space-y-2">
                                    <div className="h-7 shimmer rounded w-12 mx-auto"></div>
                                    <div className="h-3 shimmer rounded w-14 mx-auto"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Error Component
// ============================================================
function DashboardError({ error, onRetry }: { error: any; onRetry: () => void }) {
    const [retrying, setRetrying] = useState(false);

    const handleRetry = () => {
        setRetrying(true);
        onRetry();
        setTimeout(() => setRetrying(false), 1500);
    };

    return (
        <div className="p-4 md:p-6 fade-in">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                <p className="text-red-800 font-semibold text-lg">
                    Couldn't load dashboard
                </p>
                <p className="text-sm text-red-600 mt-2">
                    {error?.response?.data?.message || error?.message || 'Something went wrong'}
                </p>
                <button
                    onClick={handleRetry}
                    disabled={retrying}
                    className="mt-5 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2 disabled:opacity-70"
                >
                    {retrying ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Retrying…
                        </>
                    ) : (
                        <>
                            <RefreshCw size={16} />
                            Try again
                        </>
                    )}
                </button>
                <p className="text-xs text-red-500 mt-4">
                    If this persists, the server may be offline.
                </p>
            </div>
        </div>
    );
}

// ============================================================
// Sub-components
// ============================================================

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: 'blue' | 'green' | 'amber' | 'red';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        amber: 'bg-amber-50 text-amber-600',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${colors[color]}`}>
                {icon}
            </div>
            <div className="text-xs text-gray-500 mt-3">{label}</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">{value}</div>
        </div>
    );
}

function LivestockCount({ label, count }: { label: string; count: number }) {
    return (
        <div>
            <div className={`text-2xl font-bold ${count > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                {count}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
        </div>
    );
}