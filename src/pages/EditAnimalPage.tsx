import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { getAnimal, updateAnimal, deleteAnimal } from '@/api/animals';
import type { AnimalRequest } from '@/types';
import { AnimalForm } from '@/components/animals/AnimalForm';

export function EditAnimalPage() {
    const { id } = useParams<{ id: string }>();
    const animalId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['animal', animalId],
        queryFn: () => getAnimal(animalId),
        enabled: Number.isFinite(animalId),
    });

    const updateMutation = useMutation({
        mutationFn: (payload: AnimalRequest) => updateAnimal(animalId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['animals'] });
            queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            navigate(`/animals/${animalId}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteAnimal(animalId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['animals'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            navigate('/animals');
        },
    });

    const handleSubmit = async (payload: AnimalRequest) => {
        await updateMutation.mutateAsync(payload);
    };

    const handleDelete = async () => {
        await deleteMutation.mutateAsync();
    };

    // ============ Loading ============
    if (isLoading) {
        return (
            <div className="p-4 md:p-6 max-w-2xl mx-auto">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
                    <div className="h-8 shimmer rounded w-1/3"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 shimmer rounded w-24"></div>
                                <div className="h-11 shimmer rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ============ Error ============
    if (isError || !data) {
        return (
            <div className="p-4 md:p-6 max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Animal not found</p>
                    <p className="text-sm text-red-600 mt-2">
                        This animal may have been deleted or doesn't exist.
                    </p>
                    <Link
                        to={`/animals/${animalId}`}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 mb-4 transition"
                    >
                        <ArrowLeft size={16} />
                        Back to Animal
                    </Link>
                </div>
            </div>
        );
    }

    // ============ Edit Form ============
    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
            <Link
                to="/animals"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 mb-4 transition"
            >
                <ArrowLeft size={16} />
                Back to Animals
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Animal</h1>
                <p className="text-sm text-gray-500 mb-6">
                    {data.data.tagNumber}
                    {data.data.name && ` · ${data.data.name}`}
                </p>

                <AnimalForm
                    initial={data.data}
                    mode="edit"
                    onSubmit={handleSubmit}
                    onDelete={handleDelete}
                    cancelTo={`/animals/${animalId}`}
                />
            </div>
        </div>
    );
}