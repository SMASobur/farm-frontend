import type { Species } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Milk, Egg } from 'lucide-react';

const OTHER_CODE = 'OTHER';

interface Props {
    species: Species[];
    value: number | null;
    customName: string;
    customNameBn: string;
    customMilkProducer: boolean;
    customEggProducer: boolean;
    saveCustom: boolean;
    onChange: (
        speciesId: number | null,
        customNameEn: string,
        customNameBn: string,
        customMilkProducer: boolean,
        customEggProducer: boolean,
        saveCustom: boolean
    ) => void;
    required?: boolean;
    hasError?: boolean;
    error?: string;
}

export function SpeciesSelect({
                                  species,
                                  value,
                                  customName,
                                  customNameBn,
                                  customMilkProducer,
                                  customEggProducer,
                                  saveCustom,
                                  onChange,
                                  required,
                                  hasError,
                                  error,
                              }: Props) {
    const selected = species.find((s) => s.id === value);
    const isOther = selected?.code === OTHER_CODE;

    const handleSelectChange = (newValue: string) => {
        const id = newValue ? Number(newValue) : null;
        const sp = species.find((s) => s.id === id);
        if (sp?.code !== OTHER_CODE) {
            onChange(id, '', '', false, false, saveCustom);
        } else {
            onChange(
                id,
                customName,
                customNameBn,
                customMilkProducer,
                customEggProducer,
                saveCustom
            );
        }
    };

    return (
        <>
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
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-4">
                    <div>
                        <div className="text-sm font-medium text-amber-900 mb-1">
                            Specify the custom species
                        </div>
                        <div className="text-xs text-amber-700">
                            Required to distinguish from generic "Other"
                        </div>
                    </div>

                    <Field
                        label="English Name"
                        htmlFor="customSpeciesName"
                        required
                        help="e.g., Turkey, Emu, Pigeon"
                    >
                        <Input
                            id="customSpeciesName"
                            value={customName}
                            onChange={(e) => onChange(
                                value,
                                e.target.value,
                                customNameBn,
                                customMilkProducer,
                                customEggProducer,
                                saveCustom
                            )}
                            placeholder="Turkey"
                            hasError={!!error && !customName.trim()}
                            autoComplete="off"
                        />
                    </Field>

                    <Field
                        label="Bengali Name"
                        htmlFor="customSpeciesNameBn"
                        help="Optional — e.g., টার্কি"
                    >
                        <Input
                            id="customSpeciesNameBn"
                            value={customNameBn}
                            onChange={(e) => onChange(
                                value,
                                customName,
                                e.target.value,
                                customMilkProducer,
                                customEggProducer,
                                saveCustom
                            )}
                            placeholder="টার্কি"
                            autoComplete="off"
                        />
                    </Field>

                    {/* Producer flag — radio group */}
                    <div className="border-t border-amber-200 pt-3 space-y-2">
                        <div className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                            What does this species produce?
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="speciesProducer"
                                checked={customMilkProducer && !customEggProducer}
                                onChange={() => onChange(
                                    value, customName, customNameBn,
                                    true, false,
                                    saveCustom
                                )}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <Milk size={14} className="text-blue-600" />
                            <span className="text-sm text-gray-700">Milk</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="speciesProducer"
                                checked={!customMilkProducer && customEggProducer}
                                onChange={() => onChange(
                                    value, customName, customNameBn,
                                    false, true,
                                    saveCustom
                                )}
                                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                            />
                            <Egg size={14} className="text-amber-600" />
                            <span className="text-sm text-gray-700">Eggs</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="speciesProducer"
                                checked={!customMilkProducer && !customEggProducer}
                                onChange={() => onChange(
                                    value, customName, customNameBn,
                                    false, false,
                                    saveCustom
                                )}
                                className="w-4 h-4 text-gray-500 focus:ring-gray-400"
                            />
                            <span className="text-sm text-gray-700">
                                Neither <span className="text-xs text-gray-500">(meat, wool, etc.)</span>
                            </span>
                        </label>
                    </div>

                    <label className="flex items-start gap-2 cursor-pointer border-t border-amber-200 pt-3">
                        <input
                            type="checkbox"
                            checked={saveCustom}
                            onChange={(e) => onChange(
                                value,
                                customName,
                                customNameBn,
                                customMilkProducer,
                                customEggProducer,
                                e.target.checked
                            )}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                            <span className="font-medium">
                                {customName.trim()
                                    ? `Save "${customName.trim()}" to my species`
                                    : 'Save to my species'}
                            </span>
                            <span className="block text-xs text-gray-500 mt-0.5">
                                Reuse it in future animal records
                            </span>
                        </span>
                    </label>
                </div>
            )}
        </>
    );
}