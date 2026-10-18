import { Link } from 'react-router-dom';
import type { Flock } from '@/types';
import { FLOCK_STATUS_LABELS, FLOCK_STATUS_COLORS, getSpeciesEmoji } from '@/types';

export function FlockCard({ flock }: { flock: Flock }) {
    return (
        <Link
            to={`/flocks/${flock.id}`}
            className="block bg-white border border-gray-100 rounded-2xl p-4 hover:border-amber-300 hover:shadow-sm transition"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 text-xl">
                        {getSpeciesEmoji(flock.speciesCode)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">
                            {flock.flockCode}
                        </div>
                        {flock.name && (
                            <div className="text-sm text-gray-500 truncate">
                                {flock.name}
                            </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                            {flock.birdCount} {flock.speciesName.toLowerCase()}
                            {flock.birdCount !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            FLOCK_STATUS_COLORS[flock.status]
                        }`}
                    >
                        {FLOCK_STATUS_LABELS[flock.status]}
                    </span>
                    {flock.startedOn && (
                        <span className="text-xs text-gray-400">
                            Started {new Date(flock.startedOn).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}