import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, AlertCircle, RefreshCw, Beef } from 'lucide-react';
import { listAnimals } from '@/api/animals';
import { listSpecies } from '@/api/species';
import type { Species, AnimalStatus, Animal } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyPress } from '@/hooks/useKeyPress';
import { AnimalCard } from '@/components/animals/AnimalCard';
import { AnimalsSkeleton } from '@/components/animals/AnimalsSkeleton';

const STATUS_OPTIONS: AnimalStatus[] = ['ACTIVE', 'PREGNANT', 'DRY', 'SICK', 'SOLD', 'DEAD'];

export function AnimalsPage() {
    const [speciesId, setSpeciesId] = useState<number | null>(null);
    const [status, setStatus] = useState<AnimalStatus | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const search = useDebounce(searchInput, 300);
    const searchRef = useRef<HTMLInputElement>(null);

    useKeyPress(
        '/',
        (e) => { e.preventDefault(); searchRef.current?.focus(); },
        { ignoreInputs: true }
    );

    // Lookups
    const speciesQuery = useQuery({
        queryKey: ['species'],
        queryFn: () => listSpecies(true),
        staleTime: 60_000,
    });
    const speciesList: Species[] = speciesQuery.data?.data ?? [];

    // Animals list
    const { data, isLoading, isError, refetch, isFetching } = useQuery({        queryKey: ['animals', speciesId, status],
        queryFn: () => listAnimals({
            speciesId: speciesId || undefined,
            status: status || undefined,
        }),
    });

    const animals: Animal[] = data?.data ?? [];
    const filtered = search
        ? animals.filter((a) => {
            const s = search.toLowerCase();
            return a.tagNumber.toLowerCase().includes(s) ||
                (a.name ?? '').toLowerCase().includes(s);
        })
        : animals;

    const hasActiveFilters = speciesId !== null || status !== null || search !== '';

    const clearFilters = () => {
        setSpeciesId(null);
        setStatus(null);
        setSearchInput('');
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Animals</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isLoading ? 'Loading…' : `${animals.length} total`}
                    </p>
                </div>
                <Link
                    to="/animals/new"
                    className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add Animal</span>
                    <span className="sm:hidden">Add</span>
                </Link>
            </div>

            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search by tag number or name…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                />
            </div>

            {/* Species filter (dynamic chips) */}
            <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Species
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
                    <FilterChip label="All" active={speciesId === null} onClick={() => setSpeciesId(null)} />
                    {speciesList.filter((s) => s.code !== 'OTHER').map((s) => (
                        <FilterChip
                            key={s.id}
                            label={s.name}
                            active={speciesId === s.id}
                            onClick={() => setSpeciesId(speciesId === s.id ? null : s.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Status filter */}
            <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Status
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
                    <FilterChip label="All" active={status === null} onClick={() => setStatus(null)} />
                    {STATUS_OPTIONS.map((s) => (
                        <FilterChip
                            key={s}
                            label={s.charAt(0) + s.slice(1).toLowerCase()}
                            active={status === s}
                            onClick={() => setStatus(status === s ? null : s)}
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
                <AnimalsSkeleton />
            ) : isError ? (
                <ErrorState onRetry={() => refetch()} />
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
                <p className="text-gray-700 font-medium">No matching animals</p>
                <button onClick={onClear} className="mt-4 text-sm text-green-600 hover:underline">
                    Clear all filters
                </button>
            </div>
        );
    }
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
            <Beef className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-700 font-medium text-lg">No animals yet</p>
            <Link to="/animals/new" className="inline-flex items-center gap-1.5 mt-5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition">
                <Plus size={18} />
                Add Your First Animal
            </Link>
        </div>
    );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
            <p className="text-red-800 font-semibold">Couldn't load animals</p>
            <button onClick={onRetry} className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2">
                <RefreshCw size={16} /> Try again
            </button>
        </div>
    );
}