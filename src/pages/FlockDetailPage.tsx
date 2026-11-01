import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { getFlock, deleteFlock } from '@/api/flocks';
import { FLOCK_STATUS_LABELS, FLOCK_STATUS_COLORS, getSpeciesEmoji } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import { FlockProductionHistory } from '@/components/flocks/FlockProductionHistory';
import { FlockEventList } from '@/components/flocks/FlockEventList';

export function FlockDetailPage() {
    const { id } = useParams<{ id: string }>();
    const flockId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const toast = useToast();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['flock', flockId],
        queryFn: () => getFlock(flockId),
        enabled: Number.isFinite(flockId),
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteFlock(flockId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flocks'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            toast.success('Flock deleted');
            navigate('/flocks');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete flock');
        },
    });

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 max-w-3xl mx-auto">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
                    <div className="h-8 shimmer rounded w-1/3"></div>
                    <div className="h-24 shimmer rounded"></div>
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="p-4 md:p-6 max-w-3xl mx-auto">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Flock not found</p>
                    <Link to="/flocks" className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">
                        Back to Batches
                    </Link>
                </div>
            </div>
        );
    }

    const flock = data.data;

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
            <Link to="/flocks" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600">
                <ArrowLeft size={16} />
                Back to Batches
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-24 h-24 sm:w-36 sm:h-36 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-7xl sm:text-8xl shrink-0 shadow-sm">
                        {getSpeciesEmoji(flock.speciesCode)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 truncate">{flock.flockCode}</h1>
                        {flock.name && <p className="text-gray-500 mt-0.5">{flock.name}</p>}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${FLOCK_STATUS_COLORS[flock.status]}`}>
                                {FLOCK_STATUS_LABELS[flock.status]}
                            </span>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">
                                {flock.speciesName}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                    <InfoItem label="Bird Count" value={String(flock.birdCount)} />
                    <InfoItem label="Species" value={flock.speciesName} />
                    <InfoItem
                        label="Started On"
                        value={flock.startedOn
                            ? new Date(flock.startedOn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                    />
                    <InfoItem
                        label="Created"
                        value={new Date(flock.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    />
                </div>

                <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100">
                    <Link
                        to={`/flocks/${flock.id}/edit`}
                        className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        <Pencil size={16} />
                        Edit
                    </Link>
                    {!confirmDelete && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 transition ml-auto"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    )}
                </div>

                {confirmDelete && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800 font-medium">Delete this batch?</p>
                        <p className="text-xs text-red-600 mt-1">This cannot be undone. Egg records will remain.</p>
                        <div className="flex items-center gap-2 mt-3">
                            <button
                                onClick={() => deleteMutation.mutate()}
                                disabled={deleteMutation.isPending}
                                className="bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1.5"
                            >
                                {deleteMutation.isPending ? (
                                    <><Loader2 size={14} className="animate-spin" />Deleting…</>
                                ) : (
                                    <><Trash2 size={14} />Yes, delete</>
                                )}
                            </button>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="text-sm px-3 py-1.5 rounded-lg text-gray-700 hover:bg-white"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {flock.status === 'ACTIVE' ? (
                <>
                    <FlockProductionHistory
                        flockId={flock.id}
                        limit={5}
                        showViewAllLink
                    />
                    <FlockEventList
                        flockId={flock.id}
                        flockCode={flock.flockCode}
                        birdCount={flock.birdCount}
                        limit={5}
                        showViewAllLink
                    />
                </>
            ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center text-gray-600">
                    <p>This batch is currently marked as <strong>{FLOCK_STATUS_LABELS[flock.status]}</strong>.</p>
                    <p className="text-sm mt-1">Change the status to Active in the Edit page to record events.</p>
                </div>
            )}
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</div>
            <div className="text-gray-900 font-medium mt-1">{value}</div>
        </div>
    );
}