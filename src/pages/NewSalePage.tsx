import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { createSale } from '@/api/sales';
import type { SaleRequest } from '@/types';
import { SaleForm } from '@/components/sales/SaleForm';
import { useToast } from '@/contexts/ToastContext';

export function NewSalePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const mutation = useMutation({
        mutationFn: (data: SaleRequest) => createSale(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            queryClient.invalidateQueries({ queryKey: ['customer'] });
            toast.success('Sale recorded');
            navigate('/sales');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to record sale');
        },
    });

    const handleSubmit = async (data: SaleRequest) => {
        await mutation.mutateAsync(data);
    };

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
            <Link
                to="/sales"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 mb-4 transition"
            >
                <ArrowLeft size={16} />
                Back to Sales
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Record Sale</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Log a sale to a customer and optionally record payment
                </p>

                <SaleForm
                    mode="create"
                    onSubmit={handleSubmit}
                    cancelTo="/sales"
                />
            </div>
        </div>
    );
}