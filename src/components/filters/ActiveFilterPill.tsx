import { X } from 'lucide-react';

export function ActiveFilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 bg-gray-100 border border-gray-200 rounded-full text-xs font-medium text-gray-700">
            {label}
            <button
                type="button"
                onClick={onRemove}
                className="p-0.5 rounded-full hover:bg-gray-200 text-gray-500"
                aria-label={`Remove ${label} filter`}
            >
                <X size={12} />
            </button>
        </span>
    );
}