import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, ChevronDown, Check } from 'lucide-react';
import type { Customer } from '@/types';

interface Props {
    customers: Customer[];
    value: number | null;
    onChange: (id: number | null) => void;
    disabled?: boolean;
    placeholder?: string;
    hasError?: boolean;
}

export function CustomerCombobox({
                                     customers,
                                     value,
                                     onChange,
                                     disabled = false,
                                     placeholder = 'Select customer…',
                                     hasError = false,
                                 }: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = useMemo(
        () => customers.find((c) => c.id === value) ?? null,
        [customers, value]
    );

    const filtered = useMemo(() => {
        if (!query.trim()) return customers;
        const q = query.toLowerCase();
        return customers.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                (c.phone ?? '').toLowerCase().includes(q)
        );
    }, [customers, query]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 0);
            setQuery('');
        }
    }, [open]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                setOpen(false);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [open]);

    const handleSelect = (customer: Customer | null) => {
        onChange(customer ? customer.id : null);
        setOpen(false);
    };

    const displayText = selected
        ? `${selected.name}${selected.phone ? ` (${selected.phone})` : ''}`
        : placeholder;

    return (
        <div ref={containerRef} className="relative">
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

            {open && (
                <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by name or phone…"
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

                    <div className="overflow-y-auto">
                        {selected && (
                            <button
                                type="button"
                                onClick={() => handleSelect(null)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 border-b border-gray-100"
                            >
                                Clear selection
                            </button>
                        )}

                        {filtered.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-gray-500">
                                No customers found
                            </div>
                        ) : (
                            filtered.map((c) => {
                                const isSelected = c.id === value;
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => handleSelect(c)}
                                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 ${
                                            isSelected ? 'bg-green-50' : ''
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                {c.name}
                                            </div>
                                            {c.phone && (
                                                <div className="text-xs text-gray-500 truncate">
                                                    {c.phone}
                                                </div>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <Check size={16} className="text-green-600 shrink-0" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}