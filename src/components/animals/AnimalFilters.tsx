import type { Species, AnimalStatus } from '@/types';
import { SPECIES_LABELS, STATUS_LABELS } from '@/types';

interface Props {
    selectedSpecies: Species | null;
    selectedStatus: AnimalStatus | null;
    onSpeciesChange: (species: Species | null) => void;
    onStatusChange: (status: AnimalStatus | null) => void;
}

const SPECIES_OPTIONS: Species[] = ['COW', 'GOAT', 'SHEEP', 'CHICKEN', 'DUCK', 'BUFFALO', 'OTHER'];
const STATUS_OPTIONS: AnimalStatus[] = ['ACTIVE', 'PREGNANT', 'DRY', 'SICK', 'SOLD', 'DEAD'];

export function AnimalFilters({
                                  selectedSpecies,
                                  selectedStatus,
                                  onSpeciesChange,
                                  onStatusChange,
                              }: Props) {
    return (
        <div className="space-y-3">
            {/* Species filter */}
            <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Species
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
                    <FilterChip
                        label="All"
                        active={selectedSpecies === null}
                        onClick={() => onSpeciesChange(null)}
                    />
                    {SPECIES_OPTIONS.map((s) => (
                        <FilterChip
                            key={s}
                            label={SPECIES_LABELS[s]}
                            active={selectedSpecies === s}
                            onClick={() => onSpeciesChange(selectedSpecies === s ? null : s)}
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
                    <FilterChip
                        label="All"
                        active={selectedStatus === null}
                        onClick={() => onStatusChange(null)}
                    />
                    {STATUS_OPTIONS.map((s) => (
                        <FilterChip
                            key={s}
                            label={STATUS_LABELS[s]}
                            active={selectedStatus === s}
                            onClick={() => onStatusChange(selectedStatus === s ? null : s)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function FilterChip({
                        label,
                        active,
                        onClick,
                    }: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                active
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
        >
            {label}
        </button>
    );
}