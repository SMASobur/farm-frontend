import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Stethoscope, Plus, Pencil } from 'lucide-react';
import { listAnimalEvents } from '@/api/animalEvents';
import { formatCurrency, formatDateShort } from '@/lib/format';
import type { AnimalEvent, AnimalEventType } from '@/types';
import {
    ANIMAL_EVENT_LABELS,
    ANIMAL_EVENT_COLORS,
    ANIMAL_EVENT_EMOJI,
} from '@/types';
import { AnimalEventModal } from './AnimalEventModal';

interface Props {
    animalId: number;
    animalTagNumber: string;
}

const FILTER_OPTIONS: (AnimalEventType | 'ALL')[] = [
    'ALL', 'ILLNESS', 'TREATMENT', 'RECOVERY', 'VACCINATION', 'PREGNANCY', 'WEIGHT',
];

export function AnimalEventList({ animalId, animalTagNumber }: Props) {
    const [filter, setFilter] = useState<AnimalEventType | 'ALL'>('ALL');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<AnimalEvent | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['animal', animalId, 'events', filter],
        queryFn: () => listAnimalEvents(animalId, filter === 'ALL' ? undefined : filter),
    });

    const events: AnimalEvent[] = data?.data ?? [];

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
            {/* Header */}
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

            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 mb-3">
                {FILTER_OPTIONS.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => setFilter(opt)}
                        className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition ${
                            filter === opt
                                ? 'bg-green-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        {opt === 'ALL' ? 'All' : ANIMAL_EVENT_LABELS[opt]}
                    </button>
                ))}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-14 shimmer rounded"></div>
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-6">
                    <Stethoscope className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-sm text-gray-500">
                        {filter === 'ALL' ? 'No events recorded yet.' : `No ${ANIMAL_EVENT_LABELS[filter as AnimalEventType].toLowerCase()} events.`}
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-1.5 mt-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                    >
                        <Plus size={14} />
                        Add First Event
                    </button>
                </div>
            ) : (
                <div className="space-y-1.5">
                    {events.slice(0, 20).map((event) => (
                        <EventRow key={event.id} event={event} onEdit={() => setEditingEvent(event)} />
                    ))}
                    {events.length > 20 && (
                        <p className="text-xs text-gray-400 text-center pt-2">
                            Showing 20 of {events.length} events
                        </p>
                    )}
                </div>
            )}

            {/* Modals */}
            {showAddModal && (
                <AnimalEventModal
                    animalId={animalId}
                    animalTagNumber={animalTagNumber}
                    onClose={() => setShowAddModal(false)}
                />
            )}
            {editingEvent && (
                <AnimalEventModal
                    animalId={animalId}
                    animalTagNumber={animalTagNumber}
                    initial={editingEvent}
                    onClose={() => setEditingEvent(null)}
                />
            )}
        </div>
    );
}

// ============================================================
// Event Row
// ============================================================

function EventRow({ event, onEdit }: { event: AnimalEvent; onEdit: () => void }) {
    return (
        <button
            onClick={onEdit}
            className="w-full text-left bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl p-3 transition group"
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
                <Pencil size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition shrink-0 mt-1" />
            </div>
        </button>
    );
}