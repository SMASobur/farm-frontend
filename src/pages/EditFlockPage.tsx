import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { getFlock, updateFlock, deleteFlock } from '@/api/flocks';
import type { FlockRequest } from '@/types';
import { FlockForm } from '@/components/flocks/FlockForm';
import { useToast } from '@/contexts/ToastContext';

export function EditFlockPage() {
    const { id } = useParams<{ id: string }>();
    const flockId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['flock', flockId],
        queryFn: () => getFlock(flockId),
        enabled: Number.isFinite(flockId),
    });

    const updateMutation = useMutation({
        mutationFn: (payload: FlockRequest) => updateFlock(flockId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flocks'] });
            queryClient.invalidateQueries({ queryKey: ['flock', flockId] });
            toast.success('Batch updated');
            navigate(`/flocks/${flockId}`);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to update');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteFlock(flockId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flocks'] });
            toast.success('Batch deleted');
            navigate('/flocks');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete');
        },
    });

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

    if (isError || !data) {
        return (
            <div className="p-4 md:p-6 max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Batch not found</p>
                    <Link to="/flocks" className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                        Back to Batches
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
            <Link
                to={`/flocks/${flockId}`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 mb-4 transition"
            >
                <ArrowLeft size={16} />
                Back to Batch
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Batch</h1>
                <p className="text-sm text-gray-500 mb-6">{data.data.flockCode}</p>

                <FlockForm
                    initial={data.data}
                    mode="edit"
                    onSubmit={async (payload) => { await updateMutation.mutateAsync(payload); }}
                    onDelete={async () => { await deleteMutation.mutateAsync(); }}
                    cancelTo={`/flocks/${flockId}`}
                />
            </div>
        </div>
    );
}