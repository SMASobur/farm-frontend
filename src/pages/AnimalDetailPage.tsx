import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
    ArrowLeft, Pencil, Trash2, AlertCircle, Loader2, Egg,
} from 'lucide-react';
import { getAnimal, deleteAnimal } from '@/api/animals';
import {
    LIFECYCLE_STATUS_LABELS,
    LIFECYCLE_STATUS_COLORS,
    GENDER_LABELS,
    getSpeciesEmoji,
} from '@/types';
import { AnimalProductionHistory } from '@/components/animals/AnimalProductionHistory';
import { useToast } from '@/contexts/ToastContext';
import { AnimalEventList } from '@/components/animals/AnimalEventList';

export function AnimalDetailPage() {
    const { id } = useParams<{ id: string }>();
    const animalId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const toast = useToast();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['animal', animalId],
        queryFn: () => getAnimal(animalId),
        enabled: Number.isFinite(animalId),
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteAnimal(animalId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['animals'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            toast.success('Animal deleted');
            navigate('/animals');
        },
        onError: (err: any) => {
            toast.error(
                'Could not delete animal',
                err.response?.data?.message || 'Something went wrong'
            );
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
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40}/>
                    <p className="text-red-800 font-semibold">Animal not found</p>
                    <Link to="/animals"
                          className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Back to Animals
                    </Link>
                </div>
            </div>
        );
    }

    const animal = data.data;

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
            <Link to="/animals"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition">
                <ArrowLeft size={16}/>
                Back to Animals
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-24 h-24 sm:w-36 sm:h-36 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-7xl sm:text-8xl shrink-0 shadow-sm">
                        {animal.speciesEmoji || getSpeciesEmoji(animal.speciesCode)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 truncate">{animal.tagNumber}</h1>
                        {animal.name && <p className="text-gray-500 mt-0.5">{animal.name}</p>}

                        {/* FIXED: Badges section */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {/* Lifecycle status */}
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${LIFECYCLE_STATUS_COLORS[animal.lifecycleStatus]}`}>
                                {LIFECYCLE_STATUS_LABELS[animal.lifecycleStatus]}
                            </span>

                            {/* Derived conditions */}
                            {animal.currentlyPregnant && (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 font-medium">
                                    🤰 Pregnant
                                </span>
                            )}
                            {animal.currentlySick && (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                                    💊 Sick
                                </span>
                            )}
                            {animal.currentlyMilking && (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                                    🥛 Milking
                                </span>
                            )}

                            {/* FIXED: Only show Egg Producer if Female */}
                            {animal.eggProducer && animal.gender === 'FEMALE' && (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-medium inline-flex items-center gap-1">
                                    <Egg size={12}/> Egg Producer
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                    <InfoItem label="Species" value={animal.speciesName}/>
                    <InfoItem label="Gender" value={animal.gender ? GENDER_LABELS[animal.gender] : '—'}/>
                    <InfoItem
                        label="Date of Birth"
                        value={animal.dateOfBirth
                            ? new Date(animal.dateOfBirth).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            })
                            : '—'}
                    />
                    <InfoItem label="Age" value={animal.dateOfBirth ? calculateAge(animal.dateOfBirth) : '—'}/>
                </div>

                <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100">
                    <Link
                        to={`/animals/${animal.id}/edit`}
                        className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        <Pencil size={16}/>
                        Edit
                    </Link>
                    {!confirmDelete && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 transition ml-auto"
                        >
                            <Trash2 size={16}/>
                            Delete
                        </button>
                    )}
                </div>

                {confirmDelete && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800 font-medium">Delete this animal?</p>
                        <div className="flex items-center gap-2 mt-3">
                            <button
                                onClick={() => deleteMutation.mutate()}
                                disabled={deleteMutation.isPending}
                                className="bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1.5"
                            >
                                {deleteMutation.isPending ? <><Loader2 size={14}
                                                                       className="animate-spin"/>Deleting…</> : <>
                                    <Trash2 size={14}/>Yes, delete</>}
                            </button>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                disabled={deleteMutation.isPending}
                                className="text-sm px-3 py-1.5 rounded-lg text-gray-700 hover:bg-white"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Animal history - Only show if active, otherwise show a message */}
            {animal.lifecycleStatus === 'ACTIVE' ? (
                <>
                    <AnimalProductionHistory animal={animal}/>
                    <AnimalEventList
                        animalId={animal.id}
                        animalTagNumber={animal.tagNumber}
                    />
                </>
            ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center text-gray-600">
                    <p>This animal is currently marked as <strong>{LIFECYCLE_STATUS_LABELS[animal.lifecycleStatus]}</strong>.</p>
                    <p className="text-sm mt-1">Change the status to Active in the Edit page to view and record production or health events.</p>
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

function calculateAge(dobStr: string): string {
    const dob = new Date(dobStr);
    const now = new Date();
    const months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    if (months < 1) return 'Less than 1 month';
    if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    return remMonths > 0 ? `${years}y ${remMonths}m` : `${years} year${years === 1 ? '' : 's'}`;
}