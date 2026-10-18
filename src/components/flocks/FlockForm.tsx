import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { listSpecies } from '@/api/species';
import type { Flock, FlockRequest, FlockStatus } from '@/types';
import { FLOCK_STATUS_LABELS } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { SpeciesSelect } from '@/components/forms/SpeciesSelect';

const STATUS_OPTIONS: FlockStatus[] = ['ACTIVE', 'RETIRED', 'SOLD', 'DISEASED'];

interface Props {
    initial?: Flock;
    onSubmit: (data: FlockRequest) => Promise<void>;
    onDelete?: () => Promise<void>;
    mode: 'create' | 'edit';
    cancelTo: string;
}

export function FlockForm({ initial, onSubmit, onDelete, mode, cancelTo }: Props) {
    const navigate = useNavigate();

    const [flockCode, setFlockCode] = useState(initial?.flockCode ?? '');
    const [name, setName] = useState(initial?.name ?? '');
    const [speciesId, setSpeciesId] = useState<number | null>(initial?.speciesId ?? null);
    const [customSpeciesName, setCustomSpeciesName] = useState('');
    const [customSpeciesNameBn, setCustomSpeciesNameBn] = useState('');
    const [customSpeciesMilkProducer, setCustomSpeciesMilkProducer] = useState(false);
    const [customSpeciesEggProducer, setCustomSpeciesEggProducer] = useState(false);
    const [saveCustomSpecies, setSaveCustomSpecies] = useState(false);
    const [birdCount, setBirdCount] = useState(
        initial?.birdCount ? String(initial.birdCount) : ''
    );
    const [status, setStatus] = useState<FlockStatus>(initial?.status ?? 'ACTIVE');
    const [startedOn, setStartedOn] = useState(initial?.startedOn ?? '');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const speciesQuery = useQuery({
        queryKey: ['species'],
        queryFn: () => listSpecies(true),
    });
    const speciesList = speciesQuery.data?.data ?? [];

    const clearError = (field: string) => {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const validate = (): boolean => {
        const next: Record<string, string> = {};
        if (!flockCode.trim()) next.flockCode = 'Flock code is required';
        if (speciesId === null && !customSpeciesName.trim()) {
            next.speciesId = 'Species is required';
        }
        const count = parseInt(birdCount);
        if (!count || count <= 0) next.birdCount = 'Bird count must be positive';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        if (!validate()) return;

        setSaving(true);
        try {
            const selectedSpecies = speciesList.find((s) => s.id === speciesId);
            const isOtherSpecies = selectedSpecies?.code === 'OTHER';

            const payload: FlockRequest = {
                flockCode: flockCode.trim(),
                name: name.trim() || undefined,
                speciesId: isOtherSpecies ? undefined : (speciesId ?? undefined),
                customSpeciesName: isOtherSpecies ? customSpeciesName.trim() || undefined : undefined,
                customSpeciesNameBn: isOtherSpecies ? customSpeciesNameBn.trim() || undefined : undefined,
                customSpeciesMilkProducer: isOtherSpecies ? customSpeciesMilkProducer : undefined,
                customSpeciesEggProducer: isOtherSpecies ? customSpeciesEggProducer : undefined,
                saveCustomSpecies: isOtherSpecies && customSpeciesName.trim() ? saveCustomSpecies : undefined,
                birdCount: parseInt(birdCount),
                status,
                startedOn: startedOn || undefined,
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

    if (speciesQuery.isLoading) {
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
                <Field label="Flock Code" htmlFor="flockCode" required error={errors.flockCode}>
                    <Input
                        id="flockCode"
                        value={flockCode}
                        onChange={(e) => { setFlockCode(e.target.value); clearError('flockCode'); }}
                        placeholder="e.g., Laying-A"
                        hasError={!!errors.flockCode}
                        autoFocus={mode === 'create'}
                        autoComplete="off"
                    />
                </Field>

                <Field label="Name" htmlFor="name" help="Optional — descriptive name">
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Laying Hens Batch A"
                        autoComplete="off"
                    />
                </Field>
            </div>

            <SpeciesSelect
                species={speciesList}
                value={speciesId}
                customName={customSpeciesName}
                customNameBn={customSpeciesNameBn}
                customMilkProducer={customSpeciesMilkProducer}
                customEggProducer={customSpeciesEggProducer}
                saveCustom={saveCustomSpecies}
                onChange={(id, nameEn, nameBn, milkProd, eggProd, save) => {
                    setSpeciesId(id);
                    setCustomSpeciesName(nameEn);
                    setCustomSpeciesNameBn(nameBn);
                    setCustomSpeciesMilkProducer(milkProd);
                    setCustomSpeciesEggProducer(eggProd);
                    setSaveCustomSpecies(save);
                    clearError('speciesId');
                }}
                required
                error={errors.speciesId}
                hasError={!!errors.speciesId}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Bird Count" htmlFor="birdCount" required error={errors.birdCount} help="How many birds in this batch?">
                    <Input
                        id="birdCount"
                        type="number"
                        min="1"
                        value={birdCount}
                        onChange={(e) => { setBirdCount(e.target.value); clearError('birdCount'); }}
                        placeholder="40"
                        hasError={!!errors.birdCount}
                    />
                </Field>

                <Field label="Status" htmlFor="status">
                    <Select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as FlockStatus)}
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{FLOCK_STATUS_LABELS[s]}</option>
                        ))}
                    </Select>
                </Field>
            </div>

            <Field label="Started On" htmlFor="startedOn" help="Optional — when did you acquire this batch?">
                <Input
                    id="startedOn"
                    type="date"
                    value={startedOn}
                    onChange={(e) => setStartedOn(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                />
            </Field>

            <div className="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    disabled={saving || deleting}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <><Loader2 size={18} className="animate-spin" />{mode === 'create' ? 'Creating…' : 'Saving…'}</>
                    ) : (
                        <><Save size={18} />{mode === 'create' ? 'Create Batch' : 'Save Changes'}</>
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
                            Delete this batch
                        </button>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800 font-medium">Delete this batch?</p>
                            <p className="text-xs text-red-600 mt-1">
                                Egg production records for this batch will remain.
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