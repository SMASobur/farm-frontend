import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Egg, AlertCircle, RefreshCw } from 'lucide-react';
import { listEggs } from '@/api/eggs';
import { EggCard } from '@/components/eggs/EggCard';
import { formatNumber } from '@/lib/format';
import type { EggProduction } from '@/types';

type Preset = 'today' | 'week' | 'month' | 'all';

function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}

function startOfWeekISO(): string {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
}

function startOfMonthISO(): string {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
}

export function EggsPage() {
    const [preset, setPreset] = useState<Preset>('month');

    const dateRange = useMemo(() => {
        const today = todayISO();
        switch (preset) {
            case 'today': return { from: today, to: today };
            case 'week':  return { from: startOfWeekISO(), to: today };
            case 'month': return { from: startOfMonthISO(), to: today };
            case 'all':   return { from: undefined, to: undefined };
        }
    }, [preset]);

    const eggsQuery = useQuery({
        queryKey: ['eggs', dateRange.from, dateRange.to],
        queryFn: () => listEggs({ from: dateRange.from, to: dateRange.to }),
    });

    const entries: EggProduction[] = eggsQuery.data?.data ?? [];
    const totalEggs = entries.reduce((sum, e) => sum + e.totalEggs, 0);
    const goodEggs = entries.reduce((sum, e) => sum + e.goodEggs, 0);
    const crackedEggs = entries.reduce((sum, e) => sum + e.crackedEggs, 0);

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Egg Production</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {eggsQuery.isLoading
                            ? 'Loading…'
                            : entries.length === 0
                                ? 'No entries found'
                                : `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} · ${formatNumber(totalEggs, 0)} eggs`}
                    </p>
                </div>
                <Link
                    to="/eggs/new"
                    className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Record Eggs</span>
                    <span className="sm:hidden">Add</span>
                </Link>
            </div>

            {/* Preset chips */}
            <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Period
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
                    {([
                        { value: 'today' as const, label: 'Today' },
                        { value: 'week' as const, label: 'This Week' },
                        { value: 'month' as const, label: 'This Month' },
                        { value: 'all' as const, label: 'All Time' },
                    ]).map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPreset(p.value)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                                preset === p.value
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary strip */}
            {!eggsQuery.isLoading && entries.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <div className="text-xs text-amber-700 uppercase tracking-wider font-medium">
                            Total
                        </div>
                        <div className="text-xl font-bold text-amber-900 mt-0.5">
                            {formatNumber(totalEggs, 0)}
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                        <div className="text-xs text-green-700 uppercase tracking-wider font-medium">
                            Good
                        </div>
                        <div className="text-xl font-bold text-green-900 mt-0.5">
                            {formatNumber(goodEggs, 0)}
                        </div>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                        <div className="text-xs text-red-700 uppercase tracking-wider font-medium">
                            Cracked
                        </div>
                        <div className="text-xl font-bold text-red-900 mt-0.5">
                            {formatNumber(crackedEggs, 0)}
                        </div>
                    </div>
                </div>
            )}

            {eggsQuery.isFetching && !eggsQuery.isLoading && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-blue-800">
                    <RefreshCw size={12} className="animate-spin shrink-0" />
                    <span>Refreshing…</span>
                </div>
            )}

            {eggsQuery.isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4">
                            <div className="h-16 shimmer rounded"></div>
                        </div>
                    ))}
                </div>
            ) : eggsQuery.isError ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Couldn't load eggs</p>
                    <button
                        onClick={() => eggsQuery.refetch()}
                        className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
                    >
                        <RefreshCw size={16} /> Try again
                    </button>
                </div>
            ) : entries.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                    <Egg className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-700 font-medium text-lg">No egg entries yet</p>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                        Record today's egg collection from your batch or individual birds.
                    </p>
                    <Link
                        to="/eggs/new"
                        className="inline-flex items-center gap-1.5 mt-5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        <Plus size={18} />
                        Record First Entry
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 fade-in">
                    {entries.map((entry) => (
                        <EggCard key={entry.id} entry={entry} />
                    ))}
                </div>
            )}
        </div>
    );
}