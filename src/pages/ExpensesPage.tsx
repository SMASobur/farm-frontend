import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, AlertCircle, RefreshCw, Receipt } from 'lucide-react';
import { listExpenses } from '@/api/expenses';
import { listCategories } from '@/api/categories';
import { ExpenseCard } from '@/components/expenses/ExpenseCard';
import { ExpenseFilters, type DateRangePreset } from '@/components/expenses/ExpenseFilters';
import { ExpensesSkeleton } from '@/components/expenses/ExpensesSkeleton';
import { formatCurrency } from '@/lib/format';
import type { Expense } from '@/types';

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

export function ExpensesPage() {
    const [preset, setPreset] = useState<DateRangePreset>('month');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);

    const dateRange = useMemo(() => {
        const today = todayISO();
        switch (preset) {
            case 'today':  return { from: today, to: today };
            case 'week':   return { from: startOfWeekISO(), to: today };
            case 'month':  return { from: startOfMonthISO(), to: today };
            case 'all':    return { from: undefined, to: undefined };
            case 'custom': return { from: customFrom || undefined, to: customTo || undefined };
        }
    }, [preset, customFrom, customTo]);

    const expensesQuery = useQuery({
        queryKey: ['expenses', dateRange.from, dateRange.to, categoryId],
        queryFn: () => listExpenses({
            from: dateRange.from,
            to: dateRange.to,
            categoryId: categoryId || undefined,
        }),
    });

    const categoriesQuery = useQuery({
        queryKey: ['categories', 'EXPENSE'],
        queryFn: () => listCategories('EXPENSE', true),
        staleTime: 60_000,
    });

    const expenses: Expense[] = expensesQuery.data?.data ?? [];
    const categories = categoriesQuery.data?.data ?? [];
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {expensesQuery.isLoading
                            ? 'Loading…'
                            : expenses.length === 0
                                ? 'No expenses found'
                                : `${expenses.length} expense${expenses.length === 1 ? '' : 's'} · ${formatCurrency(total)}`}
                    </p>
                </div>
                <Link
                    to="/expenses/new"
                    className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 active:bg-green-800 transition"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add Expense</span>
                    <span className="sm:hidden">Add</span>
                </Link>
            </div>

            <ExpenseFilters
                preset={preset}
                from={customFrom}
                to={customTo}
                categoryId={categoryId}
                categories={categories}
                onPresetChange={setPreset}
                onFromChange={setCustomFrom}
                onToChange={setCustomTo}
                onCategoryChange={setCategoryId}
            />

            {expensesQuery.isFetching && !expensesQuery.isLoading && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-blue-800">
                    <RefreshCw size={12} className="animate-spin shrink-0" />
                    <span>Refreshing…</span>
                </div>
            )}

            {expensesQuery.isLoading ? (
                <ExpensesSkeleton />
            ) : expensesQuery.isError ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Couldn't load expenses</p>
                    <button
                        onClick={() => expensesQuery.refetch()}
                        className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2"
                    >
                        <RefreshCw size={16} /> Try again
                    </button>
                </div>
            ) : expenses.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                    <Receipt className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-700 font-medium text-lg">No expenses yet</p>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                        Start tracking your farm costs to see real profit margins.
                    </p>
                    <Link
                        to="/expenses/new"
                        className="inline-flex items-center gap-1.5 mt-5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        <Plus size={18} />
                        Record Your First Expense
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 fade-in">
                    {expenses.map((expense) => (
                        <ExpenseCard key={expense.id} expense={expense} />
                    ))}
                </div>
            )}
        </div>
    );
}