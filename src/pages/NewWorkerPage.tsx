import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { createWorker } from '@/api/workers';
import type { WorkerRequest } from '@/types';
import { WorkerForm } from '@/components/workers/WorkerForm';
import { useToast } from '@/contexts/ToastContext';

export function NewWorkerPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const mutation = useMutation({
        mutationFn: (data: WorkerRequest) => createWorker(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workers'] });
            toast.success('Worker added');
            navigate('/workers');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to create worker');
        },
    });

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
            <Link
                to="/workers"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 mb-4 transition"
            >
                <ArrowLeft size={16} />
                Back to Workers
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Add Worker</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Record a new farm worker
                </p>

                <WorkerForm
                    mode="create"
                    onSubmit={async (data) => { await mutation.mutateAsync(data); }}
                    cancelTo="/workers"
                />
            </div>
        </div>
    );
}