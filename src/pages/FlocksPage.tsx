import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Bird, AlertCircle, RefreshCw } from 'lucide-react';
import { listFlocks } from '@/api/flocks';
import { FlockCard } from '@/components/flocks/FlockCard';
import type { Flock, FlockStatus } from '@/types';
import { FLOCK_STATUS_LABELS } from '@/types';

const STATUS_OPTIONS: FlockStatus[] = ['ACTIVE', 'RETIRED', 'SOLD', 'DISEASED'];

export function FlocksPage() {
    const [status, setStatus] = useState<FlockStatus | null>(null);

    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['flocks', status],
        queryFn: () => listFlocks({ status: status || undefined }),
    });

    const flocks: Flock[] = data?.data ?? [];
    const totalBirds = flocks.reduce((sum, f) => sum + f.birdCount, 0);

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isLoading
                            ? 'Loading…'
                            : `${flocks.length} batch${flocks.length === 1 ? '' : 'es'} · ${totalBirds} birds`}
                    </p>
                </div>
                <Link
                    to="/flocks/new"
                    className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add Batch</span>
                    <span className="sm:hidden">Add</span>
                </Link>
            </div>

            {/* Status filter chips */}
            <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Status
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
                    <button
                        onClick={() => setStatus(null)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                            status === null
                                ? 'bg-green-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        All
                    </button>
                    {STATUS_OPTIONS.map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatus(status === s ? null : s)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                                status === s
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {FLOCK_STATUS_LABELS[s]}
                        </button>
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
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4">
                            <div className="h-16 shimmer rounded"></div>
                        </div>
                    ))}
                </div>
            ) : isError ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Couldn't load batches</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
                    >
                        <RefreshCw size={16} /> Try again
                    </button>
                </div>
            ) : flocks.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                    <Bird className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-700 font-medium text-lg">No batches yet</p>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                        Group your birds into batches for easier daily tracking — especially
                        useful when you have 20+ birds.
                    </p>
                    <Link
                        to="/flocks/new"
                        className="inline-flex items-center gap-1.5 mt-5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        <Plus size={18} />
                        Create First Batch
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 fade-in">
                    {flocks.map((f) => (
                        <FlockCard key={f.id} flock={f} />
                    ))}
                </div>
            )}
        </div>
    );
}