import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Save, Trash2, Egg, AlertTriangle, Layers } from 'lucide-react';
import { listAnimals } from '@/api/animals';
import { listFlocks } from '@/api/flocks';
import type { Animal, EggProduction, Flock } from '@/types';
import { formatNumber } from '@/lib/format';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { AnimalCombobox } from '@/components/forms/AnimalCombobox';

function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}

interface EggRequest {
    animalId?: number;
    flockId?: number;
    date: string;
    goodEggs?: number;
    crackedEggs?: number;
}

interface Props {
    initial?: EggProduction;
    onSubmit: (data: EggRequest) => Promise<void>;
    onDelete?: () => Promise<void>;
    mode: 'create' | 'edit';
    cancelTo: string;
}

export function EggForm({ initial, onSubmit, onDelete, mode, cancelTo }: Props) {
    const navigate = useNavigate();

    // Default to BATCH for new entries (realistic for large farms)
    const initialSource: 'ANIMAL' | 'FLOCK' =
        initial?.sourceType === 'ANIMAL' ? 'ANIMAL' : 'FLOCK';
    const [sourceType, setSourceType] = useState<'ANIMAL' | 'FLOCK'>(initialSource);

    const [animalId, setAnimalId] = useState<number | null>(initial?.animalId ?? null);
    const [flockId, setFlockId] = useState<number | null>(initial?.flockId ?? null);
    const [date, setDate] = useState(initial?.date ?? todayISO());
    const [goodEggs, setGoodEggs] = useState(
        initial?.goodEggs != null ? String(initial.goodEggs) : ''
    );
    const [crackedEggs, setCrackedEggs] = useState(
        initial?.crackedEggs != null ? String(initial.crackedEggs) : ''
    );

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Lookups
    const animalsQuery = useQuery({
        queryKey: ['animals', 'egg-producers'],
        queryFn: () => listAnimals(),
    });

    const flocksQuery = useQuery({
        queryKey: ['flocks', 'ACTIVE'],
        queryFn: () => listFlocks({ status: 'ACTIVE' }),
    });

    // Only egg-producing active FEMALE animals
    const animals: Animal[] = (animalsQuery.data?.data ?? []).filter(
        (a) => a.eggProducer && a.lifecycleStatus === 'ACTIVE' && a.gender === 'FEMALE'
    );

    const flocks: Flock[] = flocksQuery.data?.data ?? [];

    const clearError = (field: string) => {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const good = parseInt(goodEggs) || 0;
    const cracked = parseInt(crackedEggs) || 0;
    const total = good + cracked;

    // Find selected flock's bird count for yield calculation
    const selectedFlock = flocks.find((f) => f.id === flockId);
    const eggsPerBird = selectedFlock && selectedFlock.birdCount > 0
        ? total / selectedFlock.birdCount
        : null;

    const validate = (): boolean => {
        const next: Record<string, string> = {};
        if (sourceType === 'ANIMAL' && animalId === null) next.animalId = 'Animal is required';
        if (sourceType === 'FLOCK' && flockId === null) next.flockId = 'Batch is required';
        if (!date) next.date = 'Date is required';
        if (total <= 0) next.eggs = 'Enter at least one egg';
        if (good < 0 || cracked < 0) next.eggs = 'Counts cannot be negative';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        if (!validate()) return;

        setSaving(true);
        try {
            const payload: EggRequest = {
                date,
                goodEggs: good,
                crackedEggs: cracked,
            };
            if (sourceType === 'ANIMAL') {
                payload.animalId = animalId!;
            } else {
                payload.flockId = flockId!;
            }
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

    const isLoading = animalsQuery.isLoading || flocksQuery.isLoading;

    if (isLoading) {
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

            {/* Source type toggle */}
            <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Source
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setSourceType('FLOCK');
                            setAnimalId(null);
                        }}
                        disabled={mode === 'edit'}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition flex items-center justify-center gap-2 ${
                            sourceType === 'FLOCK'
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        } ${mode === 'edit' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <Layers size={16} />
                        Batch
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setSourceType('ANIMAL');
                            setFlockId(null);
                        }}
                        disabled={mode === 'edit'}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition flex items-center justify-center gap-2 ${
                            sourceType === 'ANIMAL'
                                ? 'bg-amber-50 border-amber-300 text-amber-700'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        } ${mode === 'edit' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <Egg size={16} />
                        Individual
                    </button>
                </div>
                {mode === 'edit' && (
                    <p className="text-xs text-gray-500 mt-2">
                        Source type cannot be changed on existing entries.
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sourceType === 'FLOCK' ? (
                    <Field
                        label="Batch"
                        htmlFor="flockId"
                        required
                        error={errors.flockId}
                        help={flocks.length === 0 ? 'Create a batch first' : undefined}
                    >
                        <select
                            id="flockId"
                            value={flockId ?? ''}
                            onChange={(e) => {
                                setFlockId(e.target.value ? Number(e.target.value) : null);
                                clearError('flockId');
                            }}
                            disabled={mode === 'edit'}
                            className={`w-full px-3 py-2.5 border rounded-lg text-base bg-white focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                errors.flockId ? 'border-red-300' : 'border-gray-300'
                            } ${mode === 'edit' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                        >
                            <option value="">Select batch…</option>
                            {flocks.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.flockCode}
                                    {f.name ? ` · ${f.name}` : ''} ({f.birdCount} birds)
                                </option>
                            ))}
                        </select>
                    </Field>
                ) : (
                    <Field label="Animal" htmlFor="animalId" required error={errors.animalId}>
                        <AnimalCombobox
                            animals={animals}
                            value={animalId}
                            onChange={(id) => {
                                setAnimalId(id);
                                clearError('animalId');
                            }}
                            hasError={!!errors.animalId}
                            disabled={mode === 'edit'}
                        />
                    </Field>
                )}

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

            {sourceType === 'FLOCK' && flocks.length === 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                    You have no active batches.{' '}
                    <a href="/flocks/new" className="font-medium underline">
                        Create one first
                    </a>.
                </div>
            )}

            {sourceType === 'ANIMAL' && animals.length === 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                    No active egg-producing animals. Add a Chicken, Duck, or Goose first.
                </div>
            )}

            {/* Egg counts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Good Eggs" htmlFor="goodEggs">
                    <div className="relative">
                        <Egg size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" />
                        <Input
                            id="goodEggs"
                            type="number"
                            min="0"
                            value={goodEggs}
                            onChange={(e) => { setGoodEggs(e.target.value); clearError('eggs'); }}
                            placeholder="0"
                            className="pl-10"
                        />
                    </div>
                </Field>

                <Field label="Cracked Eggs" htmlFor="crackedEggs" help="Broken but still usable">
                    <div className="relative">
                        <AlertTriangle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
                        <Input
                            id="crackedEggs"
                            type="number"
                            min="0"
                            value={crackedEggs}
                            onChange={(e) => { setCrackedEggs(e.target.value); clearError('eggs'); }}
                            placeholder="0"
                            className="pl-10"
                        />
                    </div>
                </Field>
            </div>

            {errors.eggs && (
                <p className="text-xs text-red-600">{errors.eggs}</p>
            )}

            {/* Total + yield */}
            {total > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-amber-900">Total today</div>
                        {eggsPerBird !== null && (
                            <div className="text-xs text-amber-700 mt-0.5">
                                {eggsPerBird.toFixed(2)} eggs per bird
                            </div>
                        )}
                    </div>
                    <span className="text-2xl font-bold text-amber-900">
                        {formatNumber(total, 0)} eggs
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
                        <><Save size={18} />{mode === 'create' ? 'Record Eggs' : 'Save Changes'}</>
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
                            <p className="text-sm text-red-800 font-medium">Delete this egg entry?</p>
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