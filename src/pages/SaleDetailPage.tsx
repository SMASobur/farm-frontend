import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft, AlertCircle, Loader2, Plus, Pencil, Trash2,
    Calendar, User as UserIcon, Wallet,
} from 'lucide-react';
import { getSale, deleteSale } from '@/api/sales';
import { listPaymentsBySale } from '@/api/payments';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency, formatDateLong } from '@/lib/format';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { PaymentRow } from '@/components/payments/PaymentRow';
import { SaleStatusBadge } from '@/components/sales/SaleStatusBadge';

export function SaleDetailPage() {
    const { id } = useParams<{ id: string }>();
    const saleId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [confirmDeleteSale, setConfirmDeleteSale] = useState(false);

    // Sale data
    const saleQuery = useQuery({
        queryKey: ['sale', saleId],
        queryFn: () => getSale(saleId),
        enabled: Number.isFinite(saleId),
    });

    // Payments for this sale
    const paymentsQuery = useQuery({
        queryKey: ['sale', saleId, 'payments'],
        queryFn: () => listPaymentsBySale(saleId),
        enabled: Number.isFinite(saleId),
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteSale(saleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            toast.success('Sale deleted');
            navigate('/sales');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete sale');
        },
    });

    // ============ Loading ============
    if (saleQuery.isLoading) {
        return (
            <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
                <div className="h-6 shimmer rounded w-32"></div>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
                    <div className="h-8 shimmer rounded w-1/3"></div>
                    <div className="h-24 shimmer rounded"></div>
                    <div className="h-12 shimmer rounded"></div>
                </div>
            </div>
        );
    }

    // ============ Error ============
    if (saleQuery.isError || !saleQuery.data) {
        return (
            <div className="p-4 md:p-6 max-w-3xl mx-auto">
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

    const sale = saleQuery.data.data;
    const payments = paymentsQuery.data?.data ?? [];
    const hasDue = sale.dueAmount > 0;

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
            {/* Back */}
            <Link
                to="/sales"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition"
            >
                <ArrowLeft size={16} />
                Back to Sales
            </Link>

            {/* ============ Hero Card ============ */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Sale #{sale.id}
                        </h1>
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1">
                                <UserIcon size={14} />
                                <Link to={`/customers/${sale.customerId}`} className="hover:text-green-600">
                                    {sale.customerName}
                                </Link>
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDateLong(sale.date)}
                            </span>
                        </div>
                    </div>
                    <SaleStatusBadge paidAmount={sale.paidAmount} dueAmount={sale.dueAmount} />
                </div>

                {/* Product block */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                            {sale.categoryName}
                            {sale.categoryNameBn && ` · ${sale.categoryNameBn}`}
                        </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-sm text-blue-900">
                            {sale.quantity} {sale.unitAbbreviation || sale.unitName} ×{' '}
                            {formatCurrency(sale.unitPrice)}
                        </span>
                        <span className="text-2xl font-bold text-blue-900">
                            {formatCurrency(sale.totalAmount)}
                        </span>
                    </div>
                </div>

                {/* Payment summary */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-green-50 rounded-xl p-3">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                            Paid
                        </div>
                        <div className="text-lg font-bold text-green-700 mt-0.5">
                            {formatCurrency(sale.paidAmount)}
                        </div>
                    </div>
                    <div className={`rounded-xl p-3 ${hasDue ? 'bg-amber-50' : 'bg-gray-50'}`}>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                            Due
                        </div>
                        <div className={`text-lg font-bold mt-0.5 ${hasDue ? 'text-amber-700' : 'text-gray-400'}`}>
                            {formatCurrency(sale.dueAmount)}
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {sale.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
                            Notes
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {sale.notes}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-gray-100">
                    {hasDue && (
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
                        >
                            <Plus size={16} />
                            Record Payment
                        </button>
                    )}

                    <Link
                        to={`/sales/${sale.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                    >
                        <Pencil size={16} />
                        Edit
                    </Link>

                    {!confirmDeleteSale && (
                        <button
                            onClick={() => setConfirmDeleteSale(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 transition ml-auto"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    )}
                </div>

                {/* Delete confirmation */}
                {confirmDeleteSale && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800 font-medium">Delete this sale?</p>
                        <p className="text-xs text-red-600 mt-1">
                            {sale.paidAmount > 0
                                ? 'This sale has payments recorded. You must delete all payments first.'
                                : 'This cannot be undone.'}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                            <button
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
                                onClick={() => setConfirmDeleteSale(false)}
                                disabled={deleteMutation.isPending}
                                className="text-sm px-3 py-1.5 rounded-lg text-gray-700 hover:bg-white disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ============ Payment History ============ */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Wallet size={14} />
                        Payment History
                    </h2>
                    <span className="text-xs text-gray-400">
                        {payments.length} {payments.length === 1 ? 'payment' : 'payments'}
                    </span>
                </div>

                {paymentsQuery.isLoading ? (
                    <div className="space-y-2">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-14 shimmer rounded"></div>
                        ))}
                    </div>
                ) : payments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">
                        No payments recorded yet.
                    </p>
                ) : (
                    <div>
                        {payments.map((payment) => (
                            <PaymentRow key={payment.id} payment={payment} saleId={sale.id} />
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <RecordPaymentModal
                    sale={sale}
                    onClose={() => setShowPaymentModal(false)}
                />
            )}
        </div>
    );
}