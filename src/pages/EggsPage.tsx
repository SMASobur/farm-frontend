import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Egg, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { listEggs } from '@/api/eggs';
import { EggCard } from '@/components/eggs/EggCard';
import { formatNumber } from '@/lib/format';
import type { EggProduction } from '@/types';

type Preset = 'today' | 'week' | 'month' | 'all';

const PAGE_SIZE = 50;

function todayISO(): string { return new Date().toISOString().split('T')[0]; }
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
    const [page, setPage] = useState(0);

    const dateRange = useMemo(() => {
        const today = todayISO();
        switch (preset) {
            case 'today': return { from: today, to: today };
            case 'week':  return { from: startOfWeekISO(), to: today };
            case 'month': return { from: startOfMonthISO(), to: today };
            case 'all':   return { from: undefined, to: undefined };
        }
    }, [preset]);

    useEffect(() => {
        setPage(0);
    }, [preset]);

    const eggQuery = useQuery({
        queryKey: ['eggs', dateRange.from, dateRange.to, page],
        queryFn: () => listEggs({
            from: dateRange.from,
            to: dateRange.to,
            page,
            size: PAGE_SIZE,
        }),
    });

    const entries: EggProduction[] = eggQuery.data?.data.content ?? [];
    const totalElements = eggQuery.data?.data.totalElements ?? 0;
    const totalPages = eggQuery.data?.data.totalPages ?? 1;
    const hasNext = eggQuery.data?.data.last === false;
    const hasPrev = page > 0;

    const totalGood = entries.reduce((sum, e) => sum + e.goodEggs, 0);
    const totalCracked = entries.reduce((sum, e) => sum + e.crackedEggs, 0);

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Egg Production</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {eggQuery.isLoading
                            ? 'Loading…'
                            : totalElements === 0
                                ? 'No entries found'
                                : `${totalElements} entr${totalElements === 1 ? 'y' : 'ies'} · ${formatNumber(totalGood, 0)} good`}
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

            {/* Period Filter */}
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

            {/* Refreshing */}
            {eggQuery.isFetching && !eggQuery.isLoading && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-blue-800">
                    <RefreshCw size={12} className="animate-spin shrink-0" />
                    <span>Refreshing…</span>
                </div>
            )}

            {/* Content */}
            {eggQuery.isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 h-32">
                            <div className="h-4 shimmer rounded w-24 mb-3"></div>
                            <div className="h-5 shimmer rounded w-16"></div>
                        </div>
                    ))}
                </div>
            ) : eggQuery.isError ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Couldn't load egg entries</p>
                    <button
                        onClick={() => eggQuery.refetch()}
                        className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
                    >
                        <RefreshCw size={16} /> Try again
                    </button>
                </div>
            ) : totalElements === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                    <Egg className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-700 font-medium text-lg">No egg entries yet</p>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                        Record today's egg collection to start tracking production.
                    </p>
                    <Link
                        to="/eggs/new"
                        className="inline-flex items-center gap-1.5 mt-5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        <Plus size={18} /> Record First Entry
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 fade-in">
                        {entries.map((entry) => (
                            <EggCard key={entry.id} entry={entry} />
                        ))}
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={!hasPrev}
                            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>

                        <span className="text-sm text-gray-600">
                            Page <span className="font-semibold">{page + 1}</span> of <span className="font-semibold">{totalPages}</span>
                            {' '}({totalElements} total · {totalGood} good · {totalCracked} cracked)
                        </span>

                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={!hasNext}
                            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}