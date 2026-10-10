import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { listSpecies } from '@/api/species';
import type { Animal, AnimalRequest, AnimalStatus, Gender } from '@/types';
import { STATUS_LABELS, GENDER_LABELS } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { SpeciesSelect } from '@/components/forms/SpeciesSelect';

const STATUS_OPTIONS: AnimalStatus[] = ['ACTIVE', 'PREGNANT', 'DRY', 'SICK', 'SOLD', 'DEAD'];
const GENDER_OPTIONS: Gender[] = ['FEMALE', 'MALE', 'UNKNOWN'];
const MILK_SPECIES_CODES = ['COW', 'GOAT', 'SHEEP', 'BUFFALO'];

interface Props {
    initial?: Animal;
    onSubmit: (data: AnimalRequest) => Promise<void>;
    onDelete?: () => Promise<void>;
    mode: 'create' | 'edit';
    cancelTo?: string;
}

export function AnimalForm({ initial, onSubmit, onDelete, mode, cancelTo = '/animals' }: Props) {
    const navigate = useNavigate();

    // Form state
    const [tagNumber, setTagNumber] = useState(initial?.tagNumber ?? '');
    const [name, setName] = useState(initial?.name ?? '');
    const [speciesId, setSpeciesId] = useState<number | null>(initial?.speciesId ?? null);
    const [customSpeciesName, setCustomSpeciesName] = useState('');
    const [saveCustomSpecies, setSaveCustomSpecies] = useState(false);
    const [status, setStatus] = useState<AnimalStatus>(initial?.status ?? 'ACTIVE');
    const [gender, setGender] = useState<Gender>(initial?.gender ?? 'FEMALE');
    const [dateOfBirth, setDateOfBirth] = useState(initial?.dateOfBirth ?? '');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Lookup: species list
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
        if (!tagNumber.trim()) next.tagNumber = 'Tag number is required';
        if (speciesId === null && !customSpeciesName.trim()) {
            next.speciesId = 'Species is required';
        }
        if (dateOfBirth && new Date(dateOfBirth) > new Date()) {
            next.dateOfBirth = 'Date cannot be in the future';
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
            const selectedSpecies = speciesList.find((s) => s.id === speciesId);
            const isOtherSpecies = selectedSpecies?.code === 'OTHER';

            const payload: AnimalRequest = {
                tagNumber: tagNumber.trim(),
                name: name.trim() || undefined,
                // Only send speciesId when NOT using Other
                speciesId: isOtherSpecies ? undefined : (speciesId ?? undefined),
                // Only send customSpeciesName when using Other
                customSpeciesName: isOtherSpecies ? customSpeciesName.trim() || undefined : undefined,
                saveCustomSpecies: isOtherSpecies && customSpeciesName.trim() ? saveCustomSpecies : undefined,
                status,
                gender,
                dateOfBirth: dateOfBirth || undefined,
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

    const selectedSpecies = speciesList.find((s) => s.id === speciesId);
    const isMilkSpecies = selectedSpecies
        ? MILK_SPECIES_CODES.includes(selectedSpecies.code)
        : false;
    const isFemale = gender === 'FEMALE';

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {submitError && (
                <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
                    {submitError}
                </div>
            )}

            <Field label="Tag Number" htmlFor="tagNumber" required error={errors.tagNumber}>
                <Input
                    id="tagNumber"
                    value={tagNumber}
                    onChange={(e) => { setTagNumber(e.target.value); clearError('tagNumber'); }}
                    placeholder="e.g., Goat-03"
                    hasError={!!errors.tagNumber}
                    autoFocus={mode === 'create'}
                    autoComplete="off"
                />
            </Field>

            <Field label="Name" htmlFor="name" help="Optional — a nickname">
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., laki"
                    autoComplete="off"
                />
            </Field>

            <SpeciesSelect
                species={speciesList}
                value={speciesId}
                customSpeciesName={customSpeciesName}
                saveCustom={saveCustomSpecies}
                onChange={(id, customName, save) => {
                    setSpeciesId(id);
                    setCustomSpeciesName(customName);
                    setSaveCustomSpecies(save);
                    clearError('speciesId');
                }}
                required
                error={errors.speciesId}
                hasError={!!errors.speciesId}
            />

            <div className="grid grid-cols-2 gap-4">
                <Field label="Gender" htmlFor="gender">
                    <Select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value as Gender)}
                    >
                        {GENDER_OPTIONS.map((g) => (
                            <option key={g} value={g}>{GENDER_LABELS[g]}</option>
                        ))}
                    </Select>
                </Field>

                <Field label="Status" htmlFor="status">
                    <Select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as AnimalStatus)}
                    >
                        {STATUS_OPTIONS.map((s) => {
                            const disabled =
                                (s === 'PREGNANT' && (!isFemale || !isMilkSpecies)) ||
                                (s === 'DRY' && (!isFemale || !isMilkSpecies));
                            return (
                                <option key={s} value={s} disabled={disabled}>
                                    {STATUS_LABELS[s]}
                                </option>
                            );
                        })}
                    </Select>
                </Field>
            </div>

            <Field label="Date of Birth" htmlFor="dateOfBirth" error={errors.dateOfBirth} help="Optional">
                <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => { setDateOfBirth(e.target.value); clearError('dateOfBirth'); }}
                    hasError={!!errors.dateOfBirth}
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
                        <><Save size={18} />{mode === 'create' ? 'Create Animal' : 'Save Changes'}</>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => navigate(cancelTo)}
                    disabled={saving || deleting}
                    className="px-4 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
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
                            Delete this animal
                        </button>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800 font-medium">Delete this animal?</p>
                            <p className="text-xs text-red-600 mt-1">
                                Milk and egg production records linked to this animal will remain.
                            </p>
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