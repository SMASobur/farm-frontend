import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { listCategories } from '@/api/categories';
import { listWorkers } from '@/api/workers';
import type { Expense, ExpenseRequest, Worker } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';

function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}

interface Props {
    initial?: Expense;
    onSubmit: (data: ExpenseRequest) => Promise<void>;
    onDelete?: () => Promise<void>;
    mode: 'create' | 'edit';
    cancelTo: string;
}

export function ExpenseForm({ initial, onSubmit, onDelete, mode, cancelTo }: Props) {
    const navigate = useNavigate();

    const [date, setDate] = useState(initial?.date ?? todayISO());
    const [categoryId, setCategoryId] = useState<number | null>(initial?.categoryId ?? null);
    const [workerId, setWorkerId] = useState<number | null>(initial?.workerId ?? null);
    const [description, setDescription] = useState(initial?.description ?? '');
    const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '');
    const [notes, setNotes] = useState(initial?.notes ?? '');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Lookups
    const categoriesQuery = useQuery({
        queryKey: ['categories', 'EXPENSE'],
        queryFn: () => listCategories('EXPENSE', true),
    });

    const workersQuery = useQuery({
        queryKey: ['workers', 'ACTIVE'],
        queryFn: () => listWorkers({ status: 'ACTIVE' }),
    });

    const categories = categoriesQuery.data?.data ?? [];
    const workers: Worker[] = workersQuery.data?.data ?? [];

    // Is the selected category SALARY?
    const selectedCategory = categories.find((c) => c.id === categoryId);
    const isSalaryCategory = selectedCategory?.code === 'SALARY';

    const clearError = (field: string) => {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const validate = (): boolean => {
        const next: Record<string, string> = {};
        if (categoryId === null) next.categoryId = 'Category is required';
        if (!description.trim()) next.description = 'Description is required';
        const amt = parseFloat(amount);
        if (!amt || amt <= 0) next.amount = 'Amount must be positive';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        if (!validate()) return;

        setSaving(true);
        try {
            const payload: ExpenseRequest = {
                date,
                categoryId: categoryId!,
                description: description.trim(),
                amount: parseFloat(amount),
                notes: notes.trim() || undefined,
                // Only send workerId for SALARY category
                workerId: isSalaryCategory && workerId ? workerId : undefined,
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

    const isLoading = categoriesQuery.isLoading || workersQuery.isLoading;

    if (isLoading) {
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Date" htmlFor="date" required>
                    <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        max={todayISO()}
                    />
                </Field>

                <Field label="Category" htmlFor="categoryId" required error={errors.categoryId}>
                    <Select
                        id="categoryId"
                        value={categoryId ?? ''}
                        onChange={(e) => {
                            setCategoryId(e.target.value ? Number(e.target.value) : null);
                            clearError('categoryId');
                        }}
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
            </div>

            {/* Worker link — only shown for SALARY category */}
            {isSalaryCategory && (
                <Field
                    label="Worker"
                    htmlFor="workerId"
                    help="Optional — link this salary to a specific worker"
                >
                    <Select
                        id="workerId"
                        value={workerId ?? ''}
                        onChange={(e) => setWorkerId(e.target.value ? Number(e.target.value) : null)}
                    >
                        <option value="">— Not linked —</option>
                        {workers.map((w) => (
                            <option key={w.id} value={w.id}>
                                {w.name}
                                {w.role ? ` · ${w.role}` : ''}
                            </option>
                        ))}
                    </Select>
                </Field>
            )}

            <Field label="Description" htmlFor="description" required error={errors.description}>
                <Input
                    id="description"
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); clearError('description'); }}
                    placeholder="e.g., Cow feed - 50kg"
                    hasError={!!errors.description}
                    autoComplete="off"
                />
            </Field>

            <Field label="Amount" htmlFor="amount" required error={errors.amount}>
                <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); clearError('amount'); }}
                    placeholder="0.00"
                    hasError={!!errors.amount}
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
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <><Loader2 size={18} className="animate-spin" />{mode === 'create' ? 'Creating…' : 'Saving…'}</>
                    ) : (
                        <><Save size={18} />{mode === 'create' ? 'Record Expense' : 'Save Changes'}</>
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
                            Delete this expense
                        </button>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800 font-medium">Delete this expense?</p>
                            <p className="text-xs text-red-600 mt-1">This cannot be undone.</p>
                            <div className="flex items-center gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1.5"
                                >
                                    {deleting ? (
                                        <><Loader2 size={14} className="animate-spin" />Deleting…</>
                                    ) : (
                                        <><Trash2 size={14} />Yes, delete</>
                                    )}
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