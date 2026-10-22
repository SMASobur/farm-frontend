import { Link } from 'react-router-dom';
import type { Animal } from '@/types';
import {
    LIFECYCLE_STATUS_LABELS,
    LIFECYCLE_STATUS_COLORS,
    GENDER_LABELS,
    getSpeciesEmoji,
} from '@/types';

export function AnimalCard({ animal }: { animal: Animal }) {
    const derivedBadges = [
        animal.currentlyPregnant && { label: 'Pregnant', emoji: '🤰', color: 'bg-pink-100 text-pink-700' },
        animal.currentlySick && { label: 'Sick', emoji: '💊', color: 'bg-amber-100 text-amber-700' },
        animal.currentlyMilking && { label: 'Milking', emoji: '🥛', color: 'bg-blue-100 text-blue-700' },
    ].filter(Boolean) as { label: string; emoji: string; color: string }[];

    // Only females can produce milk/eggs
    const isFemale = animal.gender === 'FEMALE';

    return (
        <Link
            to={`/animals/${animal.id}`}
            className="block bg-white border border-gray-100 rounded-2xl p-4 hover:border-green-300 hover:shadow-sm transition"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-2xl shrink-0" aria-hidden>
                        {getSpeciesEmoji(animal.speciesCode)}
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">
                            {animal.tagNumber}
                        </div>
                        {animal.name && (
                            <div className="text-sm text-gray-500 truncate">
                                {animal.name}
                            </div>
                        )}
                    </div>
                </div>
                <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        LIFECYCLE_STATUS_COLORS[animal.lifecycleStatus]
                    }`}
                >
                    {LIFECYCLE_STATUS_LABELS[animal.lifecycleStatus]}
                </span>
            </div>

            {/* Species + gender + milk/egg producer */}
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                <span>{animal.speciesName}</span>
                {animal.gender && (
                    <>
                        <span className="text-gray-300">·</span>
                        <span>{GENDER_LABELS[animal.gender]}</span>
                    </>
                )}
                {animal.milkProducer && isFemale && (
                    <>
                        <span className="text-gray-300">·</span>
                        <span className="inline-flex items-center gap-1 text-blue-600">
                            🥛 Milk
                        </span>
                    </>
                )}
                {animal.eggProducer && isFemale && (
                    <>
                        <span className="text-gray-300">·</span>
                        <span className="inline-flex items-center gap-1 text-blue-600">
                            🥚 Egg
                        </span>
                    </>
                )}
            </div>

            {/* Derived condition badges */}
            {derivedBadges.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {derivedBadges.map((b) => (
                        <span
                            key={b.label}
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${b.color}`}
                        >
                            <span aria-hidden>{b.emoji}</span>
                            {b.label}
                        </span>
                    ))}
                </div>
            )}
        </Link>
    );
}