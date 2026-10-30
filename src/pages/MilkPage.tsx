import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Milk, AlertCircle, RefreshCw } from 'lucide-react';
import { listMilk } from '@/api/milk';
import { listAnimals } from '@/api/animals';
import { MilkCard } from '@/components/milk/MilkCard';
import { AnimalCombobox } from '@/components/forms/AnimalCombobox';
import { formatNumber } from '@/lib/format';
import type { MilkProduction, Animal } from '@/types';

type Preset = 'today' | 'week' | 'month' | 'all';

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

export function MilkPage() {
    const [preset, setPreset] = useState<Preset>('month');
    const [animalId, setAnimalId] = useState<number | null>(null);

    const dateRange = useMemo(() => {
        const today = todayISO();
        switch (preset) {
            case 'today': return { from: today, to: today };
            case 'week':  return { from: startOfWeekISO(), to: today };
            case 'month': return { from: startOfMonthISO(), to: today };
            case 'all':   return { from: undefined, to: undefined };
        }
    }, [preset]);

    const milkQuery = useQuery({
        queryKey: ['milk', dateRange.from, dateRange.to, animalId],
        queryFn: () => listMilk({
            from: dateRange.from,
            to: dateRange.to,
            animalId: animalId || undefined,
        }),
    });

    const animalsQuery = useQuery({
        queryKey: ['animals', 'milk-producers'],
        queryFn: () => listAnimals(),
        staleTime: 60_000,
    });

    const animals: Animal[] = (animalsQuery.data?.data ?? []).filter(
        (a) => a.milkProducer && a.lifecycleStatus === 'ACTIVE' && a.gender === 'FEMALE'
    );

    const entries: MilkProduction[] = milkQuery.data?.data ?? [];
    const totalLiters = entries.reduce((sum, e) => sum + e.totalLiters, 0);

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Milk Production</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {milkQuery.isLoading
                            ? 'Loading…'
                            : entries.length === 0
                                ? 'No entries found'
                                : `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} · ${formatNumber(totalLiters, 1)} L`}
                    </p>
                </div>
                <Link
                    to="/milk/new"
                    className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Record Milk</span>
                    <span className="sm:hidden">Add</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="space-y-3">
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

                {/* REPLACED: Now using searchable AnimalCombobox */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Animal
                    </label>
                    <AnimalCombobox
                        animals={animals}
                        value={animalId}
                        onChange={setAnimalId}
                        placeholder="All animals: search by tag or name"
                        allowClear
                    />
                </div>
            </div>

            {/* Refreshing */}
            {milkQuery.isFetching && !milkQuery.isLoading && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-blue-800">
                    <RefreshCw size={12} className="animate-spin shrink-0" />
                    <span>Refreshing…</span>
                </div>
            )}

            {/* Content */}
            {milkQuery.isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full shimmer shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 shimmer rounded w-24"></div>
                                    <div className="h-3 shimmer rounded w-16"></div>
                                </div>
                            </div>
                            <div className="h-3 shimmer rounded w-40"></div>
                        </div>
                    ))}
                </div>
            ) : milkQuery.isError ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Couldn't load milk entries</p>
                    <button
                        onClick={() => milkQuery.refetch()}
                        className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
                    >
                        <RefreshCw size={16} /> Try again
                    </button>
                </div>
            ) : entries.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                    <Milk className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-700 font-medium text-lg">No milk entries yet</p>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                        Record today's milking to start tracking production.
                    </p>
                    <Link
                        to="/milk/new"
                        className="inline-flex items-center gap-1.5 mt-5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        <Plus size={18} />
                        Record First Entry
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 fade-in">
                    {entries.map((entry) => (
                        <MilkCard key={entry.id} entry={entry} />
                    ))}
                </div>
            )}
        </div>
    );
}