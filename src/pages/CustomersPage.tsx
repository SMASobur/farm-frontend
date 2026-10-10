import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, AlertCircle, RefreshCw, Users } from 'lucide-react';
import { listCustomers } from '@/api/customers';
import { listCustomerTypes } from '@/api/customerTypes';
import type { Customer, CustomerType } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyPress } from '@/hooks/useKeyPress';
import { CustomerCard } from '@/components/customers/CustomerCard';

export function CustomersPage() {
    const [customerTypeId, setCustomerTypeId] = useState<number | null>(null);
    const [searchInput, setSearchInput] = useState('');
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

    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['customers', customerTypeId, search],
        queryFn: () => listCustomers({
            customerTypeId: customerTypeId || undefined,
            search: search || undefined,
        }),
    });

    const customers: Customer[] = data?.data ?? [];
    const hasActiveFilters = customerTypeId !== null || search !== '';

    const clearFilters = () => {
        setCustomerTypeId(null);
        setSearchInput('');
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isLoading ? 'Loading…' : `${customers.length} total`}
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

            {/* Customer Type filter chips (dynamic) */}
            <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Type
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
                    <FilterChip label="All" active={customerTypeId === null} onClick={() => setCustomerTypeId(null)} />
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
            ) : customers.length === 0 ? (
                <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 fade-in">
                    {customers.map((c) => (
                        <CustomerCard key={c.id} customer={c} />
                    ))}
                </div>
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