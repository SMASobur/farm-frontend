import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { createFlock } from '@/api/flocks';
import type { FlockRequest } from '@/types';
import { FlockForm } from '@/components/flocks/FlockForm';
import { useToast } from '@/contexts/ToastContext';

export function NewFlockPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const mutation = useMutation({
        mutationFn: (data: FlockRequest) => createFlock(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flocks'] });
            toast.success('Batch created');
            navigate('/flocks');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to create batch');
        },
    });

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
            <Link
                to="/flocks"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 mb-4 transition"
            >
                <ArrowLeft size={16} />
                Back to Batches
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Add Batch</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Group your birds into a batch for easier daily tracking
                </p>

                <FlockForm
                    mode="create"
                    onSubmit={async (data) => { await mutation.mutateAsync(data); }}
                    cancelTo="/flocks"
                />
            </div>
        </div>
    );
}