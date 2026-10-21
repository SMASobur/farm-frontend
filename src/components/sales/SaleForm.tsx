import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Save, AlertTriangle } from 'lucide-react';
import { listCustomers } from '@/api/customers';
import { listCategories } from '@/api/categories';
import { listUnits } from '@/api/units';
import { getPoolsStatus } from '@/api/pools';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { PaymentMethod, Sale, SaleRequest } from '@/types';
import { PAYMENT_METHOD_LABELS } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { CustomerCombobox } from '@/components/forms/CustomerCombobox';
import { CategorySelect } from '@/components/forms/CategorySelect';
import { UnitSelect } from '@/components/forms/UnitSelect';

const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'BKASH', 'NAGAD', 'ROCKET', 'BANK', 'OTHER'];

function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}

interface Props {
    initial?: Sale;
    onSubmit: (data: SaleRequest) => Promise<void>;
    mode: 'create' | 'edit';
    cancelTo: string;
}

export function SaleForm({ initial, onSubmit, mode, cancelTo }: Props) {
    const navigate = useNavigate();

    // ============ Form State ============
    const [customerId, setCustomerId] = useState<number | null>(initial?.customerId ?? null);
    const [date, setDate] = useState(initial?.date ?? todayISO());

    // Category State (Fixing the missing fields from Image 2)
    const [categoryId, setCategoryId] = useState<number | null>(initial?.categoryId ?? null);
    const [customProductName, setCustomProductName] = useState(initial?.customProductName ?? '');
    const [customProductNameBn, setCustomProductNameBn] = useState('');
    const [customProductDefaultUnitId, setCustomProductDefaultUnitId] = useState<number | null>(null);
    const [saveCustomCategory, setSaveCustomCategory] = useState<boolean>(false);

    // Unit State
    const [unitId, setUnitId] = useState<number | null>(initial?.unitId ?? null);
    const [isCustomUnit, setIsCustomUnit] = useState<boolean>(false);
    const [customUnitName, setCustomUnitName] = useState<string>('');
    const [customUnitNameBn, setCustomUnitNameBn] = useState<string>('');
    const [customUnitAbbreviation, setCustomUnitAbbreviation] = useState<string>('');
    const [saveCustomUnit, setSaveCustomUnit] = useState<boolean>(false);

    // Pool State
    const [poolSpeciesId, setPoolSpeciesId] = useState<number | null>(initial?.poolSpeciesId ?? null);

    // Other fields
    const [quantity, setQuantity] = useState(initial?.quantity ? String(initial.quantity) : '');
    const [unitPrice, setUnitPrice] = useState(initial?.unitPrice ? String(initial.unitPrice) : '');
    const [notes, setNotes] = useState(initial?.notes ?? '');
    const [initialPayment, setInitialPayment] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [saving, setSaving] = useState(false);

    const isEdit = mode === 'edit';
    const alreadyPaid = initial?.paidAmount ?? 0;
    const canAddInitialPayment = !isEdit;

    // ============ Lookups ============
    const customersQuery = useQuery({ queryKey: ['customers', 'all'], queryFn: () => listCustomers() });
    const categoriesQuery = useQuery({ queryKey: ['categories', 'PRODUCT'], queryFn: () => listCategories('PRODUCT', true) });
    const unitsQuery = useQuery({ queryKey: ['units'], queryFn: () => listUnits(true) });
    const poolsQuery = useQuery({ queryKey: ['pools', date], queryFn: () => getPoolsStatus(date) });

    const customers = customersQuery.data?.data ?? [];
    const categories = categoriesQuery.data?.data ?? [];
    const units = unitsQuery.data?.data ?? [];
    const allPools = poolsQuery.data?.data ?? [];

    // ============ Derived ============
    const selectedCategory = categories.find((c) => c.id === categoryId);
    const isOtherCategory = selectedCategory?.code === 'OTHER';

    // Pool logic
    const requiresPool = selectedCategory?.code === 'MILK' || selectedCategory?.code === 'EGG';
    const requiredPoolType = selectedCategory?.code === 'MILK' ? 'MILK' : 'EGG';
    const availablePools = allPools.filter(p => p.poolProductType === requiredPoolType);
    const selectedPool = availablePools.find(p => p.poolSpeciesId === poolSpeciesId);

    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    const total = qty * price;
    const paid = parseFloat(initialPayment) || 0;
    const remainingDue = Math.max(0, total - paid);

    // ============ Helpers ============
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
        if (unitId === null && !customUnitName.trim()) next.unitId = 'Unit is required';
        if (!qty || qty <= 0) next.quantity = 'Quantity must be positive';
        if (!price || price <= 0) next.unitPrice = 'Unit price must be positive';

        // Pool Validation
        if (requiresPool && poolSpeciesId === null) {
            next.poolSpeciesId = `Please select a ${requiredPoolType} pool`;
        } else if (requiresPool && selectedPool && qty > selectedPool.available) {
            next.quantity = `Only ${selectedPool.available} available in this pool`;
        }

        if (isOtherCategory && !customProductName.trim()) {
            next.customProductName = 'Please specify what you are selling';
        }

        if (canAddInitialPayment) {
            if (paid < 0) next.initialPayment = 'Payment cannot be negative';
            if (paid > total) next.initialPayment = 'Payment cannot exceed total';
        }

        // Edit mode validation
        if (isEdit && total < alreadyPaid) {
            next.unitPrice = `Total cannot be less than already-paid (${formatCurrency(alreadyPaid)})`;
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        if (!validate()) return;

        setSaving(true);
        try {
            const payload: SaleRequest = {
                customerId: customerId!,
                date,
                categoryId: categoryId!,
                unitId: unitId ?? undefined,
                customUnitName: isCustomUnit ? customUnitName.trim() : undefined,
                customUnitNameBn: isCustomUnit ? customUnitNameBn.trim() : undefined,
                customUnitAbbreviation: isCustomUnit ? customUnitAbbreviation.trim() : undefined,
                saveCustomUnitToUnits: isCustomUnit ? saveCustomUnit : undefined,
                //customUnitName: customUnitName.trim() || undefined,
                //saveCustomUnitToUnits: saveCustomUnit,
                quantity: qty,
                unitPrice: price,
                customProductName: isOtherCategory ? customProductName.trim() : undefined,
                customProductNameBn: isOtherCategory ? customProductNameBn.trim() : undefined,
                customProductDefaultUnitId: isOtherCategory ? (customProductDefaultUnitId ?? undefined) : undefined,
                saveCustomProductAsCategory: saveCustomCategory,
                notes: notes.trim() || undefined,
                initialPayment: canAddInitialPayment && paid > 0 ? paid : undefined,
                initialPaymentMethod: canAddInitialPayment && paid > 0 ? paymentMethod : undefined,
                poolSpeciesId: requiresPool ? poolSpeciesId! : undefined,
                poolProductType: requiresPool ? requiredPoolType : undefined,
            };
            await onSubmit(payload);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setSubmitError(error.response?.data?.message || 'Something went wrong');
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const isLoading = customersQuery.isLoading || categoriesQuery.isLoading || unitsQuery.isLoading || poolsQuery.isLoading;

    if (isLoading) {
        return (
            <div className="space-y-5">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-4 shimmer rounded w-24"></div>
                        <div className="h-11 shimmer rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {submitError && (
                <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
                    {submitError}
                </div>
            )}

            {/* Customer + Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Customer" htmlFor="customerId" required error={errors.customerId} help={isEdit ? 'Cannot be changed' : undefined}>
                    <CustomerCombobox
                        customers={customers}
                        value={customerId}
                        onChange={(id) => { setCustomerId(id); clearError('customerId'); }}
                        disabled={isEdit}
                        hasError={!!errors.customerId}
                    />
                </Field>

                <Field label="Date" htmlFor="date" required>
                    <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => { setDate(e.target.value); setPoolSpeciesId(null); }}
                        max={todayISO()}
                    />
                </Field>
            </div>

            {/* Category */}
            <CategorySelect
                categories={categories}
                units={units}
                value={categoryId}
                customProductName={customProductName}
                customProductNameBn={customProductNameBn}
                customProductDefaultUnitId={customProductDefaultUnitId}
                saveCustom={saveCustomCategory}
                onChange={(id, customName, customNameBn, defaultUnitId, save) => {
                    setCategoryId(id);
                    setCustomProductName(customName);
                    setCustomProductNameBn(customNameBn);
                    setCustomProductDefaultUnitId(defaultUnitId);
                    setSaveCustomCategory(save);
                    setPoolSpeciesId(null);
                    clearError('categoryId');

                    const selectedCat = categories.find(c => c.id === id);
                    if (selectedCat?.code === 'MILK') {
                        const literUnit = units.find(u => u.code === 'L' || u.name.toLowerCase().includes('liter'));
                        if (literUnit) setUnitId(literUnit.id);
                    } else if (selectedCat?.code === 'EGG') {
                        const pieceUnit = units.find(u => u.code === 'PCS' || u.name.toLowerCase().includes('piece'));
                        if (pieceUnit) setUnitId(pieceUnit.id);
                    }
                }}
                required
                error={errors.categoryId}
                hasError={!!errors.categoryId}
            />

            {/* POOL SELECTION */}
            {requiresPool && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <Field
                        label={`Which ${requiredPoolType.toLowerCase()} pool are you selling from?`}
                        htmlFor="poolSpeciesId"
                        required
                        error={errors.poolSpeciesId}
                    >
                        <Select
                            id="poolSpeciesId"
                            value={poolSpeciesId ?? ''}
                            onChange={(e) => {
                                setPoolSpeciesId(e.target.value ? Number(e.target.value) : null);
                                clearError('poolSpeciesId');
                            }}
                            hasError={!!errors.poolSpeciesId}
                        >
                            <option value="">Select pool…</option>
                            {availablePools.map((pool) => (
                                <option key={pool.poolSpeciesId} value={pool.poolSpeciesId}>
                                    {pool.poolProductTypeLabel} · {formatNumber(pool.available, requiredPoolType === 'MILK' ? 1 : 0)} available
                                </option>
                            ))}
                        </Select>
                    </Field>

                    {availablePools.length === 0 && (
                        <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                            <AlertTriangle size={12} />
                            No {requiredPoolType.toLowerCase()} produced today. Record production first.
                        </p>
                    )}

                    {selectedPool && (
                        <p className="text-xs text-blue-800 mt-2 font-medium">
                            Available in this pool: {formatNumber(selectedPool.available, requiredPoolType === 'MILK' ? 1 : 0)}
                        </p>
                    )}
                </div>
            )}

            {/* Unit + Quantity + Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <UnitSelect
                    units={units}
                    value={unitId}
                    isOther={isCustomUnit}
                    customName={customUnitName}
                    customNameBn={customUnitNameBn}
                    customAbbreviation={customUnitAbbreviation}
                    saveCustom={saveCustomUnit}
                    onChange={(id, other, name, nameBn, abbrev, save) => {
                        setUnitId(id);
                        setIsCustomUnit(other);
                        setCustomUnitName(name);
                        setCustomUnitNameBn(nameBn);
                        setCustomUnitAbbreviation(abbrev);
                        setSaveCustomUnit(save);
                        clearError('unitId');
                    }}
                    required
                    error={errors.unitId}
                    hasError={!!errors.unitId}
                />

                <Field label="Quantity" htmlFor="quantity" required error={errors.quantity}>
                    <Input
                        id="quantity"
                        type="number"
                        step="0.001"
                        min="0"
                        value={quantity}
                        onChange={(e) => { setQuantity(e.target.value); clearError('quantity'); }}
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
                        onChange={(e) => { setUnitPrice(e.target.value); clearError('unitPrice'); }}
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

            {/* Edit mode: already-paid info */}
            {isEdit && alreadyPaid > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-900">
                    <strong>{formatCurrency(alreadyPaid)}</strong> already paid.
                    Total cannot be reduced below this amount.
                </div>
            )}

            {/* Create mode: initial payment */}
            {canAddInitialPayment && (
                <div className="border-t pt-5 mt-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Payment (Optional)
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Paid Now" htmlFor="initialPayment" error={errors.initialPayment} help="Leave empty if unpaid">
                            <Input
                                id="initialPayment"
                                type="number"
                                step="0.01"
                                min="0"
                                value={initialPayment}
                                onChange={(e) => { setInitialPayment(e.target.value); clearError('initialPayment'); }}
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

                    {total > 0 && paid > 0 && (
                        <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center justify-between">
                            <span className="text-sm text-amber-900">Remaining due</span>
                            <span className="text-lg font-bold text-amber-900">
                                {formatCurrency(remainingDue)}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Notes (Restored to fix unused variable) */}
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
                    disabled={saving}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <><Loader2 size={18} className="animate-spin" />{isEdit ? 'Saving…' : 'Recording…'}</>
                    ) : (
                        <><Save size={18} />{isEdit ? 'Save Changes' : 'Record Sale'}</>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => navigate(cancelTo)}
                    disabled={saving}
                    className="px-4 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}