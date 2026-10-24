import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getSummary } from '@/api/dashboard';
import { getPoolsStatus } from '@/api/pools';
import { formatCurrency, formatNumber, formatDateLong } from '@/lib/format';
import { AlertsSection } from '@/components/dashboard/AlertsSection';
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
            // Wrap in a microtask to avoid synchronous setState warning
            Promise.resolve().then(() => setSeconds(0));
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

    // Fetch Dashboard Summary
    const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: getSummary,
        refetchInterval: 60_000,
    });

    // Fetch Pools to calculate available to sell
    const { data: poolsData } = useQuery({
        queryKey: ['pools', 'dashboard'],
        queryFn: () => getPoolsStatus(),
    });

    const elapsed = useElapsedSeconds(isLoading);

    if (isLoading) return <DashboardSkeleton elapsedSeconds={elapsed} />;
    if (isError) return <DashboardError error={error} onRetry={() => refetch()} />;

    const summary = data!.data;
    const pools = poolsData?.data ?? [];

    // Calculate total available across all species
    const availableMilk = pools
        .filter(p => p.poolProductType === 'MILK')
        .reduce((sum, p) => sum + p.available, 0);

    const availableEggs = pools
        .filter(p => p.poolProductType === 'EGG')
        .reduce((sum, p) => sum + p.available, 0);

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

            {/* TODAY */}
            <section>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Today
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {/* Milk Card */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
                            <Milk size={20} />
                        </div>
                        <div className="text-xs text-gray-500 mt-3">Milk</div>
                        <div className="text-lg font-bold text-gray-900 mt-0.5">
                            {formatNumber(summary.today.milkLiters, 1)} L <span className="text-xs font-normal text-gray-500">produced</span>
                        </div>
                        {availableMilk > 0 && (
                            <div className="text-sm font-medium text-green-600 mt-1">
                                {formatNumber(availableMilk, 1)} L available to sell
                            </div>
                        )}
                    </div>

                    {/* Eggs Card */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-amber-50 text-amber-600">
                            <Egg size={20} />
                        </div>
                        <div className="text-xs text-gray-500 mt-3">Eggs</div>
                        <div className="text-lg font-bold text-gray-900 mt-0.5">
                            {summary.today.eggs} pcs <span className="text-xs font-normal text-gray-500">produced</span>
                        </div>
                        {availableEggs > 0 && (
                            <div className="text-sm font-medium text-green-600 mt-1">
                                {availableEggs} pcs available to sell
                            </div>
                        )}
                    </div>

                    {/* Sales Card */}
                    <StatCard
                        icon={<TrendingUp size={20} />}
                        label="Sales"
                        value={formatCurrency(summary.today.salesRevenue)}
                        color="green"
                    />

                    {/* Expenses Card */}
                    <StatCard
                        icon={<Receipt size={20} />}
                        label="Expenses"
                        value={formatCurrency(summary.today.expenses)}
                        color="red"
                    />
                </div>
            </section>

            {/* THIS MONTH */}
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

            {/* Alerts */}
            <AlertsSection />

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

                    {/* Animals Grid */}
                    {summary.counts.livestock && summary.counts.livestock.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 text-center">
                            {summary.counts.livestock.map((item: { speciesCode: string; count: number; speciesName: string }) => (
                                <div key={item.speciesCode}>
                                    <div className={`text-2xl font-bold ${item.count > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                                        {item.count}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5 truncate px-1" title={item.speciesName}>
                                        {item.speciesName}s
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-sm text-gray-500 py-2">
                            No active animals found.
                        </div>
                    )}

                    {/* NEW: Flocks List */}
                    {summary.counts.flockDetails && summary.counts.flockDetails.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-gray-100">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Active Batches
                            </div>
                            <div className="space-y-2">
                                {summary.counts.flockDetails.map((flock) => (
                                    <div key={flock.flockCode} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                            <span className="font-medium text-gray-900">
                                                {flock.flockCode}
                                                {flock.name && <span className="text-gray-500 font-normal"> · {flock.name}</span>}
                                            </span>
                                        </div>
                                        <span className="text-gray-600 font-medium bg-gray-50 px-2 py-0.5 rounded text-xs">
                                            {flock.birdCount} birds
                                        </span>
                                    </div>
                                ))}
                            </div>
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
                    {elapsedSeconds >= 15 && (
                        <div className="flex items-center gap-1.5 text-xs text-green-700 mt-2 fade-in">
                            <Wifi size={12} />
                            <span>Free-tier servers sleep after 15 minutes of inactivity</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="h-7 shimmer rounded w-2/3"></div>
                    <div className="h-4 shimmer rounded w-1/3"></div>
                </div>

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

                <div className="space-y-3">
                    <div className="h-3 shimmer rounded w-24"></div>
                    <div className="shimmer rounded-2xl h-40"></div>
                </div>

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
