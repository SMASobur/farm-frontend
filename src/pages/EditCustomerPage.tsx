import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { getCustomer, updateCustomer, deleteCustomer } from '@/api/customers';
import type { CustomerRequest } from '@/types';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { useToast } from '@/contexts/ToastContext';

export function EditCustomerPage() {
    const { id } = useParams<{ id: string }>();
    const customerId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    // ============ Query ============

    const { data, isLoading, isError } = useQuery({
        queryKey: ['customer', customerId],
        queryFn: () => getCustomer(customerId),
        enabled: Number.isFinite(customerId),
    });

    // ============ Mutations ============

    const updateMutation = useMutation({
        mutationFn: (payload: CustomerRequest) => updateCustomer(customerId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
            toast.success('Customer updated');
            navigate(`/customers/${customerId}`);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to update customer');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteCustomer(customerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            toast.success('Customer deleted');
            navigate('/customers');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete customer');
        },
    });

    // ============ Loading ============

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

    // ============ Error ============

    if (isError || !data) {
        return (
            <div className="p-4 md:p-6 max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Customer not found</p>
                    <Link
                        to="/customers"
                        className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Back to Customers
                    </Link>
                </div>
            </div>
        );
    }

    // ============ Edit Form ============

    const customer = data.data;

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
            <Link
                to={`/customers/${customerId}`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 mb-4 transition"
            >
                <ArrowLeft size={16} />
                Back to Customer
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Customer</h1>
                <p className="text-sm text-gray-500 mb-6">
                    {customer.name}
                    {customer.totalDue !== null && customer.totalDue !== undefined && customer.totalDue > 0 && (
                        <span className="ml-2 text-amber-700 font-semibold">
                            · ৳{customer.totalDue.toLocaleString('en-IN')} due
                        </span>
                    )}
                </p>

                <CustomerForm
                    initial={customer}
                    mode="edit"
                    onSubmit={async (data) => {
                        await updateMutation.mutateAsync(data);
                    }}
                    onDelete={async () => {
                        await deleteMutation.mutateAsync();
                    }}
                    cancelTo={`/customers/${customerId}`}
                />
            </div>
        </div>
    );
}