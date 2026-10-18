import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, ChevronDown, Check } from 'lucide-react';
import type { Animal } from '@/types';
import { getSpeciesEmoji } from '@/types';

interface Props {
    animals: Animal[];
    value: number | null;
    onChange: (id: number | null) => void;
    disabled?: boolean;
    placeholder?: string;
    hasError?: boolean;
}

export function AnimalCombobox({
                                   animals,
                                   value,
                                   onChange,
                                   disabled = false,
                                   placeholder = 'Select animal…',
                                   hasError = false,
                               }: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = useMemo(
        () => animals.find((a) => a.id === value) ?? null,
        [animals, value]
    );

    /**
     * Unique species list derived from the animals array.
     * Sorted alphabetically for predictable chip order.
     */
    const availableSpecies = useMemo(() => {
        const map = new Map<string, { code: string; name: string; count: number }>();
        for (const animal of animals) {
            const existing = map.get(animal.speciesCode);
            if (existing) {
                existing.count++;
            } else {
                map.set(animal.speciesCode, {
                    code: animal.speciesCode,
                    name: animal.speciesName,
                    count: 1,
                });
            }
        }
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [animals]);

    // Filter by species chip + search query
    const filtered = useMemo(() => {
        let list = animals;

        // 1. Species filter
        if (selectedSpecies) {
            list = list.filter((a) => a.speciesCode === selectedSpecies);
        }

        // 2. Search filter
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(
                (a) =>
                    a.tagNumber.toLowerCase().includes(q) ||
                    (a.name ?? '').toLowerCase().includes(q) ||
                    a.speciesName.toLowerCase().includes(q)
            );
        }

        return list;
    }, [animals, selectedSpecies, query]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Focus search when opening; reset filters
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 0);
            setQuery('');
            // Don't reset species — user might want to keep the filter
        }
    }, [open]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) setOpen(false);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [open]);

    const handleSelect = (animal: Animal | null) => {
        onChange(animal ? animal.id : null);
        setOpen(false);
    };

    const displayText = selected
        ? `${selected.tagNumber}${selected.name ? ` · ${selected.name}` : ''}`
        : placeholder;

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => !disabled && setOpen((v) => !v)}
                disabled={disabled}
                className={`w-full px-3 py-2.5 border rounded-lg text-left text-base transition flex items-center justify-between gap-2 ${
                    hasError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                } ${
                    disabled
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500'
                }`}
            >
                <span className={`truncate ${selected ? 'text-gray-900' : 'text-gray-400'}`}>
                    {displayText}
                </span>
                <ChevronDown size={16} className="text-gray-400 shrink-0" />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
                    {/* Search */}
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by tag, name, or species…"
                                className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Species filter chips */}
                    <div className="px-2 py-2 border-b border-gray-100 bg-gray-50">
                        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-2 px-2">
                            <SpeciesChip
                                label="All"
                                count={animals.length}
                                active={selectedSpecies === null}
                                onClick={() => setSelectedSpecies(null)}
                            />
                            {availableSpecies.map((s) => (
                                <SpeciesChip
                                    key={s.code}
                                    label={s.name}
                                    emoji={getSpeciesEmoji(s.code)}
                                    count={s.count}
                                    active={selectedSpecies === s.code}
                                    onClick={() =>
                                        setSelectedSpecies(selectedSpecies === s.code ? null : s.code)
                                    }
                                />
                            ))}
                        </div>
                    </div>

                    {/* Options */}
                    <div className="overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-gray-500">
                                No animals match {selectedSpecies || query ? 'your filters' : 'this search'}
                            </div>
                        ) : (
                            filtered.map((a) => {
                                const isSelected = a.id === value;
                                return (
                                    <button
                                        key={a.id}
                                        type="button"
                                        onClick={() => handleSelect(a)}
                                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 ${
                                            isSelected ? 'bg-green-50' : ''
                                        }`}
                                    >
                                        <span className="text-lg shrink-0" aria-hidden>
                                            {getSpeciesEmoji(a.speciesCode)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                {a.tagNumber}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                                {a.speciesName}
                                                {a.name ? ` · ${a.name}` : ''}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Check size={16} className="text-green-600 shrink-0" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Footer with count */}
                    <div className="border-t border-gray-100 px-3 py-2 text-xs text-gray-400 bg-gray-50">
                        {filtered.length} {filtered.length === 1 ? 'animal' : 'animals'}
                        {selectedSpecies && ` · filtered to ${selectedSpecies.toLowerCase()}`}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================================
// Chip component
// ============================================================

function SpeciesChip({
                         label,
                         emoji,
                         count,
                         active,
                         onClick,
                     }: {
    label: string;
    emoji?: string;
    count: number;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                active
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
        >
            {emoji && <span aria-hidden>{emoji}</span>}
            <span>{label}</span>
            <span className={`text-[10px] ${active ? 'opacity-80' : 'opacity-60'}`}>
                {count}
            </span>
        </button>
    );
}