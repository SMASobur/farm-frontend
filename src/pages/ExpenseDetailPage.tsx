import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
    ArrowLeft, Pencil, Trash2, AlertCircle, Loader2, Calendar, Tag, Receipt,
} from 'lucide-react';
import { getExpense, deleteExpense } from '@/api/expenses';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency, formatDateLong } from '@/lib/format';

export function ExpenseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const expenseId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const [confirmDelete, setConfirmDelete] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['expense', expenseId],
        queryFn: () => getExpense(expenseId),
        enabled: Number.isFinite(expenseId),
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteExpense(expenseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            toast.success('Expense deleted');
            navigate('/expenses');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete expense');
        },
    });

    // ============ Loading ============
    if (isLoading) {
        return (
            <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
                <div className="h-6 shimmer rounded w-32"></div>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
                    <div className="h-8 shimmer rounded w-1/3"></div>
                    <div className="h-20 shimmer rounded"></div>
                    <div className="h-12 shimmer rounded"></div>
                </div>
            </div>
        );
    }

    // ============ Error ============
    if (isError || !data) {
        return (
            <div className="p-4 md:p-6 max-w-3xl mx-auto">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Expense not found</p>
                    <Link
                        to="/expenses"
                        className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Back to Expenses
                    </Link>
                </div>
            </div>
        );
    }

    const expense = data.data;

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
            <Link
                to="/expenses"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition"
            >
                <ArrowLeft size={16} />
                Back to Expenses
            </Link>

            {/* Hero Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                        <Receipt size={26} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                            Expense #{expense.id}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mt-0.5 break-words">
                            {expense.description}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                                <Tag size={12} />
                                {expense.categoryName}
                                {expense.categoryNameBn && ` · ${expense.categoryNameBn}`}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                <Calendar size={12} />
                                {formatDateLong(expense.date)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Amount block */}
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-red-900 uppercase tracking-wider">
                        Amount
                    </span>
                    <span className="text-3xl font-bold text-red-600">
                        −{formatCurrency(expense.amount)}
                    </span>
                </div>

                {/* Notes */}
                {expense.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
                            Notes
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {expense.notes}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-gray-100">
                    <Link
                        to={`/expenses/${expense.id}/edit`}
                        className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        <Pencil size={16} />
                        Edit
                    </Link>

                    {!confirmDelete && (
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 transition ml-auto"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    )}
                </div>

                {/* Delete confirmation */}
                {confirmDelete && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800 font-medium">Delete this expense?</p>
                        <p className="text-xs text-red-600 mt-1">
                            This cannot be undone.
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                            <button
                                type="button"
                                onClick={() => deleteMutation.mutate()}
                                disabled={deleteMutation.isPending}
                                className="bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1.5"
                            >
                                {deleteMutation.isPending ? (
                                    <><Loader2 size={14} className="animate-spin" />Deleting…</>
                                ) : (
                                    <><Trash2 size={14} />Yes, delete</>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(false)}
                                disabled={deleteMutation.isPending}
                                className="text-sm px-3 py-1.5 rounded-lg text-gray-700 hover:bg-white disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}