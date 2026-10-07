import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, AlertCircle, RefreshCw, ShoppingCart } from 'lucide-react';
import { listSales } from '@/api/sales';
import { listCustomers } from '@/api/customers';
import { listCategories } from '@/api/categories';
import { SaleCard } from '@/components/sales/SaleCard';
import { SalesFilters, type DateRangePreset } from '@/components/sales/SalesFilters';
import { SalesSkeleton } from '@/components/sales/SalesSkeleton';
import { formatCurrency } from '@/lib/format';
import type { Sale } from '@/types';

// ============================================================
// Date helpers for presets
// ============================================================

function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}

function startOfWeekISO(): string {
    const d = new Date();
    const day = d.getDay(); // 0 = Sunday
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    d.setDate(diff);
    return d.toISOString().split('T')[0];
}

function startOfMonthISO(): string {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
}

// ============================================================
// Page
// ============================================================

export function SalesPage() {
    const [preset, setPreset] = useState<DateRangePreset>('month');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [categoryId, setCategoryId] = useState<number | null>(null);

    // Compute effective date range from preset
    const dateRange = useMemo(() => {
        const today = todayISO();
        switch (preset) {
            case 'today':
                return { from: today, to: today };
            case 'week':
                return { from: startOfWeekISO(), to: today };
            case 'month':
                return { from: startOfMonthISO(), to: today };
            case 'all':
                return { from: undefined, to: undefined };
            case 'custom':
                return { from: customFrom || undefined, to: customTo || undefined };
        }
    }, [preset, customFrom, customTo]);

    // Data queries
    const salesQuery = useQuery({
        queryKey: ['sales', dateRange.from, dateRange.to, customerId, categoryId],
        queryFn: () => listSales({
            from: dateRange.from,
            to: dateRange.to,
            customerId: customerId || undefined,
            categoryId: categoryId || undefined,
        }),
    });

    const customersQuery = useQuery({
        queryKey: ['customers', 'all'],
        queryFn: () => listCustomers(),
        staleTime: 60_000,
    });

    const categoriesQuery = useQuery({
        queryKey: ['categories', 'PRODUCT'],
        queryFn: () => listCategories('PRODUCT', true),
        staleTime: 60_000,
    });

    const sales: Sale[] = salesQuery.data?.data ?? [];
    const customers = customersQuery.data?.data ?? [];
    const categories = categoriesQuery.data?.data ?? [];

    // Total of visible sales
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalDue = sales.reduce((sum, s) => sum + s.dueAmount, 0);

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {salesQuery.isLoading
                            ? 'Loading…'
                            : sales.length === 0
                                ? 'No sales found'
                                : `${sales.length} sale${sales.length === 1 ? '' : 's'} · ${formatCurrency(totalRevenue)}`}
                        {!salesQuery.isLoading && totalDue > 0 && (
                            <span className="ml-2 text-amber-700 font-semibold">
                                · {formatCurrency(totalDue)} due
                            </span>
                        )}
                    </p>
                </div>
                <Link
                    to="/sales/new"
                    className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 active:bg-green-800 transition"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">New Sale</span>
                    <span className="sm:hidden">New</span>
                </Link>
            </div>

            {/* Filters */}
            <SalesFilters
                preset={preset}
                from={customFrom}
                to={customTo}
                customerId={customerId}
                categoryId={categoryId}
                customers={customers}
                categories={categories}
                onPresetChange={setPreset}
                onFromChange={setCustomFrom}
                onToChange={setCustomTo}
                onCustomerChange={setCustomerId}
                onCategoryChange={setCategoryId}
            />

            {/* Refreshing indicator */}
            {salesQuery.isFetching && !salesQuery.isLoading && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-blue-800">
                    <RefreshCw size={12} className="animate-spin shrink-0" />
                    <span>Refreshing…</span>
                </div>
            )}

            {/* Content */}
            {salesQuery.isLoading ? (
                <SalesSkeleton />
            ) : salesQuery.isError ? (
                <ErrorState error={salesQuery.error} onRetry={() => salesQuery.refetch()} />
            ) : sales.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-3 fade-in">
                    {sales.map((sale) => (
                        <SaleCard key={sale.id} sale={sale} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================
// Empty State
// ============================================================

function EmptyState() {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
            <ShoppingCart className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-700 font-medium text-lg">No sales yet</p>
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                Record your first sale to start tracking revenue and customer dues.
            </p>
            <Link
                to="/sales/new"
                className="inline-flex items-center gap-1.5 mt-5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
            >
                <Plus size={18} />
                Record Your First Sale
            </Link>
        </div>
    );
}

// ============================================================
// Error State
// ============================================================

function ErrorState({ error, onRetry }: { error: any; onRetry: () => void }) {
    return (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
            <p className="text-red-800 font-semibold">Couldn't load sales</p>
            <p className="text-sm text-red-600 mt-2">
                {error?.response?.data?.message || error?.message || 'Something went wrong'}
            </p>
            <button
                onClick={onRetry}
                className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2"
            >
                <RefreshCw size={16} /> Try again
            </button>
        </div>
    );
}