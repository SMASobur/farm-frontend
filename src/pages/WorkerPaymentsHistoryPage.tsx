import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { ArrowLeft, Wallet, Calendar } from 'lucide-react';
import { getWorker } from '@/api/workers';
import { listExpensesByWorker } from '@/api/expenses';
import { formatCurrency, formatDateShort } from '@/lib/format';
import type { Expense } from '@/types';

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

export function WorkerPaymentHistoryPage() {
    const { id } = useParams<{ id: string }>();
    const workerId = Number(id);
    const [preset, setPreset] = useState<Preset>('year');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');

    const workerQuery = useQuery({
        queryKey: ['worker', workerId],
        queryFn: () => getWorker(workerId),
        enabled: Number.isFinite(workerId),
    });

    const expensesQuery = useQuery({
        queryKey: ['worker', workerId, 'expenses', 'all'],
        queryFn: () => listExpensesByWorker(workerId),
        enabled: Number.isFinite(workerId),
    });

    const allPayments: Expense[] = expensesQuery.data?.data ?? [];
    const worker = workerQuery.data?.data;

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
        return allPayments
            .filter(p => {
                if (dateRange.from && p.date < dateRange.from) return false;
                if (dateRange.to && p.date > dateRange.to) return false;
                return true;
            })
            .sort((a, b) => b.date.localeCompare(a.date));
    }, [allPayments, dateRange]);

    const totalAmount = filtered.reduce((sum, p) => sum + p.amount, 0);
    const totalPayments = filtered.length;

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
            <Link
                to={`/workers/${id}`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600"
            >
                <ArrowLeft size={16} /> Back to {worker?.name ?? 'Worker'}
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Wallet size={24} className="text-green-600" />
                    Payment History
                </h1>
                <p className="text-sm text-gray-500 mt-1">{worker?.name}</p>

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
                                <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                                       className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">To</label>
                                <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                                       className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                    <StatBox label="Total Paid" value={formatCurrency(totalAmount)} color="green" />
                    <StatBox label="Payments" value={String(totalPayments)} color="blue" />
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Payments ({filtered.length})
                </h2>

                {expensesQuery.isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-10 shimmer rounded" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <p className="text-center text-gray-500 py-8 text-sm">No payments in this period.</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filtered.map(p => (
                            <Link
                                key={p.id}
                                to={`/expenses/${p.id}`}
                                className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg"
                            >
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{p.description}</div>
                                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                        <Calendar size={12} className="text-gray-400" />
                                        {formatDateShort(p.date)}
                                        <span className="text-gray-300">·</span>
                                        <span>{p.categoryName}</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="font-semibold text-gray-900">{formatCurrency(p.amount)}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    active ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                }`}>
            {label}
        </button>
    );
}

function StatBox({ label, value, color }: { label: string; value: string; color: 'green' | 'blue' }) {
    const colors = {
        green: 'bg-green-50 text-green-700',
        blue: 'bg-blue-50 text-blue-700',
    };
    return (
        <div className={`rounded-xl p-3 text-center ${colors[color]}`}>
            <div className="text-xs font-medium opacity-70 uppercase tracking-wider">{label}</div>
            <div className="text-lg font-bold mt-1">{value}</div>
        </div>
    );
}