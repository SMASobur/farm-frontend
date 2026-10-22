import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Droplets, Egg, AlertCircle, RefreshCw, Settings2 } from 'lucide-react';
import { getPoolsStatus } from '@/api/pools';
import type { PoolStatus } from '@/types';
import { formatNumber } from '@/lib/format';
import { PoolUsageModal } from '@/components/pools/PoolUsageModal';

function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}

export function PoolsPage() {
    const [date, setDate] = useState(todayISO());
    const [selectedPool, setSelectedPool] = useState<PoolStatus | null>(null);

    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['pools', date],
        queryFn: () => getPoolsStatus(date),
    });

    const pools: PoolStatus[] = data?.data ?? [];

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Daily Pools</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track inventory, usage, and availability
                    </p>
                </div>
                <div>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        max={todayISO()}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
                    />
                </div>
            </div>

            {isFetching && !isLoading && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-blue-800">
                    <RefreshCw size={12} className="animate-spin shrink-0" />
                    <span>Refreshing…</span>
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-48 shimmer rounded-2xl"></div>
                    ))}
                </div>
            ) : isError ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Couldn't load pools</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
                    >
                        <RefreshCw size={16} /> Try again
                    </button>
                </div>
            ) : pools.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                    <Droplets className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-700 font-medium text-lg">No pool activity today</p>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                        Once you record milk or eggs, they will appear here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pools.map((pool) => (
                        <PoolCard
                            key={`${pool.poolSpeciesId}-${pool.poolProductType}`}
                            pool={pool}
                            onRecordUsage={() => setSelectedPool(pool)}
                        />
                    ))}
                </div>
            )}

            {selectedPool && (
                <PoolUsageModal
                    pool={selectedPool}
                    onClose={() => setSelectedPool(null)}
                />
            )}
        </div>
    );
}

function PoolCard({ pool, onRecordUsage }: { pool: PoolStatus; onRecordUsage: () => void }) {
    const isMilk = pool.poolProductType === 'MILK';
    const unit = isMilk ? 'L' : 'pcs';

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isMilk ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                        {isMilk ? <Droplets size={20} /> : <Egg size={20} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{pool.poolProductTypeLabel}</h3>
                        <p className="text-xs text-gray-500">{pool.date}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-500">Available</div>
                    <div className="text-xl font-bold text-green-600">
                        {formatNumber(pool.available, isMilk ? 1 : 0)} {unit}
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 py-4 border-t border-b border-gray-100 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">Produced</span>
                    <span className="font-medium text-gray-900">{formatNumber(pool.produced, isMilk ? 1 : 0)} {unit}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Sold</span>

                    <span className="font-medium text-blue-700">
                        {pool.sold > 0 ? formatNumber(pool.sold, isMilk ? 1 : 0) : '0'} {unit}
                    </span>

                </div>
                {(pool.internalUse > 0 || pool.fedToAnimals > 0 || pool.wasted > 0) && (
                    <div className="pt-2 mt-2 border-t border-dashed border-gray-200">
                        <div className="text-xs text-gray-400 mb-1">Usage</div>
                        <div className="flex justify-between text-xs text-amber-700">
                            <span>Internal use / Fed / Wasted</span>
                            <span className="font-medium">
                                {formatNumber(pool.internalUse, isMilk ? 1 : 0)} / {formatNumber(pool.fedToAnimals, isMilk ? 1 : 0)} / {formatNumber(pool.wasted, isMilk ? 1 : 0)} {unit}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Action */}
            <div className="mt-4">
                <button
                    onClick={onRecordUsage}
                    className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-lg transition"
                >
                    <Settings2 size={16} />
                    Record Usage
                </button>
            </div>
        </div>
    );
}