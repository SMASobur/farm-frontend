import { Link } from 'react-router-dom';
import type { Animal } from '@/types';
import { SPECIES_LABELS, SPECIES_EMOJI, STATUS_LABELS, STATUS_COLORS, GENDER_LABELS } from '@/types';
import { Milk } from 'lucide-react';

export function AnimalCard({ animal }: { animal: Animal }) {
    return (
        <Link
            to={`/animals/${animal.id}`}
            className="block bg-white border border-gray-100 rounded-2xl p-4 hover:border-green-300 hover:shadow-sm transition"
        >
            {/* Top row: emoji + tag + status */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-2xl shrink-0" aria-hidden>
            {SPECIES_EMOJI[animal.species]}
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
                        STATUS_COLORS[animal.status]
                    }`}
                >
          {STATUS_LABELS[animal.status]}
        </span>
            </div>

            {/* Bottom row: species + gender + milk indicator */}
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                <span>{SPECIES_LABELS[animal.species]}</span>
                {animal.gender && (
                    <>
                        <span className="text-gray-300">·</span>
                        <span>{GENDER_LABELS[animal.gender]}</span>
                    </>
                )}
                {animal.milkProducer && (
                    <>
                        <span className="text-gray-300">·</span>
                        <span className="inline-flex items-center gap-1 text-blue-600">
              <Milk size={12} />
              Milk
            </span>
                    </>
                )}
            </div>
        </Link>
    );
}