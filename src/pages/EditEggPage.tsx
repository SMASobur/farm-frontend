import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { getEggProduction, updateEgg, deleteEgg } from '@/api/eggs';
import { EggForm } from '@/components/eggs/EggForm';
import { useToast } from '@/contexts/ToastContext';

export function EditEggPage() {
    const { id } = useParams<{ id: string }>();
    const eggId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['eggs', eggId],
        queryFn: () => getEggProduction(eggId),
        enabled: Number.isFinite(eggId),
    });

    const updateMutation = useMutation({
        mutationFn: (payload: Parameters<typeof updateEgg>[1]) => updateEgg(eggId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eggs'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            toast.success('Egg entry updated');
            navigate('/eggs');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to update');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteEgg(eggId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eggs'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            toast.success('Egg entry deleted');
            navigate('/eggs');
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
                        {[1, 2, 3].map((i) => (
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
                    <p className="text-red-800 font-semibold">Entry not found</p>
                    <Link to="/eggs" className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                        Back to Eggs
                    </Link>
                </div>
            </div>
        );
    }

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
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Egg Entry</h1>
                <p className="text-sm text-gray-500 mb-6">
                    {data.data.sourceDisplayName} · {data.data.date}
                </p>

                <EggForm
                    initial={data.data}
                    mode="edit"
                    onSubmit={async (payload) => { await updateMutation.mutateAsync(payload); }}
                    onDelete={async () => { await deleteMutation.mutateAsync(); }}
                    cancelTo="/eggs"
                />
            </div>
        </div>
    );
}