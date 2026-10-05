import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, AlertCircle, RefreshCw, Beef } from 'lucide-react';
import { listAnimals } from '@/api/animals';
import type { Species, AnimalStatus, Animal } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { AnimalCard } from '@/components/animals/AnimalCard';
import { AnimalFilters } from '@/components/animals/AnimalFilters';
import { AnimalsSkeleton } from '@/components/animals/AnimalsSkeleton';

export function AnimalsPage() {
    const [species, setSpecies] = useState<Species | null>(null);
    const [status, setStatus] = useState<AnimalStatus | null>(null);
    const [searchInput, setSearchInput] = useState('');

    const search = useDebounce(searchInput, 300);

    const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
        queryKey: ['animals', species, status],
        queryFn: () => listAnimals({
            species: species || undefined,
            status: status || undefined,
        }),
    });

    // Client-side search filter (over the fetched list)
    const animals: Animal[] = data?.data ?? [];
    const filtered = search
        ? animals.filter((a) => {
            const s = search.toLowerCase();
            return (
                a.tagNumber.toLowerCase().includes(s) ||
                (a.name ?? '').toLowerCase().includes(s)
            );
        })
        : animals;

    const hasActiveFilters = species !== null || status !== null || search !== '';

    const clearFilters = () => {
        setSpecies(null);
        setStatus(null);
        setSearchInput('');
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Animals</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isLoading ? 'Loading…' : `${animals.length} total`}
                    </p>
                </div>
                <Link
                    to="/animals/new"
                    className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 active:bg-green-800 transition"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add Animal</span>
                    <span className="sm:hidden">Add</span>
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                    type="text"
                    placeholder="Search by tag number or name…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                />
            </div>

            {/* Filters */}
            <AnimalFilters
                selectedSpecies={species}
                selectedStatus={status}
                onSpeciesChange={setSpecies}
                onStatusChange={setStatus}
            />

            {/* Refreshing indicator */}
            {isFetching && !isLoading && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-blue-800">
                    <RefreshCw size={12} className="animate-spin shrink-0" />
                    <span>Refreshing…</span>
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <AnimalsSkeleton />
            ) : isError ? (
                <ErrorState error={error} onRetry={() => refetch()} />
            ) : filtered.length === 0 ? (
                <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 fade-in">
                    {filtered.map((animal) => (
                        <AnimalCard key={animal.id} animal={animal} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================
// Empty State
// ============================================================
function EmptyState({
                        hasFilters,
                        onClear,
                    }: {
    hasFilters: boolean;
    onClear: () => void;
}) {
    if (hasFilters) {
        return (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                <Search className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-700 font-medium">No matching animals</p>
                <p className="text-sm text-gray-500 mt-1">
                    Try adjusting your search or filters
                </p>
                <button
                    onClick={onClear}
                    className="mt-4 text-sm text-green-600 hover:underline font-medium"
                >
                    Clear all filters
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
            <Beef className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-700 font-medium text-lg">No animals yet</p>
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                Start by adding your first cow, goat, chicken, or other livestock.
            </p>
            <Link
                to="/animals/new"
                className="inline-flex items-center gap-1.5 mt-5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
            >
                <Plus size={18} />
                Add Your First Animal
            </Link>
        </div>
    );
}

// ============================================================
// Error State
// ============================================================
function ErrorState({
                        error,
                        onRetry,
                    }: {
    error: any;
    onRetry: () => void;
}) {
    return (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
            <p className="text-red-800 font-semibold">Couldn't load animals</p>
            <p className="text-sm text-red-600 mt-2">
                {error?.response?.data?.message || error?.message || 'Something went wrong'}
            </p>
            <button
                onClick={onRetry}
                className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2"
            >
                <RefreshCw size={16} />
                Try again
            </button>
        </div>
    );
}