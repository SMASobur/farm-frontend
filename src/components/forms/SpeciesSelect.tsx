import type { Species } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';

const OTHER_CODE = 'OTHER';

interface Props {
    species: Species[];
    value: number | null;
    customSpeciesName: string;
    saveCustom: boolean;
    onChange: (speciesId: number | null, customName: string, saveCustom: boolean) => void;
    required?: boolean;
    hasError?: boolean;
    error?: string;
}

export function SpeciesSelect({
                                  species,
                                  value,
                                  customSpeciesName,
                                  saveCustom,
                                  onChange,
                                  required,
                                  hasError,
                                  error,
                              }: Props) {
    const selected = species.find((s) => s.id === value);
    const isOther = selected?.code === OTHER_CODE;

    const handleSelectChange = (newValue: string) => {
        const speciesId = newValue ? Number(newValue) : null;
        const sp = species.find((s) => s.id === speciesId);
        if (sp?.code !== OTHER_CODE) {
            onChange(speciesId, '', saveCustom);
        } else {
            onChange(speciesId, customSpeciesName, saveCustom);
        }
    };

    return (
        <div className="space-y-4">
            <Field label="Species" htmlFor="speciesId" required={required} error={error}>
                <Select
                    id="speciesId"
                    value={value ?? ''}
                    onChange={(e) => handleSelectChange(e.target.value)}
                    hasError={hasError}
                >
                    <option value="">Select species…</option>
                    {species.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                            {s.nameBn ? ` · ${s.nameBn}` : ''}
                        </option>
                    ))}
                </Select>
            </Field>

            {isOther && (
                <Field
                    label="What species?"
                    htmlFor="customSpeciesName"
                    required
                    help="Specify the species since 'Other' was selected"
                >
                    <Input
                        id="customSpeciesName"
                        value={customSpeciesName}
                        onChange={(e) => onChange(value, e.target.value, saveCustom)}
                        placeholder="e.g., Emu, Turkey, Pigeon"
                        hasError={!!error && !customSpeciesName}
                        autoComplete="off"
                    />

                    <label className="flex items-start gap-2 mt-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={saveCustom}
                            onChange={(e) => onChange(value, customSpeciesName, e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                            <span className="font-medium">
                                {customSpeciesName.trim()
                                    ? `Save "${customSpeciesName.trim()}" to my species`
                                    : 'Save to my species'}
                            </span>
                            <span className="block text-xs text-gray-500 mt-0.5">
                                Reuse it in future animal records
                            </span>
                        </span>
                    </label>
                </Field>
            )}
        </div>
    );
}