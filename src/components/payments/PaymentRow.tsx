import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePayment } from '@/api/payments';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency, formatDateShort } from '@/lib/format';
import type { Payment } from '@/types';
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_COLORS, PAYMENT_METHOD_EMOJI } from '@/types';

interface Props {
    payment: Payment;
    saleId: number;
}

export function PaymentRow({ payment, saleId }: Props) {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const mutation = useMutation({
        mutationFn: () => deletePayment(payment.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            toast.success('Payment deleted');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete payment');
        },
    });

    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
            {/* Emoji icon */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 ${PAYMENT_METHOD_COLORS[payment.method]}`}>
                {PAYMENT_METHOD_EMOJI[payment.method]}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                    </span>
                    <span className="text-xs text-gray-500 shrink-0">
                        {formatDateShort(payment.date)}
                    </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                    {PAYMENT_METHOD_LABELS[payment.method]}
                    {payment.notes && ` · ${payment.notes}`}
                </div>
            </div>

            {/* Delete */}
            <div className="shrink-0">
                {!confirmDelete ? (
                    <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete payment"
                    >
                        <Trash2 size={14} />
                    </button>
                ) : (
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => mutation.mutate()}
                            disabled={mutation.isPending}
                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1"
                        >
                            {mutation.isPending ? (
                                <Loader2 size={10} className="animate-spin" />
                            ) : (
                                'Confirm'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(false)}
                            disabled={mutation.isPending}
                            className="text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded disabled:opacity-50"
                        >
                            No
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}