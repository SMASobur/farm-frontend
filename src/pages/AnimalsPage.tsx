import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, AlertCircle, RefreshCw, Beef } from 'lucide-react';
import { listAnimals } from '@/api/animals';
import type { AnimalCondition } from '@/api/animals';
import { listSpecies } from '@/api/species';
import type { Species, LifecycleStatus, Animal } from '@/types';
import { LIFECYCLE_STATUS_LABELS } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyPress } from '@/hooks/useKeyPress';
import { AnimalCard } from '@/components/animals/AnimalCard';
import { AnimalsSkeleton } from '@/components/animals/AnimalsSkeleton';
import { FilterDropdown } from '@/components/filters/FilterDropdown';
import { ActiveFilterPill } from '@/components/filters/ActiveFilterPill';

const LIFECYCLE_OPTIONS: LifecycleStatus[] = ['ACTIVE', 'SOLD', 'DEAD', 'CULLED'];

const CONDITION_OPTIONS: { value: AnimalCondition; label: string }[] = [
    { value: 'PREGNANT', label: 'Pregnant' },
    { value: 'SICK', label: 'Sick' },
    { value: 'MILKING', label: 'Milking' },
];

export function AnimalsPage() {
    const [speciesId, setSpeciesId] = useState<number | null>(null);
    const [lifecycle, setLifecycle] = useState<LifecycleStatus | null>("ACTIVE");
    const [condition, setCondition] = useState<AnimalCondition | null>(null);
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
    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['animals', speciesId, lifecycle, condition, search],
        queryFn: () => listAnimals({
            speciesId: speciesId || undefined,
            status: lifecycle || undefined,
            condition: condition || undefined,
            search: search || undefined,
        }),
    });

    const animals: Animal[] = data?.data ?? [];

    const selectedSpecies = speciesList.find((s) => s.id === speciesId);
    const selectedCondition = CONDITION_OPTIONS.find((c) => c.value === condition);

    const hasActiveFilters =
        speciesId !== null || lifecycle !== null || condition !== null || search !== '';

    const activeFilterCount =
        (speciesId !== null ? 1 : 0) +
        (lifecycle !== null ? 1 : 0) +
        (condition !== null ? 1 : 0);

    const clearFilters = () => {
        setSpeciesId(null);
        setLifecycle(null);
        setCondition(null);
        setSearchInput('');
    };

    return (
        <div className="p-4 md:p-6 space-y-4">
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
                    className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add Animal</span>
                    <span className="sm:hidden">Add</span>
                </Link>
            </div>

            {/* Search */}
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

            <FilterDropdown
                label="Lifecycle"
                value={lifecycle}
                options={LIFECYCLE_OPTIONS.map((s) => ({
                    value: s,
                    label: LIFECYCLE_STATUS_LABELS[s],
                }))}
                onChange={setLifecycle}
                variant="pills"
            />

            {/* Filter bar (Species & Condition) */}
            <div className="flex items-center gap-2 flex-wrap">
                <FilterDropdown
                    label="Species"
                    value={speciesId}
                    options={speciesList
                        .filter((s) => s.code !== 'OTHER')
                        .map((s) => ({ value: s.id, label: s.name }))}
                    onChange={setSpeciesId}
                />
                <FilterDropdown
                    label="Condition"
                    value={condition}
                    options={CONDITION_OPTIONS}
                    onChange={setCondition}
                />

                {activeFilterCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-gray-500 hover:text-gray-900 ml-auto"
                    >
                        Clear all ({activeFilterCount})
                    </button>
                )}
            </div>

            {/* Active filter pills */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5">
                    {selectedSpecies && (
                        <ActiveFilterPill
                            label={selectedSpecies.name}
                            onRemove={() => setSpeciesId(null)}
                        />
                    )}
                    {lifecycle && (
                        <ActiveFilterPill
                            label={LIFECYCLE_STATUS_LABELS[lifecycle]}
                            onRemove={() => setLifecycle(null)}
                        />
                    )}
                    {selectedCondition && (
                        <ActiveFilterPill
                            label={selectedCondition.label}
                            onRemove={() => setCondition(null)}
                        />
                    )}
                    {search && (
                        <ActiveFilterPill
                            label={`"${search}"`}
                            onRemove={() => setSearchInput('')}
                        />
                    )}
                </div>
            )}

            {/* Refreshing */}
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
                <ErrorState onRetry={() => refetch()} />
            ) : animals.length === 0 ? (
                <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 fade-in">
                    {animals.map((animal) => (
                        <AnimalCard key={animal.id} animal={animal} />
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

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
            <p className="text-red-800 font-semibold">Couldn't load animals</p>
            <button
                onClick={onRetry}
                className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
            >
                <RefreshCw size={16} /> Try again
            </button>
        </div>
    );
}