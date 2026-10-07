import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { createAnimal } from '@/api/animals';
import type { AnimalRequest } from '@/types';
import { AnimalForm } from '@/components/animals/AnimalForm';
import { useToast } from '@/contexts/ToastContext';

export function NewAnimalPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const mutation = useMutation({
        mutationFn: (data: AnimalRequest) => createAnimal(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['animals'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            toast.success('Animal created');
            navigate('/animals');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to create animal');
        },
    });

    const handleSubmit = async (data: AnimalRequest) => {
        await mutation.mutateAsync(data);
    };

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
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Add Animal</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Record a new animal to your farm
                </p>

                <AnimalForm mode="create" onSubmit={handleSubmit} />
            </div>
        </div>
    );
}