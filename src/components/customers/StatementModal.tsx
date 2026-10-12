import { useState, type FormEvent, useEffect } from 'react';
import { X, Loader2, Download } from 'lucide-react';
import { downloadCustomerStatement } from '@/api/customers';
import { useToast } from '@/contexts/ToastContext';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';

interface Props {
    customerId: number;
    customerName: string;
    onClose: () => void;
}

// Quick preset date ranges
type Preset = 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';

function firstOfMonth(d: Date): string {
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
}

function lastOfMonth(d: Date): string {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
}

function computeRange(preset: Preset, customFrom: string, customTo: string) {
    const now = new Date();
    switch (preset) {
        case 'thisMonth': return { from: firstOfMonth(now), to: lastOfMonth(now) };
        case 'lastMonth': {
            const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return { from: firstOfMonth(prev), to: lastOfMonth(prev) };
        }
        case 'thisYear':
            return { from: `${now.getFullYear()}-01-01`, to: `${now.getFullYear()}-12-31` };
        case 'custom':
            return { from: customFrom, to: customTo };
    }
}

export function StatementModal({ customerId, customerName, onClose }: Props) {
    const toast = useToast();

    const [preset, setPreset] = useState<Preset>('thisMonth');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const range = computeRange(preset, customFrom, customTo);
    const isValidRange = !!range.from && !!range.to && range.from <= range.to;

    const handleDownload = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!isValidRange) {
            setError('Invalid date range');
            return;
        }

        setLoading(true);
        try {
            await downloadCustomerStatement(customerId, range.from!, range.to!);
            toast.success('Statement downloaded');
            onClose();
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to generate statement';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Download Statement</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleDownload} className="p-4 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <div className="text-xs text-blue-700">
                            Statement for <span className="font-semibold">{customerName}</span>
                        </div>
                    </div>

                    {/* Preset chips */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Period
                        </label>
                        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
                            {([
                                { value: 'thisMonth' as const, label: 'This Month' },
                                { value: 'lastMonth' as const, label: 'Last Month' },
                                { value: 'thisYear' as const, label: 'This Year' },
                                { value: 'custom' as const, label: 'Custom' },
                            ]).map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setPreset(p.value)}
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
                            <Field label="From" htmlFor="from" required>
                                <Input
                                    id="from"
                                    type="date"
                                    value={customFrom}
                                    onChange={(e) => setCustomFrom(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </Field>
                            <Field label="To" htmlFor="to" required>
                                <Input
                                    id="to"
                                    type="date"
                                    value={customTo}
                                    onChange={(e) => setCustomTo(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </Field>
                        </div>
                    )}

                    {/* Preview range */}
                    {isValidRange && (
                        <div className="text-xs text-gray-500 text-center">
                            {range.from} → {range.to}
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading || !isValidRange}
                            className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition inline-flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin" />Generating…</>
                            ) : (
                                <><Download size={18} />Download PDF</>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}