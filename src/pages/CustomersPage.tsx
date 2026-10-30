import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Plus, Search, AlertCircle, RefreshCw, Users, Wallet,
    ChevronLeft, ChevronRight,
} from 'lucide-react';
import { listCustomers } from '@/api/customers';
import { listCustomerTypes } from '@/api/customerTypes';
import type { Customer, CustomerType } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyPress } from '@/hooks/useKeyPress';
import { CustomerCard } from '@/components/customers/CustomerCard';

const PAGE_SIZE = 50;

export function CustomersPage() {
    const [customerTypeId, setCustomerTypeId] = useState<number | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const [hasDues, setHasDues] = useState(false);
    const [page, setPage] = useState(0);
    const search = useDebounce(searchInput, 300);
    const searchRef = useRef<HTMLInputElement>(null);

    useKeyPress(
        '/',
        (e) => { e.preventDefault(); searchRef.current?.focus(); },
        { ignoreInputs: true }
    );

    const customerTypesQuery = useQuery({
        queryKey: ['customer-types'],
        queryFn: () => listCustomerTypes(true),
        staleTime: 60_000,
    });
    const customerTypes: CustomerType[] = customerTypesQuery.data?.data ?? [];

    useEffect(() => {
        setPage(0);
    }, [customerTypeId, search, hasDues]);

    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['customers', customerTypeId, search, page],
        queryFn: () => listCustomers({
            customerTypeId: customerTypeId || undefined,
            search: search || undefined,
            page,
            size: PAGE_SIZE,
        }),
    });

    const allCustomers: Customer[] = data?.data.content ?? [];
    const totalElements = data?.data.totalElements ?? 0;
    const totalPages = data?.data.totalPages ?? 1;
    const hasNext = data?.data.last === false;
    const hasPrev = page > 0;

    // Dues filter applies on this page
    const customers = hasDues
        ? allCustomers.filter(c => (c.totalDue ?? 0) > 0)
        : allCustomers;

    const totalDues = allCustomers.reduce((sum, c) => sum + (c.totalDue || 0), 0);
    const customersWithDuesCount = allCustomers.filter(c => (c.totalDue ?? 0) > 0).length;

    const hasActiveFilters = customerTypeId !== null || search !== '' || hasDues;

    const clearFilters = () => {
        setCustomerTypeId(null);
        setSearchInput('');
        setHasDues(false);
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isLoading ? 'Loading…' : `${totalElements} total`}
                    </p>
                </div>
                <Link
                    to="/customers/new"
                    className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add Customer</span>
                    <span className="sm:hidden">Add</span>
                </Link>
            </div>

            {/* Dues Summary Banner — ALWAYS shown if dues exist on page */}
            {!isLoading && customersWithDuesCount > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-amber-800">
                        <Wallet size={20} className="text-amber-600 shrink-0" />
                        <div>
                            <span className="font-bold">{customersWithDuesCount} customer(s)</span> currently have dues
                            <span className="text-xs"> on this page</span>.
                            <span className="ml-2 font-bold">৳{totalDues.toLocaleString('en-IN')}</span> total on this page.
                        </div>
                    </div>
                    <button
                        onClick={() => setHasDues(!hasDues)}
                        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition shrink-0 ${
                            hasDues
                                ? 'bg-amber-600 text-white'
                                : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                        }`}
                    >
                        {hasDues ? 'Showing Only Dues' : 'Show Only Dues'}
                    </button>
                </div>
            )}

            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search by name…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                />
            </div>

            {/* Type filter chips */}
            <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Type
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
                    <FilterChip
                        label="All"
                        active={customerTypeId === null && !hasDues}
                        onClick={() => { setCustomerTypeId(null); setHasDues(false); }}
                    />
                    {customerTypes.filter((t) => t.code !== 'OTHER').map((t) => (
                        <FilterChip
                            key={t.id}
                            label={t.name}
                            active={customerTypeId === t.id}
                            onClick={() => setCustomerTypeId(customerTypeId === t.id ? null : t.id)}
                        />
                    ))}
                </div>
            </div>

            {isFetching && !isLoading && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-blue-800">
                    <RefreshCw size={12} className="animate-spin shrink-0" />
                    <span>Refreshing…</span>
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full shimmer shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 shimmer rounded w-32"></div>
                                    <div className="h-3 shimmer rounded w-24"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : isError ? (
                <ErrorState onRetry={() => refetch()} />
            ) : totalElements === 0 ? (
                <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 fade-in">
                        {customers.map((c) => (
                            <CustomerCard key={c.id} customer={c} />
                        ))}
                    </div>

                    {/* Pagination */}
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
                            {' '}({totalElements} total)
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

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                active ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
        >
            {label}
        </button>
    );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
    if (hasFilters) {
        return (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                <Search className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-700 font-medium">No matching customers</p>
                <button onClick={onClear} className="mt-4 text-sm text-green-600 hover:underline">
                    Clear all filters
                </button>
            </div>
        );
    }
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
            <Users className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-700 font-medium text-lg">No customers yet</p>
            <Link to="/customers/new" className="inline-flex items-center gap-1.5 mt-5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition">
                <Plus size={18} />
                Add Your First Customer
            </Link>
        </div>
    );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
            <p className="text-red-800 font-semibold">Couldn't load customers</p>
            <button onClick={onRetry} className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2">
                <RefreshCw size={16} /> Try again
            </button>
        </div>
    );
}