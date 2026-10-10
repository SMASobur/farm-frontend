import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { getWorker, updateWorker, deleteWorker } from '@/api/workers';
import type { WorkerRequest } from '@/types';
import { WorkerForm } from '@/components/workers/WorkerForm';
import { useToast } from '@/contexts/ToastContext';

export function EditWorkerPage() {
    const { id } = useParams<{ id: string }>();
    const workerId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['worker', workerId],
        queryFn: () => getWorker(workerId),
        enabled: Number.isFinite(workerId),
    });

    const updateMutation = useMutation({
        mutationFn: (payload: WorkerRequest) => updateWorker(workerId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workers'] });
            queryClient.invalidateQueries({ queryKey: ['worker', workerId] });
            toast.success('Worker updated');
            navigate(`/workers/${workerId}`);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to update worker');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteWorker(workerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workers'] });
            toast.success('Worker deleted');
            navigate('/workers');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete worker');
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
                    <p className="text-red-800 font-semibold">Worker not found</p>
                    <Link to="/workers" className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                        Back to Workers
                    </Link>
                </div>
            </div>
        );
    }

    const worker = data.data;

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
            <Link
                to={`/workers/${workerId}`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 mb-4 transition"
            >
                <ArrowLeft size={16} />
                Back to Worker
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Worker</h1>
                <p className="text-sm text-gray-500 mb-6">{worker.name}</p>

                <WorkerForm
                    initial={worker}
                    mode="edit"
                    onSubmit={async (payload) => { await updateMutation.mutateAsync(payload); }}
                    onDelete={async () => { await deleteMutation.mutateAsync(); }}
                    cancelTo={`/workers/${workerId}`}
                />
            </div>
        </div>
    );
}