import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Stethoscope, Plus, Pencil, Trash2 } from 'lucide-react';
import { listFlockEvents, deleteFlockEvent } from '@/api/animalEvents';
import { formatCurrency, formatDateShort } from '@/lib/format';
import type { AnimalEvent } from '@/types';
import { ANIMAL_EVENT_LABELS, ANIMAL_EVENT_COLORS, ANIMAL_EVENT_EMOJI } from '@/types';
import { FlockEventModal } from './FlockEventModal';
import { useToast } from '@/contexts/ToastContext';

interface Props {
    flockId: number;
    flockCode: string;
    birdCount: number;
    limit?: number;
}

export function FlockEventList({ flockId, flockCode, birdCount, limit }: Props) {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<AnimalEvent | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['flock', flockId, 'events'],
        queryFn: () => listFlockEvents(flockId),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteFlockEvent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flock', flockId] });
            queryClient.invalidateQueries({ queryKey: ['flock', flockId, 'events'] });
            queryClient.invalidateQueries({ queryKey: ['flocks'] });
            toast.success('Event deleted · bird count adjusted');
            setConfirmDeleteId(null);
        },
        onError: () => {
            toast.error('Failed to delete event');
            setConfirmDeleteId(null);
        },
    });

    const allEvents: AnimalEvent[] = data?.data ?? [];
    const events = limit ? allEvents.slice(0, limit) : allEvents;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope size={14} />
                    Health & Events
                </h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700"
                >
                    <Plus size={12} />
                    Add Event
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2].map((i) => <div key={i} className="h-14 shimmer rounded" />)}
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-6">
                    <Stethoscope className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-sm text-gray-500">No events recorded yet.</p>
                </div>
            ) : (
                <div className="space-y-1.5">
                    {events.map((event) => {
                        const isConfirming = confirmDeleteId === event.id;
                        return (
                            <div
                                key={event.id}
                                className={`border rounded-xl p-3 transition group ${
                                    isConfirming
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="text-xl shrink-0">
                                        {ANIMAL_EVENT_EMOJI[event.eventType]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-gray-900 text-sm">
                                                {event.title}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ANIMAL_EVENT_COLORS[event.eventType]}`}>
                                                {ANIMAL_EVENT_LABELS[event.eventType]}
                                            </span>
                                            {event.birdCountChange != null && event.birdCountChange !== 0 && (
                                                <span className={`text-xs font-semibold ${event.birdCountChange > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                    {event.birdCountChange > 0 ? '+' : ''}{event.birdCountChange} birds
                                                </span>
                                            )}
                                        </div>
                                        {event.description && (
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {event.description}
                                            </p>
                                        )}
                                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                            <span>{formatDateShort(event.date)}</span>
                                            {event.cost != null && event.cost > 0 && (
                                                <>
                                                    <span className="text-gray-300">·</span>
                                                    <span className="text-gray-600 font-medium">{formatCurrency(event.cost)}</span>
                                                </>
                                            )}
                                            {event.enteredByName && (
                                                <>
                                                    <span className="text-gray-300">·</span>
                                                    <span>{event.enteredByName}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    {isConfirming ? (
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => deleteMutation.mutate(event.id)}
                                                disabled={deleteMutation.isPending}
                                                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 font-medium disabled:opacity-50"
                                            >
                                                {deleteMutation.isPending ? 'Wait…' : 'Delete'}
                                            </button>
                                            <button
                                                onClick={() => setConfirmDeleteId(null)}
                                                className="text-xs text-gray-600 px-2 py-1 rounded hover:bg-white font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                                            <button
                                                onClick={() => setEditingEvent(event)}
                                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition"
                                                title="Edit"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDeleteId(event.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showAddModal && (
                <FlockEventModal
                    flockId={flockId}
                    flockCode={flockCode}
                    birdCount={birdCount}
                    onClose={() => setShowAddModal(false)}
                />
            )}

            {editingEvent && (
                <FlockEventModal
                    flockId={flockId}
                    flockCode={flockCode}
                    birdCount={birdCount}
                    initial={editingEvent}
                    onClose={() => setEditingEvent(null)}
                />
            )}
        </div>
    );
}