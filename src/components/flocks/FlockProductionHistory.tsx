import { useQuery } from '@tanstack/react-query';
import { Egg } from 'lucide-react';
import { listEggsByFlock } from '@/api/eggs';
import { formatDateShort } from '@/lib/format';
import type { EggProduction } from '@/types';

interface Props {
    flockId: number;
    limit?: number;
}

export function FlockProductionHistory({ flockId, limit }: Props) {
    const { data, isLoading } = useQuery({
        queryKey: ['flock', flockId, 'eggs'],
        queryFn: () => listEggsByFlock(flockId),
    });

    const allEntries: EggProduction[] = (data?.data ?? [])
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date));

    const entries = limit ? allEntries.slice(0, limit) : allEntries;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Egg size={14} className="text-amber-500" />
                    Egg Production
                </h2>
                <span className="text-xs text-gray-400">
                    {isLoading ? '…' : `${allEntries.length} record${allEntries.length === 1 ? '' : 's'}`}
                </span>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => <div key={i} className="h-12 shimmer rounded" />)}
                </div>
            ) : entries.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">
                    No egg production recorded yet.
                </p>
            ) : (
                <div className="space-y-1.5">
                    {entries.map((e) => (
                        <div key={e.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                            <div className="text-sm text-gray-500">{formatDateShort(e.date)}</div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500">{e.goodEggs} good</span>
                                {e.crackedEggs > 0 && (
                                    <span className="text-xs text-amber-600">{e.crackedEggs} cracked</span>
                                )}
                                <span className="text-sm font-semibold text-gray-900">{e.totalEggs} total</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}