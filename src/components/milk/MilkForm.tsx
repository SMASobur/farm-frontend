import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Save, Trash2, Sunrise, Sun, Moon } from 'lucide-react';
import { listAnimals } from '@/api/animals';
import type { Animal, MilkProduction } from '@/types';
import { formatNumber } from '@/lib/format';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';

function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}

interface MilkRequest {
    animalId: number;
    date: string;
    morningLiters?: number;
    noonLiters?: number;
    nightLiters?: number;
}

interface Props {
    initial?: MilkProduction;
    onSubmit: (data: MilkRequest) => Promise<void>;
    onDelete?: () => Promise<void>;
    mode: 'create' | 'edit';
    cancelTo: string;
    prefilledAnimalId?: number | null;
    prefilledDate?: string | null;
}

export function MilkForm({
                             initial,
                             onSubmit,
                             onDelete,
                             mode,
                             cancelTo,
                             prefilledAnimalId,
                             prefilledDate,
                         }: Props) {
    const navigate = useNavigate();

    const [animalId, setAnimalId] = useState<number | null>(
        initial?.animalId ?? prefilledAnimalId ?? null
    );
    const [date, setDate] = useState(initial?.date ?? prefilledDate ?? todayISO());
    const [morningLiters, setMorningLiters] = useState(
        initial?.morningLiters != null ? String(initial.morningLiters) : ''
    );
    const [noonLiters, setNoonLiters] = useState(
        initial?.noonLiters != null ? String(initial.noonLiters) : ''
    );
    const [nightLiters, setNightLiters] = useState(
        initial?.nightLiters != null ? String(initial.nightLiters) : ''
    );

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const animalsQuery = useQuery({
        queryKey: ['animals', 'milk-producers'],
        queryFn: () => listAnimals(),
    });

    // Only milk-producing animals
    const animals: Animal[] = (animalsQuery.data?.data ?? []).filter(
        (a: Animal) => a.milkProducer && a.lifecycleStatus === 'ACTIVE'
    );

    const clearError = (field: string) => {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const morning = parseFloat(morningLiters) || 0;
    const noon = parseFloat(noonLiters) || 0;
    const night = parseFloat(nightLiters) || 0;
    const total = morning + noon + night;

    const validate = (): boolean => {
        const next: Record<string, string> = {};
        if (animalId === null) next.animalId = 'Animal is required';
        if (!date) next.date = 'Date is required';
        if (total <= 0) next.liters = 'At least one milking session must have a value';
        if (morning < 0 || noon < 0 || night < 0) next.liters = 'Liters cannot be negative';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        if (!validate()) return;

        setSaving(true);
        try {
            await onSubmit({
                animalId: animalId!,
                date,
                morningLiters: morning,
                noonLiters: noon,
                nightLiters: night,
            });
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

    if (animalsQuery.isLoading) {
        return (
            <div className="space-y-5">
                {[1, 2, 3].map((i) => (
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
                <Field label="Animal" htmlFor="animalId" required error={errors.animalId}>
                    <Select
                        id="animalId"
                        value={animalId ?? ''}
                        onChange={(e) => {
                            setAnimalId(e.target.value ? Number(e.target.value) : null);
                            clearError('animalId');
                        }}
                        hasError={!!errors.animalId}
                    >
                        <option value="">Select animal…</option>
                        {animals.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.tagNumber}
                                {a.name ? ` · ${a.name}` : ''}
                            </option>
                        ))}
                    </Select>
                </Field>

                <Field label="Date" htmlFor="date" required error={errors.date}>
                    <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => { setDate(e.target.value); clearError('date'); }}
                        max={todayISO()}
                        hasError={!!errors.date}
                    />
                </Field>
            </div>

            {animals.length === 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                    You have no active milk-producing animals.
                    Add an animal first (Cow, Goat, Sheep, or Buffalo).
                </div>
            )}

            {/* Milking sessions */}
            <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Milking Sessions (Liters)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Morning" htmlFor="morningLiters">
                        <div className="relative">
                            <Sunrise size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
                            <Input
                                id="morningLiters"
                                type="number"
                                step="0.1"
                                min="0"
                                value={morningLiters}
                                onChange={(e) => { setMorningLiters(e.target.value); clearError('liters'); }}
                                placeholder="0.0"
                                className="pl-10"
                            />
                        </div>
                    </Field>

                    <Field label="Noon" htmlFor="noonLiters">
                        <div className="relative">
                            <Sun size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none" />
                            <Input
                                id="noonLiters"
                                type="number"
                                step="0.1"
                                min="0"
                                value={noonLiters}
                                onChange={(e) => { setNoonLiters(e.target.value); clearError('liters'); }}
                                placeholder="0.0"
                                className="pl-10"
                            />
                        </div>
                    </Field>

                    <Field label="Night" htmlFor="nightLiters">
                        <div className="relative">
                            <Moon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
                            <Input
                                id="nightLiters"
                                type="number"
                                step="0.1"
                                min="0"
                                value={nightLiters}
                                onChange={(e) => { setNightLiters(e.target.value); clearError('liters'); }}
                                placeholder="0.0"
                                className="pl-10"
                            />
                        </div>
                    </Field>
                </div>

                {errors.liters && (
                    <p className="text-xs text-red-600 mt-2">{errors.liters}</p>
                )}
            </div>

            {/* Total */}
            {total > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Total today</span>
                    <span className="text-2xl font-bold text-blue-900">
                        {formatNumber(total, 1)} L
                    </span>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    disabled={saving || deleting}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <><Loader2 size={18} className="animate-spin" />{mode === 'create' ? 'Recording…' : 'Saving…'}</>
                    ) : (
                        <><Save size={18} />{mode === 'create' ? 'Record Milk' : 'Save Changes'}</>
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
                            Delete this entry
                        </button>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800 font-medium">Delete this milk entry?</p>
                            <p className="text-xs text-red-600 mt-1">This cannot be undone.</p>
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