import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { ArrowLeft, Egg, Calendar } from 'lucide-react';
import { listEggsByAnimal } from '@/api/eggs';
import { getAnimal } from '@/api/animals';
import { formatNumber } from '@/lib/format';

type Preset = 'month' | 'year' | 'all' | 'custom';

function todayISO() { return new Date().toISOString().split('T')[0]; }
function startOfMonthISO() {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
}
function startOfYearISO() {
    const d = new Date();
    d.setMonth(0, 1);
    return d.toISOString().split('T')[0];
}

export function AnimalEggHistoryPage() {
    const { id } = useParams<{ id: string }>();
    const animalId = Number(id);

    const [preset, setPreset] = useState<Preset>('month');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');

    const animalQuery = useQuery({
        queryKey: ['animal', animalId],
        queryFn: () => getAnimal(animalId),
        enabled: Number.isFinite(animalId),
    });

    const eggQuery = useQuery({
        queryKey: ['animal', animalId, 'eggs', 'all'],
        queryFn: () => listEggsByAnimal(animalId),
        enabled: Number.isFinite(animalId),
    });

    const allRecords = eggQuery.data?.data ?? [];

    const dateRange = useMemo(() => {
        const today = todayISO();
        switch (preset) {
            case 'month': return { from: startOfMonthISO(), to: today };
            case 'year': return { from: startOfYearISO(), to: today };
            case 'custom': return { from: customFrom, to: customTo };
            case 'all': return { from: '', to: '' };
        }
    }, [preset, customFrom, customTo]);

    const filtered = useMemo(() => {
        return allRecords
            .filter(r => {
                if (dateRange.from && r.date < dateRange.from) return false;
                if (dateRange.to && r.date > dateRange.to) return false;
                return true;
            })
            .sort((a, b) => b.date.localeCompare(a.date));
    }, [allRecords, dateRange]);

    const totalEggs = filtered.reduce((sum, r) => sum + r.totalEggs, 0);
    const totalGood = filtered.reduce((sum, r) => sum + r.goodEggs, 0);
    const totalCracked = filtered.reduce((sum, r) => sum + r.crackedEggs, 0);
    const avgDaily = filtered.length > 0 ? totalEggs / filtered.length : 0;

    const animal = animalQuery.data?.data;

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
            <Link
                to={`/animals/${id}`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600"
            >
                <ArrowLeft size={16} /> Back to {animal?.tagNumber ?? 'Animal'}
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Egg size={24} className="text-amber-500" />
                    Egg History
                </h1>
                <p className="text-sm text-gray-500 mt-1">{animal?.tagNumber}</p>

                {/* Filters */}
                <div className="mt-6 space-y-3">
                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Period</div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            <FilterChip label="This Month" active={preset === 'month'} onClick={() => setPreset('month')} />
                            <FilterChip label="This Year" active={preset === 'year'} onClick={() => setPreset('year')} />
                            <FilterChip label="All Time" active={preset === 'all'} onClick={() => setPreset('all')} />
                            <FilterChip label="Custom" active={preset === 'custom'} onClick={() => setPreset('custom')} />
                        </div>
                    </div>

                    {preset === 'custom' && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">From</label>
                                <input
                                    type="date"
                                    value={customFrom}
                                    onChange={e => setCustomFrom(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">To</label>
                                <input
                                    type="date"
                                    value={customTo}
                                    onChange={e => setCustomTo(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                    <StatBox label="Total Eggs" value={`${formatNumber(totalEggs, 0)}`} color="amber" />
                    <StatBox label="Good" value={`${formatNumber(totalGood, 0)}`} color="green" />
                    <StatBox label="Cracked" value={`${formatNumber(totalCracked, 0)}`} color="red" />
                    <StatBox label="Avg / Day" value={`${formatNumber(avgDaily, 1)}`} color="blue" />
                </div>
            </div>

            {/* Records */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Records ({filtered.length})
                </h2>

                {eggQuery.isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-10 shimmer rounded" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <p className="text-center text-gray-500 py-8 text-sm">No records in this period.</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filtered.map(r => (
                            <div key={r.id} className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Calendar size={14} className="text-gray-400" />
                                    {new Date(r.date).toLocaleDateString('en-GB', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-gray-500">{r.goodEggs} good</span>
                                    {r.crackedEggs > 0 && (
                                        <span className="text-amber-600">{r.crackedEggs} cracked</span>
                                    )}
                                    <span className="font-semibold text-gray-900">{r.totalEggs} total</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                active
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
        >
            {label}
        </button>
    );
}

function StatBox({ label, value, color }: { label: string; value: string; color: 'amber' | 'green' | 'red' | 'blue' }) {
    const colors = {
        amber: 'bg-amber-50 text-amber-700',
        green: 'bg-green-50 text-green-700',
        red: 'bg-red-50 text-red-700',
        blue: 'bg-blue-50 text-blue-700',
    };
    return (
        <div className={`rounded-xl p-3 text-center ${colors[color]}`}>
            <div className="text-xs font-medium opacity-70 uppercase tracking-wider">{label}</div>
            <div className="text-lg font-bold mt-1">{value}</div>
        </div>
    );
}