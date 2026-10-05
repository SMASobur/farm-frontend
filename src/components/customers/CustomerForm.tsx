import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save, Trash2 } from 'lucide-react';
import type { Customer, CustomerRequest, CustomerType } from '@/types';
import { CUSTOMER_TYPE_LABELS } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';

const TYPE_OPTIONS: CustomerType[] = [
    'HOUSEHOLD', 'SHOP', 'TEA_STALL', 'RESTAURANT', 'WHOLESALER', 'OTHER'
];

interface Props {
    initial?: Customer;
    onSubmit: (data: CustomerRequest) => Promise<void>;
    onDelete?: () => Promise<void>;
    mode: 'create' | 'edit';
}

export function CustomerForm({ initial, onSubmit, onDelete, mode }: Props) {
    const navigate = useNavigate();

    const [form, setForm] = useState<CustomerRequest>({
        name: initial?.name ?? '',
        phone: initial?.phone ?? '',
        address: initial?.address ?? '',
        type: initial?.type ?? 'HOUSEHOLD',
        notes: initial?.notes ?? '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const update = (field: keyof CustomerRequest, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const validate = (): boolean => {
        const next: Record<string, string> = {};
        if (!form.name.trim()) next.name = 'Name is required';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        if (!validate()) return;

        setSaving(true);
        try {
            const payload: CustomerRequest = {
                name: form.name.trim(),
                phone: form.phone?.trim() || undefined,
                address: form.address?.trim() || undefined,
                type: form.type,
                notes: form.notes?.trim() || undefined,
            };
            await onSubmit(payload);
        } catch (err: any) {
            setSubmitError(err.response?.data?.message || 'Something went wrong');
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
        }
    };

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
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="e.g., Rahim Uddin"
                    hasError={!!errors.name}
                    autoFocus={mode === 'create'}
                    autoComplete="off"
                />
            </Field>

            <Field label="Phone" htmlFor="phone" help="Optional — unique per farm">
                <Input
                    id="phone"
                    type="tel"
                    value={form.phone ?? ''}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="e.g., 01712345678"
                    autoComplete="off"
                />
            </Field>

            <Field label="Type" htmlFor="type">
                <Select
                    id="type"
                    value={form.type}
                    onChange={(e) => update('type', e.target.value)}
                >
                    {TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>{CUSTOMER_TYPE_LABELS[t]}</option>
                    ))}
                </Select>
            </Field>

            <Field label="Address" htmlFor="address" help="Optional">
                <Input
                    id="address"
                    value={form.address ?? ''}
                    onChange={(e) => update('address', e.target.value)}
                    placeholder="Village, District"
                    autoComplete="off"
                />
            </Field>

            <Field label="Notes" htmlFor="notes" help="Optional">
        <textarea
            id="notes"
            value={form.notes ?? ''}
            onChange={(e) => update('notes', e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base resize-none"
            placeholder="Any additional information"
        />
            </Field>

            <div className="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    disabled={saving || deleting}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <><Loader2 size={18} className="animate-spin" />{mode === 'create' ? 'Creating…' : 'Saving…'}</>
                    ) : (
                        <><Save size={18} />{mode === 'create' ? 'Create Customer' : 'Save Changes'}</>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/customers')}
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
                                This cannot be undone. Deletion is blocked if the customer has any sales.
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
                                    className="text-sm px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
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