import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
    ArrowLeft, Pencil, Trash2, AlertCircle, Loader2, Milk,
} from 'lucide-react';
import { getAnimal, deleteAnimal } from '@/api/animals';
import {
    SPECIES_LABELS, SPECIES_EMOJI, STATUS_LABELS, STATUS_COLORS,
    GENDER_LABELS,
} from '@/types';

export function AnimalDetailPage() {
    const { id } = useParams<{ id: string }>();
    const animalId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [confirmDelete, setConfirmDelete] = useState(false);

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
            navigate('/animals');
        },
    });

    // ============ Loading ============
    if (isLoading) {
        return (
            <div className="p-4 md:p-6 max-w-3xl mx-auto">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
                    <div className="h-8 shimmer rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-12 shimmer rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ============ Error ============
    if (isError || !data) {
        return (
            <div className="p-4 md:p-6 max-w-3xl mx-auto">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Animal not found</p>
                    <Link
                        to="/animals"
                        className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Back to Animals
                    </Link>
                </div>
            </div>
        );
    }

    const animal = data.data;

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
            <Link
                to="/animals"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition"
            >
                <ArrowLeft size={16} />
                Back to Animals
            </Link>

            {/* Hero card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="text-5xl shrink-0">
                            {SPECIES_EMOJI[animal.species]}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 truncate">
                                {animal.tagNumber}
                            </h1>
                            {animal.name && (
                                <p className="text-gray-500 mt-0.5 truncate">{animal.name}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        STATUS_COLORS[animal.status]
                    }`}
                >
                  {STATUS_LABELS[animal.status]}
                </span>
                                {animal.milkProducer && (
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium inline-flex items-center gap-1">
                    <Milk size={12} /> Milk Producer
                  </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <InfoItem label="Species" value={SPECIES_LABELS[animal.species]} />
                    <InfoItem
                        label="Gender"
                        value={animal.gender ? GENDER_LABELS[animal.gender] : '—'}
                    />
                    <InfoItem
                        label="Date of Birth"
                        value={
                            animal.dateOfBirth
                                ? new Date(animal.dateOfBirth).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })
                                : '—'
                        }
                    />
                    <InfoItem
                        label="Age"
                        value={animal.dateOfBirth ? calculateAge(animal.dateOfBirth) : '—'}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
                <Link
                    to={`/animals/${animal.id}/edit`}
                    className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
                >
                    <Pencil size={16} />
                    Edit
                </Link>

                {!confirmDelete ? (
                    <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                ) : null}
            </div>

            {/* Delete confirmation */}
            {confirmDelete && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <p className="text-sm text-red-800 font-medium">Delete this animal?</p>
                    <p className="text-xs text-red-600 mt-1">
                        This cannot be undone. Milk and egg production records linked to this animal will remain.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                        <button
                            type="button"
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                            {deleteMutation.isPending ? (
                                <><Loader2 size={14} className="animate-spin" />Deleting…</>
                            ) : (
                                <><Trash2 size={14} />Yes, delete</>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(false)}
                            disabled={deleteMutation.isPending}
                            className="text-sm px-4 py-2 rounded-lg text-gray-700 hover:bg-white disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Placeholder for future sections */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Activity
                </h2>
                <p className="text-sm text-gray-500">
                    Milk production history and medical records will appear here in a future update.
                </p>
            </div>
        </div>
    );
}

// ============ Sub-components ============

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                {label}
            </div>
            <div className="text-gray-900 font-medium mt-1">{value}</div>
        </div>
    );
}

function calculateAge(dobStr: string): string {
    const dob = new Date(dobStr);
    const now = new Date();
    const months =
        (now.getFullYear() - dob.getFullYear()) * 12 +
        (now.getMonth() - dob.getMonth());

    if (months < 1) return 'Less than 1 month';
    if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;

    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    return remMonths > 0
        ? `${years}y ${remMonths}m`
        : `${years} year${years === 1 ? '' : 's'}`;
}