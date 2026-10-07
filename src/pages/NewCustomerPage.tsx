import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { createCustomer } from '@/api/customers';
import type { CustomerRequest } from '@/types';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { useToast } from '@/contexts/ToastContext';

export function NewCustomerPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const mutation = useMutation({
        mutationFn: (data: CustomerRequest) => createCustomer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            toast.success('Customer created');
            navigate('/customers');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to create customer');
        },
    });

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
            <Link
                to="/customers"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 mb-4 transition"
            >
                <ArrowLeft size={16} />
                Back to Customers
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Add Customer</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Record a new customer for sales and dues tracking
                </p>

                <CustomerForm
                    mode="create"
                    onSubmit={async (data) => {
                        await mutation.mutateAsync(data);
                    }}
                />
            </div>
        </div>
    );
}