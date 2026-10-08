import type { Category } from '@/types';

export type DateRangePreset = 'today' | 'week' | 'month' | 'all' | 'custom';

interface Props {
    preset: DateRangePreset;
    from: string;
    to: string;
    categoryId: number | null;
    categories: Category[];
    onPresetChange: (preset: DateRangePreset) => void;
    onFromChange: (date: string) => void;
    onToChange: (date: string) => void;
    onCategoryChange: (id: number | null) => void;
}

const PRESETS: { value: DateRangePreset; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
    { value: 'custom', label: 'Custom' },
];

export function ExpenseFilters({
                                   preset, from, to, categoryId, categories,
                                   onPresetChange, onFromChange, onToChange, onCategoryChange,
                               }: Props) {
    return (
        <div className="space-y-3">
            {/* Period chips */}
            <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Period
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
                    {PRESETS.map((p) => (
                        <button
                            key={p.value}
                            type="button"
                            onClick={() => onPresetChange(p.value)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                                preset === p.value
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {preset === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">From</label>
                        <input
                            type="date"
                            value={from}
                            onChange={(e) => onFromChange(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">To</label>
                        <input
                            type="date"
                            value={to}
                            onChange={(e) => onToChange(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                    </div>
                </div>
            )}

            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Category
                </label>
                <select
                    value={categoryId ?? ''}
                    onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}