import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { createMilk } from '@/api/milk';
import { MilkForm } from '@/components/milk/MilkForm';
import { useToast } from '@/contexts/ToastContext';

export function NewMilkPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const [searchParams] = useSearchParams();
    const prefilledAnimalId = searchParams.get('animalId')
        ? Number(searchParams.get('animalId'))
        : null;
    const prefilledDate = searchParams.get('date');

    const mutation = useMutation({
        mutationFn: createMilk,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['milk'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-alerts'] });
            toast.success('Milk recorded');
            navigate('/milk');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to record milk');
        },
    });

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
            <Link
                to="/milk"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 mb-4 transition"
            >
                <ArrowLeft size={16} />
                Back to Milk
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Record Milk</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Log today's milking for an animal
                </p>

                <MilkForm
                    mode="create"
                    onSubmit={async (data) => { await mutation.mutateAsync(data); }}
                    cancelTo="/milk"
                    prefilledAnimalId={prefilledAnimalId}
                    prefilledDate={prefilledDate}
                />
            </div>
        </div>
    );
}