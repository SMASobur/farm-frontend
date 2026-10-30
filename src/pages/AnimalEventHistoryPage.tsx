import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowLeft, Stethoscope, Plus } from 'lucide-react';
import { listAnimalEvents } from '@/api/animalEvents';
import { getAnimal } from '@/api/animals';
import { formatCurrency, formatDateShort } from '@/lib/format';
import type { AnimalEvent, AnimalEventType } from '@/types';
import { ANIMAL_EVENT_LABELS, ANIMAL_EVENT_COLORS, ANIMAL_EVENT_EMOJI } from '@/types';
import { AnimalEventModal } from '@/components/animals/AnimalEventModal';

const FILTER_OPTIONS: (AnimalEventType | 'ALL')[] = [
    'ALL', 'ILLNESS', 'TREATMENT', 'RECOVERY', 'VACCINATION', 'PREGNANCY', 'WEIGHT',
];

export function AnimalEventHistoryPage() {
    const { id } = useParams<{ id: string }>();
    const animalId = Number(id);
    const [filter, setFilter] = useState<AnimalEventType | 'ALL'>('ALL');
    const [showAddModal, setShowAddModal] = useState(false);

    const animalQuery = useQuery({
        queryKey: ['animal', animalId],
        queryFn: () => getAnimal(animalId),
        enabled: Number.isFinite(animalId),
    });

    const eventsQuery = useQuery({
        queryKey: ['animal', animalId, 'events', filter],
        queryFn: () => listAnimalEvents(animalId, filter === 'ALL' ? undefined : filter),
        enabled: Number.isFinite(animalId),
    });

    const events: AnimalEvent[] = eventsQuery.data?.data ?? [];
    const animal = animalQuery.data?.data;

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
            <Link to={`/animals/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600">
                <ArrowLeft size={16} /> Back to {animal?.tagNumber ?? 'Animal'}
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Stethoscope size={24} /> Health & Events
                    </h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                        <Plus size={16} /> Add Event
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                    {FILTER_OPTIONS.map(opt => (
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
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    {filter === 'ALL' ? 'All Events' : `${ANIMAL_EVENT_LABELS[filter as AnimalEventType]} Events`} ({events.length})
                </h2>

                {eventsQuery.isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-14 shimmer rounded" />)}
                    </div>
                ) : events.length === 0 ? (
                    <p className="text-center text-gray-500 py-8 text-sm">No events recorded in this category.</p>
                ) : (
                    <div className="space-y-1.5">
                        {events.map(event => (
                            <div key={event.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                                <div className="flex items-start gap-3">
                                    <div className="text-xl shrink-0">{ANIMAL_EVENT_EMOJI[event.eventType]}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-gray-900 text-sm">{event.title}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ANIMAL_EVENT_COLORS[event.eventType]}`}>
                                                {ANIMAL_EVENT_LABELS[event.eventType]}
                                            </span>
                                        </div>
                                        {event.description && <p className="text-xs text-gray-500 mt-1">{event.description}</p>}
                                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                            <span>{formatDateShort(event.date)}</span>
                                            {event.cost != null && event.cost > 0 && (
                                                <><span className="text-gray-300">·</span><span className="text-gray-600 font-medium">{formatCurrency(event.cost)}</span></>
                                            )}
                                            {event.enteredByName && (
                                                <><span className="text-gray-300">·</span><span>{event.enteredByName}</span></>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showAddModal && (
                <AnimalEventModal
                    animalId={animalId}
                    animalTagNumber={animal?.tagNumber ?? ''}
                    onClose={() => setShowAddModal(false)}
                />
            )}
        </div>
    );
}