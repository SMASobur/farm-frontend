import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { createExpense } from '@/api/expenses';
import type { ExpenseRequest } from '@/types';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { useToast } from '@/contexts/ToastContext';

export function NewExpensePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const mutation = useMutation({
        mutationFn: (data: ExpenseRequest) => createExpense(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            toast.success('Expense recorded');
            navigate('/expenses');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to record expense');
        },
    });

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
            <Link
                to="/expenses"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 mb-4 transition"
            >
                <ArrowLeft size={16} />
                Back to Expenses
            </Link>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Record Expense</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Log a farm cost such as feed, medicine, or salary
                </p>

                <ExpenseForm
                    mode="create"
                    onSubmit={async (data) => { await mutation.mutateAsync(data); }}
                    cancelTo="/expenses"
                />
            </div>
        </div>
    );
}