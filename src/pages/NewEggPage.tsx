import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { createEgg } from '@/api/eggs';
import { EggForm } from '@/components/eggs/EggForm';
import { useToast } from '@/contexts/ToastContext';

export function NewEggPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const mutation = useMutation({
        mutationFn: createEgg,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eggs'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            toast.success('Eggs recorded');
            navigate('/eggs');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to record eggs');
        },
    });

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
            <Link
                to="/eggs"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 mb-4 transition"
            >
                <ArrowLeft size={16} />
                Back to Eggs
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Record Eggs</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Log today's egg collection from a batch or individual bird
                </p>

                <EggForm
                    mode="create"
                    onSubmit={async (data) => { await mutation.mutateAsync(data); }}
                    cancelTo="/eggs"
                />
            </div>
        </div>
    );
}