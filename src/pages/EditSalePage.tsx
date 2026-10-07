import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { getSale, updateSale } from '@/api/sales';
import type { SaleRequest } from '@/types';
import { SaleForm } from '@/components/sales/SaleForm';
import { useToast } from '@/contexts/ToastContext';

export function EditSalePage() {
    const { id } = useParams<{ id: string }>();
    const saleId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['sale', saleId],
        queryFn: () => getSale(saleId),
        enabled: Number.isFinite(saleId),
    });

    const updateMutation = useMutation({
        mutationFn: (payload: SaleRequest) => updateSale(saleId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            toast.success('Sale updated');
            navigate(`/sales/${saleId}`);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to update sale');
        },
    });

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 max-w-2xl mx-auto">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
                    <div className="h-8 shimmer rounded w-1/3"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
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
                    <p className="text-red-800 font-semibold">Sale not found</p>
                    <Link
                        to="/sales"
                        className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Back to Sales
                    </Link>
                </div>
            </div>
        );
    }

    const sale = data.data;

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
            <Link
                to={`/sales/${saleId}`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 mb-4 transition"
            >
                <ArrowLeft size={16} />
                Back to Sale
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Sale</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Sale #{sale.id} · {sale.customerName}
                    {sale.paidAmount > 0 && (
                        <span className="ml-2 text-amber-700 font-semibold">
                            · ৳{sale.paidAmount.toLocaleString('en-IN')} already paid
                        </span>
                    )}
                </p>

                <SaleForm
                    initial={sale}
                    mode="edit"
                    onSubmit={async (payload) => {
                        await updateMutation.mutateAsync(payload);
                    }}
                    cancelTo={`/sales/${saleId}`}
                />
            </div>
        </div>
    );
}