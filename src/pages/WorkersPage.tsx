import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, AlertCircle, RefreshCw, Users } from 'lucide-react';
import { listWorkers } from '@/api/workers';
import type { Worker, WorkerStatus } from '@/types';
import { WORKER_STATUS_LABELS } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyPress } from '@/hooks/useKeyPress';
import { WorkerCard } from '@/components/workers/WorkerCard';
import { WorkersSkeleton } from '@/components/workers/WorkersSkeleton';

const STATUS_OPTIONS: WorkerStatus[] = ['ACTIVE', 'ON_LEAVE', 'INACTIVE', 'TERMINATED'];

export function WorkersPage() {
    const [status, setStatus] = useState<WorkerStatus | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const search = useDebounce(searchInput, 300);
    const searchRef = useRef<HTMLInputElement>(null);

    useKeyPress(
        '/',
        (e) => { e.preventDefault(); searchRef.current?.focus(); },
        { ignoreInputs: true }
    );

    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['workers', status, search],
        queryFn: () => listWorkers({
            status: status || undefined,
            search: search || undefined,
        }),
    });

    const workers: Worker[] = data?.data ?? [];
    const hasActiveFilters = status !== null || search !== '';

    const clearFilters = () => {
        setStatus(null);
        setSearchInput('');
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Workers</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isLoading ? 'Loading…' : `${workers.length} total`}
                    </p>
                </div>
                <Link
                    to="/workers/new"
                    className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add Worker</span>
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

            <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Status
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
                    <FilterChip label="All" active={status === null} onClick={() => setStatus(null)} />
                    {STATUS_OPTIONS.map((s) => (
                        <FilterChip
                            key={s}
                            label={WORKER_STATUS_LABELS[s]}
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
                <WorkersSkeleton />
            ) : isError ? (
                <ErrorState onRetry={() => refetch()} />
            ) : workers.length === 0 ? (
                <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 fade-in">
                    {workers.map((w) => (
                        <WorkerCard key={w.id} worker={w} />
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
                <p className="text-gray-700 font-medium">No matching workers</p>
                <button onClick={onClear} className="mt-4 text-sm text-green-600 hover:underline">
                    Clear all filters
                </button>
            </div>
        );
    }
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
            <Users className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-700 font-medium text-lg">No workers yet</p>
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                Add your farm workers to track salaries, roles, and contact info.
            </p>
            <Link to="/workers/new" className="inline-flex items-center gap-1.5 mt-5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition">
                <Plus size={18} />
                Add Your First Worker
            </Link>
        </div>
    );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
            <p className="text-red-800 font-semibold">Couldn't load workers</p>
            <button onClick={onRetry} className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2">
                <RefreshCw size={16} /> Try again
            </button>
        </div>
    );
}