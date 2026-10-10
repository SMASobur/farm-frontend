import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save, Trash2 } from 'lucide-react';
import type { Worker, WorkerRequest, WorkerStatus } from '@/types';
import { WORKER_STATUS_LABELS } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';

const STATUS_OPTIONS: WorkerStatus[] = ['ACTIVE', 'ON_LEAVE', 'INACTIVE', 'TERMINATED'];

interface Props {
    initial?: Worker;
    onSubmit: (data: WorkerRequest) => Promise<void>;
    onDelete?: () => Promise<void>;
    mode: 'create' | 'edit';
    cancelTo?: string;
}

export function WorkerForm({ initial, onSubmit, onDelete, mode, cancelTo = '/workers' }: Props) {
    const navigate = useNavigate();

    const [name, setName] = useState(initial?.name ?? '');
    const [phone, setPhone] = useState(initial?.phone ?? '');
    const [address, setAddress] = useState(initial?.address ?? '');
    const [role, setRole] = useState(initial?.role ?? '');
    const [monthlySalary, setMonthlySalary] = useState(initial?.monthlySalary ? String(initial.monthlySalary) : '');
    const [dailyWage, setDailyWage] = useState(initial?.dailyWage ? String(initial.dailyWage) : '');
    const [hireDate, setHireDate] = useState(initial?.hireDate ?? '');
    const [status, setStatus] = useState<WorkerStatus>(initial?.status ?? 'ACTIVE');
    const [notes, setNotes] = useState(initial?.notes ?? '');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

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
        if (monthlySalary && isNaN(parseFloat(monthlySalary))) next.monthlySalary = 'Invalid amount';
        if (dailyWage && isNaN(parseFloat(dailyWage))) next.dailyWage = 'Invalid amount';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        if (!validate()) return;

        setSaving(true);
        try {
            const payload: WorkerRequest = {
                name: name.trim(),
                phone: phone.trim() || undefined,
                address: address.trim() || undefined,
                role: role.trim() || undefined,
                monthlySalary: monthlySalary ? parseFloat(monthlySalary) : undefined,
                dailyWage: dailyWage ? parseFloat(dailyWage) : undefined,
                hireDate: hireDate || undefined,
                status,
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
                    placeholder="e.g., Karim Sheikh"
                    hasError={!!errors.name}
                    autoFocus={mode === 'create'}
                    autoComplete="off"
                />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Phone" htmlFor="phone" help="Optional — unique per farm">
                    <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01712345678"
                        autoComplete="off"
                    />
                </Field>

                <Field label="Role" htmlFor="role" help="e.g., Cow Herder, General">
                    <Input
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Cow Herder"
                        autoComplete="off"
                    />
                </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                    label="Monthly Salary"
                    htmlFor="monthlySalary"
                    error={errors.monthlySalary}
                    help="Leave empty if paid daily"
                >
                    <Input
                        id="monthlySalary"
                        type="number"
                        step="0.01"
                        min="0"
                        value={monthlySalary}
                        onChange={(e) => { setMonthlySalary(e.target.value); clearError('monthlySalary'); }}
                        placeholder="8000"
                        hasError={!!errors.monthlySalary}
                    />
                </Field>

                <Field
                    label="Daily Wage"
                    htmlFor="dailyWage"
                    error={errors.dailyWage}
                    help="Leave empty if salaried"
                >
                    <Input
                        id="dailyWage"
                        type="number"
                        step="0.01"
                        min="0"
                        value={dailyWage}
                        onChange={(e) => { setDailyWage(e.target.value); clearError('dailyWage'); }}
                        placeholder="500"
                        hasError={!!errors.dailyWage}
                    />
                </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Hire Date" htmlFor="hireDate" help="Optional">
                    <Input
                        id="hireDate"
                        type="date"
                        value={hireDate}
                        onChange={(e) => setHireDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                    />
                </Field>

                <Field label="Status" htmlFor="status">
                    <Select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as WorkerStatus)}
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{WORKER_STATUS_LABELS[s]}</option>
                        ))}
                    </Select>
                </Field>
            </div>

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
                        <><Save size={18} />{mode === 'create' ? 'Create Worker' : 'Save Changes'}</>
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
                            Delete this worker
                        </button>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800 font-medium">Delete this worker?</p>
                            <p className="text-xs text-red-600 mt-1">
                                This cannot be undone. Salary expenses linked to them will remain.
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