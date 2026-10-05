import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save, Trash2 } from 'lucide-react';
import type { Animal, AnimalRequest, Species, AnimalStatus, Gender } from '@/types';
import { SPECIES_LABELS, STATUS_LABELS, GENDER_LABELS } from '@/types';
import { Field } from '@/components/forms/Field.tsx';
import { Input } from '@/components/forms/Input.tsx';
import { Select } from '@/components/forms/Select.tsx';

const SPECIES_OPTIONS: Species[] = ['COW', 'GOAT', 'SHEEP', 'CHICKEN', 'DUCK', 'BUFFALO', 'OTHER'];
const STATUS_OPTIONS: AnimalStatus[] = ['ACTIVE', 'PREGNANT', 'DRY', 'SICK', 'SOLD', 'DEAD'];
const GENDER_OPTIONS: Gender[] = ['FEMALE', 'MALE', 'UNKNOWN'];

interface Props {
    initial?: Animal;
    onSubmit: (data: AnimalRequest) => Promise<void>;
    onDelete?: () => Promise<void>;
    mode: 'create' | 'edit';
}

export function AnimalForm({ initial, onSubmit, onDelete, mode }: Props) {
    const navigate = useNavigate();

    const [form, setForm] = useState<AnimalRequest>({
        tagNumber: initial?.tagNumber ?? '',
        name: initial?.name ?? '',
        species: initial?.species ?? 'COW',
        status: initial?.status ?? 'ACTIVE',
        gender: initial?.gender ?? 'FEMALE',
        dateOfBirth: initial?.dateOfBirth ?? '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const update = (field: keyof AnimalRequest, value: string) => {
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
        if (!form.tagNumber.trim()) {
            next.tagNumber = 'Tag number is required';
        }
        if (!form.species) {
            next.species = 'Species is required';
        }
        if (form.dateOfBirth) {
            const dob = new Date(form.dateOfBirth);
            if (dob > new Date()) {
                next.dateOfBirth = 'Date cannot be in the future';
            }
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
            // Clean empty strings to undefined
            const payload: AnimalRequest = {
                tagNumber: form.tagNumber.trim(),
                name: form.name?.trim() || undefined,
                species: form.species!,
                status: form.status,
                gender: form.gender,
                dateOfBirth: form.dateOfBirth || undefined,
            };
            await onSubmit(payload);
        } catch (err: any) {
            setSubmitError(
                err.response?.data?.message || 'Something went wrong. Please try again.'
            );
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
            setSubmitError(
                err.response?.data?.message || 'Failed to delete. Please try again.'
            );
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

            <Field label="Tag Number" htmlFor="tagNumber" required error={errors.tagNumber}>
                <Input
                    id="tagNumber"
                    value={form.tagNumber}
                    onChange={(e) => update('tagNumber', e.target.value)}
                    placeholder="e.g., Cow-01, Goat-03"
                    hasError={!!errors.tagNumber}
                    autoFocus={mode === 'create'}
                    autoComplete="off"
                />
            </Field>

            <Field label="Name" htmlFor="name" help="Optional — a nickname for this animal">
                <Input
                    id="name"
                    value={form.name ?? ''}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="e.g., Lakshmi"
                    autoComplete="off"
                />
            </Field>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Species" htmlFor="species" required error={errors.species}>
                    <Select
                        id="species"
                        value={form.species}
                        onChange={(e) => update('species', e.target.value)}
                        hasError={!!errors.species}
                    >
                        {SPECIES_OPTIONS.map((s) => (
                            <option key={s} value={s}>{SPECIES_LABELS[s]}</option>
                        ))}
                    </Select>
                </Field>

                <Field label="Gender" htmlFor="gender">
                    <Select
                        id="gender"
                        value={form.gender}
                        onChange={(e) => update('gender', e.target.value)}
                    >
                        {GENDER_OPTIONS.map((g) => (
                            <option key={g} value={g}>{GENDER_LABELS[g]}</option>
                        ))}
                    </Select>
                </Field>
            </div>

            <Field label="Status" htmlFor="status">
                <Select
                    id="status"
                    value={form.status}
                    onChange={(e) => update('status', e.target.value)}
                >
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                </Select>
            </Field>

            <Field
                label="Date of Birth"
                htmlFor="dateOfBirth"
                error={errors.dateOfBirth}
                help="Optional"
            >
                <Input
                    id="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth ?? ''}
                    onChange={(e) => update('dateOfBirth', e.target.value)}
                    hasError={!!errors.dateOfBirth}
                    max={new Date().toISOString().split('T')[0]}
                />
            </Field>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    disabled={saving || deleting}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            {mode === 'create' ? 'Creating…' : 'Saving…'}
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            {mode === 'create' ? 'Create Animal' : 'Save Changes'}
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/animals')}
                    disabled={saving || deleting}
                    className="px-4 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
                >
                    Cancel
                </button>
            </div>

            {/* Delete section (edit mode only) */}
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
                            <p className="text-sm text-red-800 font-medium">
                                Delete this animal?
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                                This cannot be undone. Milk and egg production records linked to this animal will remain.
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1.5"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Deleting…
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={14} />
                                            Yes, delete
                                        </>
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