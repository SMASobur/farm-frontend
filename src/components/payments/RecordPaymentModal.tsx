import { useState, type FormEvent, useEffect } from 'react';
import { Loader2, X, CheckCircle2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPayment } from '@/api/payments';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency } from '@/lib/format';
import type { PaymentMethod, PaymentRequest, Sale } from '@/types';
import { PAYMENT_METHOD_LABELS } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';

const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'BKASH', 'NAGAD', 'ROCKET', 'BANK', 'OTHER'];

interface Props {
    sale: Sale;
    onClose: () => void;
}

function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}

export function RecordPaymentModal({ sale, onClose }: Props) {
    const queryClient = useQueryClient();
    const toast = useToast();

    const remaining = sale.dueAmount;

    const [amount, setAmount] = useState(String(remaining));
    const [date, setDate] = useState(todayISO());
    const [method, setMethod] = useState<PaymentMethod>('CASH');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    // Prevent body scroll while modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const mutation = useMutation({
        mutationFn: (data: PaymentRequest) => createPayment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sale', sale.id] });
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            queryClient.invalidateQueries({ queryKey: ['customer', sale.customerId] });
            toast.success('Payment recorded');
            onClose();
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || 'Failed to record payment';
            setError(msg);
            toast.error(msg);
        },
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        const amt = parseFloat(amount);
        if (!amt || amt <= 0) {
            setError('Amount must be positive');
            return;
        }
        if (amt > remaining) {
            setError(`Amount cannot exceed remaining due (${formatCurrency(remaining)})`);
            return;
        }

        await mutation.mutateAsync({
            saleId: sale.id,
            amount: amt,
            date,
            method,
            notes: notes.trim() || undefined,
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Record Payment</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Summary */}
                <div className="p-4 bg-green-50 border-b border-green-100">
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <div className="text-xs text-gray-500">Total</div>
                            <div className="text-sm font-bold text-gray-900">
                                {formatCurrency(sale.totalAmount)}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Paid</div>
                            <div className="text-sm font-bold text-green-700">
                                {formatCurrency(sale.paidAmount)}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Remaining</div>
                            <div className="text-sm font-bold text-amber-700">
                                {formatCurrency(remaining)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <Field label="Amount" htmlFor="amount" required>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={remaining}
                            value={amount}
                            onChange={(e) => { setAmount(e.target.value); setError(''); }}
                            autoFocus
                            placeholder="0.00"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            Maximum: {formatCurrency(remaining)}
                        </div>
                    </Field>

                    <Field label="Date" htmlFor="paymentDate" required>
                        <Input
                            id="paymentDate"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={todayISO()}
                        />
                    </Field>

                    <Field label="Payment Method" htmlFor="method">
                        <Select
                            id="method"
                            value={method}
                            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                        >
                            {PAYMENT_METHODS.map((m) => (
                                <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Notes" htmlFor="paymentNotes" help="Optional">
                        <Input
                            id="paymentNotes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Clearance payment"
                        />
                    </Field>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition inline-flex items-center justify-center gap-2"
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Recording…
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={18} />
                                    Record Payment
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={mutation.isPending}
                            className="px-4 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}