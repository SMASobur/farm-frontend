import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { listCustomerTypes } from '@/api/customerTypes';
import type { Customer, CustomerRequest } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { CustomerTypeSelect } from '@/components/forms/CustomerTypeSelect';

interface Props {
    initial?: Customer;
    onSubmit: (data: CustomerRequest) => Promise<void>;
    onDelete?: () => Promise<void>;
    mode: 'create' | 'edit';
    cancelTo?: string;
}

export function CustomerForm({ initial, onSubmit, onDelete, mode, cancelTo = '/customers' }: Props) {
    const navigate = useNavigate();

    const [name, setName] = useState(initial?.name ?? '');
    const [phone, setPhone] = useState(initial?.phone ?? '');
    const [address, setAddress] = useState(initial?.address ?? '');
    const [customerTypeId, setCustomerTypeId] = useState<number | null>(initial?.customerTypeId ?? null);
    const [customTypeName, setCustomTypeName] = useState('');
    const [saveCustomType, setSaveCustomType] = useState(false);
    const [notes, setNotes] = useState(initial?.notes ?? '');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const customerTypesQuery = useQuery({
        queryKey: ['customer-types'],
        queryFn: () => listCustomerTypes(true),
    });
    const customerTypes = customerTypesQuery.data?.data ?? [];

    const clearError = (field: string) => {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const validate = (): boolean => {
        const next: Record<string, string> = {};
        if (!name.trim()) next.name = 'Name is required';

        const selectedType = customerTypes.find((t) => t.id === customerTypeId);
        const isOther = selectedType?.code === 'OTHER';
        if (isOther && !customTypeName.trim()) {
            next.customerTypeId = 'Please specify the customer type';
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
            const selectedType = customerTypes.find((t) => t.id === customerTypeId);
            const isOther = selectedType?.code === 'OTHER';

            const payload: CustomerRequest = {
                name: name.trim(),
                phone: phone.trim() || undefined,
                address: address.trim() || undefined,
                // Send customerTypeId ONLY when not in Other mode
                customerTypeId: isOther ? undefined : (customerTypeId ?? undefined),
                // Send customTypeName ONLY when in Other mode
                customTypeName: isOther ? customTypeName.trim() || undefined : undefined,
                saveCustomType: isOther && customTypeName.trim() ? saveCustomType : undefined,
                notes: notes.trim() || undefined,
            };
            await onSubmit(payload);
        } catch (err: any) {
            setSubmitError(err.response?.data?.message || 'Something went wrong');
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete) return;
        setDeleting(true);
        try {
            await onDelete();
        } catch (err: any) {
            setSubmitError(err.response?.data?.message || 'Failed to delete');
            setDeleting(false);
            setConfirmDelete(false);
            throw err;
        }
    };

    if (customerTypesQuery.isLoading) {
        return (
            <div className="space-y-5">
                {[1, 2, 3, 4].map((i) => (
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

            <Field label="Name" htmlFor="name" required error={errors.name}>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); clearError('name'); }}
                    placeholder="e.g., Abdur Rahim"
                    hasError={!!errors.name}
                    autoFocus={mode === 'create'}
                    autoComplete="off"
                />
            </Field>

            <Field label="Phone" htmlFor="phone" help="Optional — unique per farm">
                <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., 01712345678"
                    autoComplete="off"
                />
            </Field>

            <CustomerTypeSelect
                customerTypes={customerTypes}
                value={customerTypeId}
                customTypeName={customTypeName}
                saveCustom={saveCustomType}
                onChange={(id, customName, save) => {
                    setCustomerTypeId(id);
                    setCustomTypeName(customName);
                    setSaveCustomType(save);
                    clearError('customerTypeId');
                }}
                required
                error={errors.customerTypeId}
                hasError={!!errors.customerTypeId}
            />

            <Field label="Address" htmlFor="address" help="Optional">
                <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Village, District"
                    autoComplete="off"
                />
            </Field>

            <Field label="Notes" htmlFor="notes" help="Optional">
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base resize-none"
                    placeholder="Any additional information"
                />
            </Field>

            <div className="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    disabled={saving || deleting}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 active:bg-green-800 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <><Loader2 size={18} className="animate-spin" />{mode === 'create' ? 'Creating…' : 'Saving…'}</>
                    ) : (
                        <><Save size={18} />{mode === 'create' ? 'Create Customer' : 'Save Changes'}</>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => navigate(cancelTo)}
                    disabled={saving || deleting}
                    className="px-4 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
                >
                    Cancel
                </button>
            </div>

            {mode === 'edit' && onDelete && (
                <div className="border-t pt-5 mt-5">
                    {!confirmDelete ? (
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium inline-flex items-center gap-1.5"
                        >
                            <Trash2 size={14} />
                            Delete this customer
                        </button>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800 font-medium">Delete this customer?</p>
                            <p className="text-xs text-red-600 mt-1">
                                Deletion is blocked if the customer has any sales.
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1.5"
                                >
                                    {deleting ? <><Loader2 size={14} className="animate-spin" />Deleting…</> : <><Trash2 size={14} />Yes, delete</>}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(false)}
                                    disabled={deleting}
                                    className="text-sm px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </form>
    );
}