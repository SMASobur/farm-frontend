import { useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';

export interface FilterOption<T> {
    value: T;
    label: string;
}

interface FilterDropdownProps<T extends string | number> {
    label: string;
    value: T | null;
    options: FilterOption<T>[];
    onChange: (value: T | null) => void;
    variant?: 'dropdown' | 'pills';
}

export function FilterDropdown<T extends string | number>({
                                                              label,
                                                              value,
                                                              options,
                                                              onChange,
                                                              variant = 'dropdown',
                                                          }: FilterDropdownProps<T>) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useClickOutside(ref, () => setOpen(false));

    // ==========================================
    // PILLS VARIANT (For small fixed lists)
    // ==========================================
    if (variant === 'pills') {
        return (
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
                    {label}
                </span>
                <button
                    onClick={() => onChange(null)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        value === null
                            ? 'bg-green-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                >
                    All
                </button>
                {options.map((o) => (
                    <button
                        key={String(o.value)}
                        onClick={() => onChange(value === o.value ? null : o.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                            value === o.value
                                ? 'bg-green-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        {o.label}
                    </button>
                ))}
            </div>
        );
    }

    // ==========================================
    // DROPDOWN VARIANT (Default)
    // ==========================================
    const selected = options.find((o) => o.value === value);
    const isActive = value !== null;

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition ${
                    isActive
                        ? 'bg-green-50 border-green-300 text-green-800'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
            >
                <span className="text-gray-500 font-normal">{label}:</span>
                <span>{selected?.label ?? 'All'}</span>
                {isActive ? (
                    <X
                        size={14}
                        className="ml-0.5 hover:text-green-900"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(null);
                        }}
                    />
                ) : (
                    <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
                )}
            </button>

            {open && (
                <>
                    {/* Mobile: bottom sheet */}
                    <div
                        className="sm:hidden fixed inset-0 z-40 bg-black/30"
                        onClick={() => setOpen(false)}
                    />
                    <div
                        className="
                            sm:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl p-4 pb-6
                            max-h-[70vh] overflow-y-auto shadow-xl
                        "
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-gray-900">{label}</span>
                            <button onClick={() => setOpen(false)} className="p-1 text-gray-500">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <OptionChip
                                active={value === null}
                                label="All"
                                onClick={() => { onChange(null); setOpen(false); }}
                            />
                            {options.map((o) => (
                                <OptionChip
                                    key={String(o.value)}
                                    active={value === o.value}
                                    label={o.label}
                                    onClick={() => { onChange(o.value); setOpen(false); }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Desktop: popover */}
                    <div className="
                        hidden sm:block absolute left-0 top-full mt-1 z-30
                        min-w-[220px] max-h-80 overflow-y-auto
                        bg-white border border-gray-200 rounded-lg shadow-lg p-2
                    ">
                        <button
                            onClick={() => { onChange(null); setOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 ${
                                value === null ? 'text-green-700 font-medium' : 'text-gray-700'
                            }`}
                        >
                            All
                        </button>
                        {options.map((o) => (
                            <button
                                key={String(o.value)}
                                onClick={() => { onChange(o.value); setOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 ${
                                    value === o.value ? 'text-green-700 font-medium bg-green-50' : 'text-gray-700'
                                }`}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function OptionChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                active
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
            {label}
        </button>
    );
}