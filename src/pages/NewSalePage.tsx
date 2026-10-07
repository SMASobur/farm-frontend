import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Save, AlertCircle } from 'lucide-react';
import { createSale } from '@/api/sales';
import { listCustomers } from '@/api/customers';
import { listCategories } from '@/api/categories';
import { listUnits } from '@/api/units';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency } from '@/lib/format';
import type { SaleRequest, PaymentMethod } from '@/types';
import { PAYMENT_METHOD_LABELS } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';

const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'BKASH', 'NAGAD', 'ROCKET', 'BANK', 'OTHER'];

function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}

export function NewSalePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    // ============ Form State ============
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [date, setDate] = useState(todayISO());
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [unitId, setUnitId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [notes, setNotes] = useState('');
    const [initialPayment, setInitialPayment] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');

    // ============ Lookup Data ============
    const customersQuery = useQuery({
        queryKey: ['customers', 'all'],
        queryFn: () => listCustomers(),
    });

    const categoriesQuery = useQuery({
        queryKey: ['categories', 'PRODUCT'],
        queryFn: () => listCategories('PRODUCT', true),
    });

    const unitsQuery = useQuery({
        queryKey: ['units'],
        queryFn: () => listUnits(true),
    });

    const customers = customersQuery.data?.data ?? [];
    const categories = categoriesQuery.data?.data ?? [];
    const units = unitsQuery.data?.data ?? [];

    // ============ Live Calculations ============
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    const total = qty * price;
    const paid = parseFloat(initialPayment) || 0;
    const due = Math.max(0, total - paid);

    // ============ Auto-fill on Category Change ============
    const handleCategoryChange = (newCategoryId: number) => {
        setCategoryId(newCategoryId);
        const cat = categories.find((c) => c.id === newCategoryId);
        if (cat) {
            // Auto-select unit if category has a default
            if (cat.defaultUnitId) {
                setUnitId(cat.defaultUnitId);
            }
            // Auto-fill price if category has a default
            if (cat.defaultPrice && !unitPrice) {
                setUnitPrice(String(cat.defaultPrice));
            }
        }
        if (errors.categoryId) clearError('categoryId');
    };

    const clearError = (field: string) => {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    // ============ Validation ============
    const validate = (): boolean => {
        const next: Record<string, string> = {};
        if (customerId === null) next.customerId = 'Customer is required';
        if (categoryId === null) next.categoryId = 'Category is required';
        if (unitId === null) next.unitId = 'Unit is required';
        if (!qty || qty <= 0) next.quantity = 'Quantity must be positive';
        if (!price || price <= 0) next.unitPrice = 'Unit price must be positive';
        if (paid < 0) next.initialPayment = 'Payment cannot be negative';
        if (paid > total) next.initialPayment = 'Payment cannot exceed total';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    // ============ Mutation ============
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
            const msg = err.response?.data?.message || 'Failed to record sale';
            setSubmitError(msg);
            toast.error(msg);
        },
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        if (!validate()) return;

        const payload: SaleRequest = {
            customerId: customerId!,
            date,
            categoryId: categoryId!,
            unitId: unitId!,
            quantity: qty,
            unitPrice: price,
            notes: notes.trim() || undefined,
            initialPayment: paid > 0 ? paid : undefined,
            initialPaymentMethod: paid > 0 ? paymentMethod : undefined,
        };

        await mutation.mutateAsync(payload);
    };

    const isLoading = customersQuery.isLoading || categoriesQuery.isLoading || unitsQuery.isLoading;
    const loadError = customersQuery.isError || categoriesQuery.isError || unitsQuery.isError;

    // ============ Render: Loading ============
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

    // ============ Render: Load Error ============
    if (loadError) {
        return (
            <div className="p-4 md:p-6 max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Failed to load form data</p>
                    <p className="text-sm text-red-600 mt-2">
                        Could not load customers, categories, or units.
                    </p>
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

    // ============ Render: Form ============
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

                <form onSubmit={handleSubmit} className="space-y-5">
                    {submitError && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
                            {submitError}
                        </div>
                    )}

                    {/* Customer + Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Customer" htmlFor="customerId" required error={errors.customerId}>
                            <Select
                                id="customerId"
                                value={customerId ?? ''}
                                onChange={(e) => {
                                    setCustomerId(e.target.value ? Number(e.target.value) : null);
                                    clearError('customerId');
                                }}
                                hasError={!!errors.customerId}
                            >
                                <option value="">Select customer…</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                        {c.phone ? ` (${c.phone})` : ''}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Date" htmlFor="date" required>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                max={todayISO()}
                            />
                        </Field>
                    </div>

                    {/* Category */}
                    <Field
                        label="Category"
                        htmlFor="categoryId"
                        required
                        error={errors.categoryId}
                        help="What product is being sold?"
                    >
                        <Select
                            id="categoryId"
                            value={categoryId ?? ''}
                            onChange={(e) => handleCategoryChange(Number(e.target.value))}
                            hasError={!!errors.categoryId}
                        >
                            <option value="">Select category…</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                    {c.nameBn ? ` · ${c.nameBn}` : ''}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    {/* Unit + Quantity + Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Unit" htmlFor="unitId" required error={errors.unitId}>
                            <Select
                                id="unitId"
                                value={unitId ?? ''}
                                onChange={(e) => {
                                    setUnitId(e.target.value ? Number(e.target.value) : null);
                                    clearError('unitId');
                                }}
                                hasError={!!errors.unitId}
                            >
                                <option value="">Unit…</option>
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Quantity" htmlFor="quantity" required error={errors.quantity}>
                            <Input
                                id="quantity"
                                type="number"
                                step="0.001"
                                min="0"
                                value={quantity}
                                onChange={(e) => {
                                    setQuantity(e.target.value);
                                    clearError('quantity');
                                }}
                                placeholder="0"
                                hasError={!!errors.quantity}
                            />
                        </Field>

                        <Field label="Price / Unit" htmlFor="unitPrice" required error={errors.unitPrice}>
                            <Input
                                id="unitPrice"
                                type="number"
                                step="0.01"
                                min="0"
                                value={unitPrice}
                                onChange={(e) => {
                                    setUnitPrice(e.target.value);
                                    clearError('unitPrice');
                                }}
                                placeholder="0.00"
                                hasError={!!errors.unitPrice}
                            />
                        </Field>
                    </div>

                    {/* Total Display */}
                    {total > 0 && (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-green-900">Total</span>
                            <span className="text-2xl font-bold text-green-900">
                                {formatCurrency(total)}
                            </span>
                        </div>
                    )}

                    {/* Initial Payment */}
                    <div className="border-t pt-5 mt-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Payment (Optional)
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                label="Paid Now"
                                htmlFor="initialPayment"
                                error={errors.initialPayment}
                                help="Leave empty if unpaid"
                            >
                                <Input
                                    id="initialPayment"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={initialPayment}
                                    onChange={(e) => {
                                        setInitialPayment(e.target.value);
                                        clearError('initialPayment');
                                    }}
                                    placeholder="0.00"
                                    hasError={!!errors.initialPayment}
                                />
                            </Field>

                            {paid > 0 && (
                                <Field label="Payment Method" htmlFor="paymentMethod">
                                    <Select
                                        id="paymentMethod"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                    >
                                        {PAYMENT_METHODS.map((m) => (
                                            <option key={m} value={m}>
                                                {PAYMENT_METHOD_LABELS[m]}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>
                            )}
                        </div>

                        {/* Due Display */}
                        {total > 0 && paid > 0 && (
                            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center justify-between">
                                <span className="text-sm text-amber-900">
                                    Remaining due
                                </span>
                                <span className="text-lg font-bold text-amber-900">
                                    {formatCurrency(due)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <Field label="Notes" htmlFor="notes" help="Optional">
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base resize-none"
                            placeholder="Anything to remember about this sale"
                        />
                    </Field>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Recording…
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Record Sale
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/sales')}
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