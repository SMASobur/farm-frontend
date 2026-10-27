import { useState, type FormEvent, useEffect } from 'react';
import { X, Loader2, Save, Trash2, History, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recordPoolUsage, getPoolUsageHistory, deletePoolUsage } from '@/api/pools';
import { useToast } from '@/contexts/ToastContext';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import type { PoolStatus, PoolUsageRequest } from '@/types';
import { formatNumber } from '@/lib/format';

interface Props {
    pool: PoolStatus;
    onClose: () => void;
}

function formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
}

export function PoolUsageModal({ pool, onClose }: Props) {
    const queryClient = useQueryClient();
    const toast = useToast();

    // State for the selected date (defaults to the pool's date)
    const [currentDate, setCurrentDate] = useState(pool.date);

    // Empty inputs for accumulating new usage
    const [internalUse, setInternalUse] = useState('');
    const [fedToAnimals, setFedToAnimals] = useState('');
    const [wasted, setWasted] = useState('');
    const [donated, setDonated] = useState('');
    const [error, setError] = useState('');

    // State for delete confirmation
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    const isMilk = pool.poolProductType === 'MILK';
    const unit = isMilk ? 'L' : 'pcs';

    // Format the current date for display
    const displayDate = new Date(currentDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    // Is the user looking at today?
    const isToday = currentDate === formatDateForApi(new Date());

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // Fetch usage history for the selected date
    const historyQuery = useQuery({
        queryKey: ['pools', currentDate, pool.poolSpeciesId, pool.poolProductType, 'history'],
        queryFn: () => getPoolUsageHistory(pool.poolSpeciesId, pool.poolProductType, currentDate),
    });

    const history = historyQuery.data?.data ?? [];

    // Mutation: Add new usage (locks to the selected date)
    const addMutation = useMutation({
        mutationFn: (data: PoolUsageRequest) => recordPoolUsage(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pools'] });
            queryClient.invalidateQueries({ queryKey: ['pools', currentDate, pool.poolSpeciesId, pool.poolProductType, 'history'] });
            toast.success('Usage added');
            setInternalUse('');
            setFedToAnimals('');
            setWasted('');
            setDonated('');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to record usage');
        },
    });

    // Mutation: Delete usage
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deletePoolUsage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pools'] });
            queryClient.invalidateQueries({ queryKey: ['pools', currentDate, pool.poolSpeciesId, pool.poolProductType, 'history'] });
            toast.success('Usage record deleted');
            setConfirmDeleteId(null);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete record');
            setConfirmDeleteId(null);
        },
    });

    // --- Date Navigation Helpers ---
    const handlePrevDay = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 1);
        setCurrentDate(formatDateForApi(d));
    };

    const handleNextDay = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 1);
        const nextDate = formatDateForApi(d);
        // Don't allow going into the future
        if (nextDate <= formatDateForApi(new Date())) {
            setCurrentDate(nextDate);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        const internal = parseFloat(internalUse) || 0;
        const fed = parseFloat(fedToAnimals) || 0;
        const waste = parseFloat(wasted) || 0;
        const donate = parseFloat(donated) || 0;

        const totalNewUsage = internal + fed + waste + donate;
        if (totalNewUsage <= 0) {
            setError('Please enter a value for at least one field.');
            return;
        }

        // Only enforce "available" limit if adding for the pool's current date.
        // If backdating, the backend will validate against that date's stock.
        if (currentDate === pool.date && totalNewUsage > pool.available) {
            setError(`Total new usage (${totalNewUsage}) cannot exceed available (${pool.available})`);
            return;
        }

        await addMutation.mutateAsync({
            poolSpeciesId: pool.poolSpeciesId,
            poolProductType: pool.poolProductType,
            date: currentDate,
            internalUse: internal,
            fedToAnimals: fed,
            wasted: waste,
            donated: donate,
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="font-bold text-gray-900">Record Usage</h2>
                        <p className="text-xs text-gray-500">{pool.poolProductTypeLabel}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><X size={18} /></button>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto p-4 space-y-6">
                    {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">{error}</div>}

                    <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg border border-blue-100 flex items-center justify-between">
                        <span>Available to use</span>
                        {/* If backdating, we don't have the exact "available" stock at that moment in the pool object, so we show a dash */}
                        <span className="font-bold">{currentDate === pool.date ? `${pool.available} ${unit}` : '—'}</span>
                    </div>

                    {/* ADD FORM */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Internal Use" htmlFor="internalUse" help="Home / family">
                                <Input id="internalUse" type="number" step={isMilk ? "0.1" : "1"} min="0" value={internalUse} onChange={(e) => setInternalUse(e.target.value)} placeholder="0" />
                            </Field>
                            <Field label="Fed to Animals" htmlFor="fedToAnimals" help="Calves, dogs">
                                <Input id="fedToAnimals" type="number" step={isMilk ? "0.1" : "1"} min="0" value={fedToAnimals} onChange={(e) => setFedToAnimals(e.target.value)} placeholder="0" />
                            </Field>
                            <Field label="Wasted" htmlFor="wasted" help="Spoiled / spilled">
                                <Input id="wasted" type="number" step={isMilk ? "0.1" : "1"} min="0" value={wasted} onChange={(e) => setWasted(e.target.value)} placeholder="0" />
                            </Field>
                            <Field label="Donated" htmlFor="donated" help="Given to others">
                                <Input id="donated" type="number" step={isMilk ? "0.1" : "1"} min="0" value={donated} onChange={(e) => setDonated(e.target.value)} placeholder="0" />
                            </Field>
                        </div>
                        <button type="submit" disabled={addMutation.isPending} className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 inline-flex items-center justify-center gap-2">
                            {addMutation.isPending ? <><Loader2 size={18} className="animate-spin" />Saving…</> : <><Save size={18} />Add Usage</>}
                        </button>
                    </form>

                    {/* HISTORY LIST WITH DATE NAVIGATION */}
                    <div className="pt-4 border-t border-gray-100">

                        {/* Date Navigation Bar */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <History size={16} className="text-gray-400" />
                                <h3 className="text-sm font-semibold text-gray-700">{displayDate}</h3>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={handlePrevDay}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-600 transition"
                                    title="Previous day"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextDay}
                                    disabled={isToday}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Next day"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        {historyQuery.isLoading ? (
                            <div className="text-center py-4 text-sm text-gray-400">Loading history...</div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 rounded-lg">No usage recorded on this date.</div>
                        ) : (
                            <div className="space-y-2">
                                {history.map((record) => {
                                    const isConfirming = confirmDeleteId === record.id;
                                    return (
                                        <div
                                            key={record.id}
                                            className={`flex items-center justify-between p-3 rounded-lg text-sm transition ${
                                                isConfirming ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-100'
                                            }`}
                                        >
                                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-gray-600">
                                                {record.internalUse > 0 && <span>Internal: <b>{formatNumber(record.internalUse, isMilk ? 1 : 0)}</b></span>}
                                                {record.fedToAnimals > 0 && <span>Fed: <b>{formatNumber(record.fedToAnimals, isMilk ? 1 : 0)}</b></span>}
                                                {record.wasted > 0 && <span>Wasted: <b>{formatNumber(record.wasted, isMilk ? 1 : 0)}</b></span>}
                                                {record.donated > 0 && <span>Donated: <b>{formatNumber(record.donated, isMilk ? 1 : 0)}</b></span>}
                                                {record.enteredByName && (
                                                    <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                                                        <span>Added by {record.enteredByName}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {isConfirming ? (
                                                <div className="flex items-center gap-2 ml-4 shrink-0">
                    <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle size={12} /> Sure?
                    </span>
                                                    <button
                                                        onClick={() => deleteMutation.mutate(record.id)}
                                                        disabled={deleteMutation.isPending}
                                                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 font-medium disabled:opacity-50"
                                                    >
                                                        {deleteMutation.isPending ? 'Wait...' : 'Delete'}
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDeleteId(null)}
                                                        disabled={deleteMutation.isPending}
                                                        className="text-xs text-gray-600 px-2 py-1 rounded hover:bg-gray-200 font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmDeleteId(record.id)}
                                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition ml-4 shrink-0"
                                                    title="Delete this record"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}