import type { CustomerType } from '@/types';
import { CUSTOMER_TYPE_LABELS } from '@/types';

interface Props {
    selectedType: CustomerType | null;
    onTypeChange: (type: CustomerType | null) => void;
}

const TYPE_OPTIONS: CustomerType[] = [
    'HOUSEHOLD', 'SHOP', 'TEA_STALL', 'RESTAURANT', 'WHOLESALER', 'OTHER'
];

export function CustomerFilters({ selectedType, onTypeChange }: Props) {
    return (
        <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Type
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
                <Chip label="All" active={selectedType === null} onClick={() => onTypeChange(null)} />
                {TYPE_OPTIONS.map((t) => (
                    <Chip
                        key={t}
                        label={CUSTOMER_TYPE_LABELS[t]}
                        active={selectedType === t}
                        onClick={() => onTypeChange(selectedType === t ? null : t)}
                    />
                ))}
            </div>
        </div>
    );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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