import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, Save } from 'lucide-react';
import { createFlockEvent } from '@/api/animalEvents';
import { useToast } from '@/contexts/ToastContext';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import type { AnimalEventType } from '@/types';
import { ANIMAL_EVENT_LABELS } from '@/types';

const FLOCK_EVENT_TYPES: AnimalEventType[] = [
    'MORTALITY', 'PURCHASE', 'ILLNESS', 'TREATMENT', 'VACCINATION',
    'DEWORMING', 'FEED_CHANGE', 'EGG_DROP', 'WEIGHT', 'TRANSFER', 'NOTE', 'OTHER',
];

function todayISO() {
    return new Date().toISOString().split('T')[0];
}

interface Props {
    flockId: number;
    flockCode: string;
    birdCount: number;
    onClose: () => void;
}

export function FlockEventModal({ flockId, flockCode, birdCount, onClose }: Props) {
    const queryClient = useQueryClient();
    const toast = useToast();

    const [eventType, setEventType] = useState<AnimalEventType>('MORTALITY');
    const [birdCountChange, setBirdCountChange] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');
    const [date, setDate] = useState(todayISO());
    const [error, setError] = useState('');

    const mutation = useMutation({
        mutationFn: (data: any) => createFlockEvent(flockId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flock', flockId] });
            queryClient.invalidateQueries({ queryKey: ['flock', flockId, 'events'] });
            queryClient.invalidateQueries({ queryKey: ['flocks'] });
            toast.success('Event recorded');
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to record event');
        },
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        const change = parseFloat(birdCountChange) || 0;

        if ((eventType === 'MORTALITY' || eventType === 'PURCHASE' || eventType === 'TRANSFER') && change === 0) {
            setError('Please enter the number of birds for this event');
            return;
        }

        // Ensure mortality is always negative
        let finalChange = change !== 0 ? change : undefined;
        if (eventType === 'MORTALITY' && finalChange) {
            finalChange = -Math.abs(finalChange);
        } else if ((eventType === 'PURCHASE' || eventType === 'TRANSFER') && finalChange) {
            finalChange = Math.abs(finalChange);
        }

        await mutation.mutateAsync({
            flockId,
            eventType,
            title: title.trim() || undefined,
            description: description.trim() || undefined,
            cost: cost ? parseFloat(cost) : undefined,
            date,
            birdCountChange: finalChange,
        });
    };

    // Calculate preview
    const changeVal = parseFloat(birdCountChange) || 0;
    const previewCount = eventType === 'MORTALITY'
        ? birdCount - Math.abs(changeVal)
        : birdCount + Math.abs(changeVal);

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div>
                        <h3 className="font-bold text-gray-900">Record Batch Event</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{flockCode} · {birdCount} birds</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <Field label="Event Type" htmlFor="eventType" required>
                        <Select
                            id="eventType"
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value as AnimalEventType)}
                        >
                            {FLOCK_EVENT_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {ANIMAL_EVENT_LABELS[t]}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    {/* Bird count change for MORTALITY / PURCHASE / TRANSFER */}
                    {(eventType === 'MORTALITY' || eventType === 'PURCHASE' || eventType === 'TRANSFER') && (
                        <div>
                            <Field
                                label={eventType === 'MORTALITY' ? 'Birds Lost' : 'Birds Added'}
                                htmlFor="birdCountChange"
                                required
                            >
                                <Input
                                    id="birdCountChange"
                                    type="number"
                                    min="1"
                                    value={birdCountChange}
                                    onChange={(e) => setBirdCountChange(e.target.value)}
                                    placeholder="Enter number"
                                />
                            </Field>
                            {changeVal > 0 && (
                                <div className={`mt-2 text-sm p-2 rounded-lg font-medium ${
                                    eventType === 'MORTALITY' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                                }`}>
                                    New bird count: {previewCount}
                                </div>
                            )}
                        </div>
                    )}

                    <Field label="Date" htmlFor="date" required>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={todayISO()}
                        />
                    </Field>

                    <Field label="Title" htmlFor="title" help="Optional">
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Newcastle vaccine, 3 birds died"
                        />
                    </Field>

                    <Field label="Description" htmlFor="description" help="Optional">
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base resize-none"
                            placeholder="Details…"
                        />
                    </Field>

                    <Field label="Cost" htmlFor="cost" help="Optional">
                        <Input
                            id="cost"
                            type="number"
                            step="0.01"
                            min="0"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            placeholder="0.00"
                        />
                    </Field>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                        >
                            {mutation.isPending ? (
                                <><Loader2 size={18} className="animate-spin" />Saving…</>
                            ) : (
                                <><Save size={18} />Save Event</>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}