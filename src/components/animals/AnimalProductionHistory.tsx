import { useQuery } from '@tanstack/react-query';
import { Milk, Egg } from 'lucide-react';
import { listMilkByAnimal } from '@/api/milk';
import { listEggsByAnimal } from '@/api/eggs';
import { formatDateShort, formatNumber } from '@/lib/format';
import type { Animal, MilkProduction, EggProduction } from '@/types';

interface Props {
    animal: Animal;
}

export function AnimalProductionHistory({ animal }: Props) {
    const isMilkProducer = animal.milkProducer;
    const isEggLayer = animal.speciesCode === 'CHICKEN'
        || animal.speciesCode === 'DUCK'
        || animal.speciesCode === 'GOOSE';

    if (!isMilkProducer && !isEggLayer) {
        return (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Production History
                </h2>
                <p className="text-sm text-gray-500 text-center py-6">
                    No production records for this species.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {isMilkProducer && <MilkHistory animalId={animal.id} />}
            {isEggLayer && <EggHistory animalId={animal.id} />}
        </div>
    );
}

// ============================================================
// Milk
// ============================================================

function MilkHistory({ animalId }: { animalId: number }) {
    const { data, isLoading } = useQuery({
        queryKey: ['animal', animalId, 'milk'],
        queryFn: () => listMilkByAnimal(animalId),
    });

    const entries: MilkProduction[] = (data?.data ?? [])
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 20);

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Milk size={14} className="text-blue-500" />
                    Milk Production
                </h2>
                <span className="text-xs text-gray-400">
                    {isLoading ? '…' : `${entries.length} record${entries.length === 1 ? '' : 's'}`}
                </span>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 shimmer rounded"></div>
                    ))}
                </div>
            ) : entries.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">
                    No milk production recorded yet.
                </p>
            ) : (
                <div className="space-y-1.5">
                    {entries.map((m) => (
                        <div
                            key={m.id}
                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition"
                        >
                            <div className="text-sm text-gray-500">
                                {formatDateShort(m.date)}
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                                {formatNumber(m.totalLiters, 1)} L
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================
// Eggs
// ============================================================

function EggHistory({ animalId }: { animalId: number }) {
    const { data, isLoading } = useQuery({
        queryKey: ['animal', animalId, 'eggs'],
        queryFn: () => listEggsByAnimal(animalId),
    });

    const entries: EggProduction[] = (data?.data ?? [])
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 20);

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Egg size={14} className="text-amber-500" />
                    Egg Production
                </h2>
                <span className="text-xs text-gray-400">
                    {isLoading ? '…' : `${entries.length} record${entries.length === 1 ? '' : 's'}`}
                </span>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 shimmer rounded"></div>
                    ))}
                </div>
            ) : entries.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">
                    No egg production recorded yet.
                </p>
            ) : (
                <div className="space-y-1.5">
                    {entries.map((e) => (
                        <div
                            key={e.id}
                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition"
                        >
                            <div className="text-sm text-gray-500">
                                {formatDateShort(e.date)}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500">
                                    {e.goodEggs} good
                                </span>
                                {e.crackedEggs > 0 && (
                                    <span className="text-xs text-amber-600">
                                        {e.crackedEggs} cracked
                                    </span>
                                )}
                                <span className="text-sm font-semibold text-gray-900">
                                    {e.totalEggs} total
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}