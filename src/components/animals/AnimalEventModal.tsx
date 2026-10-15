import { useState, type FormEvent, useEffect } from 'react';
import { X, Loader2, Save, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createAnimalEvent,
    updateAnimalEvent,
    deleteAnimalEvent,
} from '@/api/animalEvents';
import { useToast } from '@/contexts/ToastContext';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import type { AnimalEvent, AnimalEventRequest, AnimalEventType } from '@/types';
import { ANIMAL_EVENT_LABELS } from '@/types';

const EVENT_TYPES: AnimalEventType[] = [
    'ILLNESS', 'TREATMENT', 'RECOVERY', 'VACCINATION', 'DEWORMING',
    'CHECKUP', 'PREGNANCY', 'CALVING', 'WEIGHT',
    'PURCHASE', 'SALE', 'DEATH', 'NOTE', 'OTHER',
];

function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}

interface Props {
    animalId: number;
    animalTagNumber: string;
    initial?: AnimalEvent;
    onClose: () => void;
}

export function AnimalEventModal({ animalId, animalTagNumber, initial, onClose }: Props) {
    const queryClient = useQueryClient();
    const toast = useToast();

    const isEdit = !!initial;

    const [eventType, setEventType] = useState<AnimalEventType>(initial?.eventType ?? 'NOTE');
    const [date, setDate] = useState(initial?.date ?? todayISO());
    const [title, setTitle] = useState(initial?.title ?? '');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [cost, setCost] = useState(initial?.cost != null ? String(initial.cost) : '');

    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Escape + body lock
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const saveMutation = useMutation({
        mutationFn: (data: AnimalEventRequest) =>
            isEdit ? updateAnimalEvent(initial!.id, data) : createAnimalEvent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['animal', animalId, 'events'] });
            toast.success(isEdit ? 'Event updated' : 'Event recorded');
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to save event');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteAnimalEvent(initial!.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['animal', animalId, 'events'] });
            toast.success('Event deleted');
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to delete event');
        },
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');


        const payload: AnimalEventRequest = {
            animalId,
            date,
            eventType,
            title: title.trim() || undefined,
            description: description.trim() || undefined,
            cost: cost && !isNaN(parseFloat(cost)) ? parseFloat(cost) : undefined,
        };

        await saveMutation.mutateAsync(payload);
    };

    const loading = saveMutation.isPending || deleteMutation.isPending;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">
                        {isEdit ? 'Edit Event' : 'Add Event'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500"
                        aria-label="Close"
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

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 text-xs text-blue-700">
                        Recording for <span className="font-semibold">{animalTagNumber}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Type" htmlFor="eventType" required>
                            <Select
                                id="eventType"
                                value={eventType}
                                onChange={(e) => setEventType(e.target.value as AnimalEventType)}
                            >
                                {EVENT_TYPES.map((t) => (
                                    <option key={t} value={t}>
                                        {ANIMAL_EVENT_LABELS[t]}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Date" htmlFor="date" required>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                max={todayISO()}
                            />
                        </Field>
                    </div>

                    <Field
                        label="Title"
                        htmlFor="title"
                        help="Short description, e.g., 'Fever', 'FMD Vaccine', 'Weighed 320kg'"
                    >
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Fever"
                            autoFocus={!isEdit}
                            autoComplete="off"
                        />
                    </Field>

                    <Field label="Description" htmlFor="description" help="Optional — longer notes">
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base resize-none"
                            placeholder="Details, medicine name, dosage…"
                        />
                    </Field>

                    <Field label="Cost" htmlFor="cost" help="Optional — vet fee, medicine cost">
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

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                        >
                            {saveMutation.isPending ? (
                                <><Loader2 size={18} className="animate-spin" />Saving…</>
                            ) : (
                                <><Save size={18} />{isEdit ? 'Save Changes' : 'Record Event'}</>
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

                    {isEdit && (
                        <div className="border-t pt-4 mt-2">
                            {!confirmDelete ? (
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(true)}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium inline-flex items-center gap-1.5"
                                >
                                    <Trash2 size={14} />
                                    Delete this event
                                </button>
                            ) : (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-800 font-medium">
                                        Delete this event?
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => deleteMutation.mutate()}
                                            disabled={deleteMutation.isPending}
                                            className="bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1.5"
                                        >
                                            {deleteMutation.isPending ? (
                                                <><Loader2 size={14} className="animate-spin" />Deleting…</>
                                            ) : (
                                                <><Trash2 size={14} />Confirm</>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDelete(false)}
                                            disabled={deleteMutation.isPending}
                                            className="text-sm px-3 py-1.5 rounded-lg text-gray-700 hover:bg-white disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}