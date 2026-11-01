import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Stethoscope } from 'lucide-react';
import { listFlockEvents } from '@/api/animalEvents';
import { getFlock } from '@/api/flocks';
import { formatDateShort, formatCurrency } from '@/lib/format';
import type { AnimalEvent } from '@/types';
import { ANIMAL_EVENT_LABELS, ANIMAL_EVENT_COLORS, ANIMAL_EVENT_EMOJI } from '@/types';

export function FlockEventHistoryPage() {
    const { id } = useParams<{ id: string }>();
    const flockId = Number(id);

    const flockQuery = useQuery({
        queryKey: ['flock', flockId],
        queryFn: () => getFlock(flockId),
        enabled: Number.isFinite(flockId),
    });

    const eventsQuery = useQuery({
        queryKey: ['flock', flockId, 'events', 'all'],
        queryFn: () => listFlockEvents(flockId),
        enabled: Number.isFinite(flockId),
    });

    const events: AnimalEvent[] = eventsQuery.data?.data ?? [];
    const flock = flockQuery.data?.data;

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
            <Link
                to={`/flocks/${id}`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600"
            >
                <ArrowLeft size={16} /> Back to {flock?.flockCode ?? 'Batch'}
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Stethoscope size={24} />
                    Health & Events
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {flock?.flockCode} · {events.length} events
                </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                {eventsQuery.isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-14 shimmer rounded" />)}
                    </div>
                ) : events.length === 0 ? (
                    <p className="text-center text-gray-500 py-8 text-sm">No events recorded yet.</p>
                ) : (
                    <div className="space-y-1.5">
                        {events.map(event => (
                            <div key={event.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
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
                                            <p className="text-xs text-gray-500 mt-1">{event.description}</p>
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
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}