import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, AlertCircle, RefreshCw, Users } from 'lucide-react';
import { listCustomers } from '@/api/customers';
import type { CustomerType, Customer } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyPress } from '@/hooks/useKeyPress';
import { CustomerCard } from '@/components/customers/CustomerCard';
import { CustomerFilters } from '@/components/customers/CustomerFilters';
import { CustomersSkeleton } from '@/components/customers/CustomersSkeleton';

export function CustomersPage() {
    const [type, setType] = useState<CustomerType | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const search = useDebounce(searchInput, 300);
    const searchRef = useRef<HTMLInputElement>(null);

    useKeyPress(
        '/',
        (e) => { e.preventDefault(); searchRef.current?.focus(); },
        { ignoreInputs: true }
    );

    const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
        queryKey: ['customers', type, search],
        queryFn: () => listCustomers({
            type: type || undefined,
            search: search || undefined,
        }),
    });

    const customers: Customer[] = data?.data ?? [];
    const hasActiveFilters = type !== null || search !== '';

    const clearFilters = () => {
        setType(null);
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
                    className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 active:bg-green-800 transition"
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
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                />
            </div>

            <CustomerFilters selectedType={type} onTypeChange={setType} />

            {isFetching && !isLoading && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-blue-800">
                    <RefreshCw size={12} className="animate-spin shrink-0" />
                    <span>Refreshing…</span>
                </div>
            )}

            {isLoading ? (
                <CustomersSkeleton />
            ) : isError ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Couldn't load customers</p>
                    <p className="text-sm text-red-600 mt-2">
                        {(error as any)?.response?.data?.message || 'Something went wrong'}
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2"
                    >
                        <RefreshCw size={16} /> Try again
                    </button>
                </div>
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

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
    if (hasFilters) {
        return (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                <Search className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-700 font-medium">No matching customers</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                <button onClick={onClear} className="mt-4 text-sm text-green-600 hover:underline font-medium">
                    Clear all filters
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
            <Users className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-700 font-medium text-lg">No customers yet</p>
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                Add your first customer to start recording sales and tracking dues.
            </p>
            <Link
                to="/customers/new"
                className="inline-flex items-center gap-1.5 mt-5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
            >
                <Plus size={18} />
                Add Your First Customer
            </Link>
        </div>
    );
}