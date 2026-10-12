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
    customMilkProducer: boolean;
    customEggProducer: boolean;
    onChange: (
        speciesId: number | null,
        customName: string,
        saveCustom: boolean,
        customMilk: boolean,
        customEgg: boolean
    ) => void;
    required?: boolean;
    hasError?: boolean;
    error?: string;
}

export function SpeciesSelect({
                                  species,
                                  value,
                                  customSpeciesName,
                                  saveCustom,
                                  customMilkProducer,
                                  customEggProducer,
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
            onChange(speciesId, '', saveCustom, customMilkProducer, customEggProducer);
        } else {
            onChange(speciesId, customSpeciesName, saveCustom, customMilkProducer, customEggProducer);
        }
    };

    // Radio group value — encode as string for cleanliness
    const produceValue: 'milk' | 'eggs' | 'none' =
        customMilkProducer ? 'milk'
            : customEggProducer ? 'eggs'
                : 'none';

    const handleProduceChange = (newValue: 'milk' | 'eggs' | 'none') => {
        onChange(
            value,
            customSpeciesName,
            saveCustom,
            newValue === 'milk',
            newValue === 'eggs'
        );
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
                        onChange={(e) =>
                            onChange(value, e.target.value, saveCustom, customMilkProducer, customEggProducer)
                        }
                        placeholder="e.g., Emu, Turkey, Pigeon"
                        hasError={!!error && !customSpeciesName}
                        autoComplete="off"
                    />

                    {/* What does it produce? — radio group */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            What does it produce?
                        </p>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="produceType"
                                    value="milk"
                                    checked={produceValue === 'milk'}
                                    onChange={() => handleProduceChange('milk')}
                                    className="w-4 h-4 border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Milk</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="produceType"
                                    value="eggs"
                                    checked={produceValue === 'eggs'}
                                    onChange={() => handleProduceChange('eggs')}
                                    className="w-4 h-4 border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Eggs</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="produceType"
                                    value="none"
                                    checked={produceValue === 'none'}
                                    onChange={() => handleProduceChange('none')}
                                    className="w-4 h-4 border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">
                                    Neither{' '}
                                    <span className="text-xs text-gray-500">(meat, wool, etc.)</span>
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Save for reuse */}
                    <label className="flex items-start gap-2 mt-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={saveCustom}
                            onChange={(e) =>
                                onChange(
                                    value,
                                    customSpeciesName,
                                    e.target.checked,
                                    customMilkProducer,
                                    customEggProducer
                                )
                            }
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