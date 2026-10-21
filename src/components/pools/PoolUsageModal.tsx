import { useState, type FormEvent, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordPoolUsage } from '@/api/pools';
import { useToast } from '@/contexts/ToastContext';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import type { PoolStatus, PoolUsageRequest } from '@/types';

interface Props {
    pool: PoolStatus;
    onClose: () => void;
}

export function PoolUsageModal({ pool, onClose }: Props) {
    const queryClient = useQueryClient();
    const toast = useToast();

    // Default to 0 if no usage exists. In a real app, you'd fetch existing usage if it exists.
    const [internalUse, setInternalUse] = useState('0');
    const [fedToAnimals, setFedToAnimals] = useState('0');
    const [wasted, setWasted] = useState('0');
    const [error, setError] = useState('');

    const isMilk = pool.poolProductType === 'MILK';
    const unit = isMilk ? 'L' : 'pcs';

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const mutation = useMutation({
        mutationFn: (data: PoolUsageRequest) => recordPoolUsage(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pools'] });
            toast.success('Usage recorded');
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to record usage');
        },
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        const internal = parseFloat(internalUse) || 0;
        const fed = parseFloat(fedToAnimals) || 0;
        const waste = parseFloat(wasted) || 0;

        const totalUsage = internal + fed + waste;
        if (totalUsage > pool.available) {
            setError(`Total usage (${totalUsage}) cannot exceed available (${pool.available})`);
            return;
        }

        await mutation.mutateAsync({
            poolSpeciesId: pool.poolSpeciesId,
            poolProductType: pool.poolProductType,
            date: pool.date,
            internalUse: internal,
            fedToAnimals: fed,
            wasted: waste,
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-gray-900">Record Usage</h2>
                        <p className="text-xs text-gray-500">{pool.poolProductTypeLabel}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg border border-blue-100 flex items-center justify-between">
                        <span>Available to use</span>
                        <span className="font-bold">{pool.available} {unit}</span>
                    </div>

                    <Field label="Internal Use" htmlFor="internalUse" help="Kept for home / family">
                        <Input
                            id="internalUse"
                            type="number"
                            step={isMilk ? "0.1" : "1"}
                            min="0"
                            value={internalUse}
                            onChange={(e) => setInternalUse(e.target.value)}
                        />
                    </Field>

                    <Field label="Fed to Animals" htmlFor="fedToAnimals" help="Calves, dogs, etc.">
                        <Input
                            id="fedToAnimals"
                            type="number"
                            step={isMilk ? "0.1" : "1"}
                            min="0"
                            value={fedToAnimals}
                            onChange={(e) => setFedToAnimals(e.target.value)}
                        />
                    </Field>

                    <Field label="Wasted" htmlFor="wasted" help="Spoiled or spilled">
                        <Input
                            id="wasted"
                            type="number"
                            step={isMilk ? "0.1" : "1"}
                            min="0"
                            value={wasted}
                            onChange={(e) => setWasted(e.target.value)}
                        />
                    </Field>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                        >
                            {mutation.isPending ? (
                                <><Loader2 size={18} className="animate-spin" />Saving…</>
                            ) : (
                                <><Save size={18} />Save Usage</>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={mutation.isPending}
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