import type { Unit } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';

const OTHER_VALUE = '__OTHER__';

interface Props {
    units: Unit[];
    value: number | null;
    isOther: boolean;
    customName: string;
    customNameBn: string;
    customAbbreviation: string;
    saveCustom: boolean;
    onChange: (
        unitId: number | null,
        isOtherMode: boolean,
        customName: string,
        customNameBn: string,
        customAbbreviation: string,
        saveCustom: boolean
    ) => void;
    required?: boolean;
    hasError?: boolean;
    error?: string;
}

export function UnitSelect({
                               units,
                               value,
                               isOther,
                               customName,
                               customNameBn,
                               customAbbreviation,
                               saveCustom,
                               onChange,
                               required,
                               hasError,
                               error,
                           }: Props) {
    const selectValue = isOther ? OTHER_VALUE : value !== null ? String(value) : '';

    const handleSelectChange = (newValue: string) => {
        if (newValue === OTHER_VALUE) {
            onChange(null, true, customName, customNameBn, customAbbreviation, saveCustom);
        } else if (newValue === '') {
            onChange(null, false, '', '', '', saveCustom);
        } else {
            onChange(Number(newValue), false, '', '', '', saveCustom);
        }
    };

    return (
        <>
            <Field label="Unit" htmlFor="unitId" required={required} error={error}>
                <Select
                    id="unitId"
                    value={selectValue}
                    onChange={(e) => handleSelectChange(e.target.value)}
                    hasError={hasError}
                >
                    <option value="">Select unit…</option>
                    {units.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.name}
                            {u.abbreviation ? ` · ${u.abbreviation}` : ''}
                        </option>
                    ))}
                    <option value={OTHER_VALUE}>➕ Other… (add new)</option>
                </Select>
            </Field>

            {isOther && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-4">
                    <div>
                        <div className="text-sm font-medium text-amber-900 mb-1">
                            Specify the custom unit
                        </div>
                        <div className="text-xs text-amber-700">
                            You can save it for reuse in future sales
                        </div>
                    </div>

                    <Field
                        label="English Name"
                        htmlFor="customUnitName"
                        required
                        help="e.g., Cup, Bag, Truck"
                    >
                        <Input
                            id="customUnitName"
                            value={customName}
                            onChange={(e) => onChange(
                                null, true, e.target.value, customNameBn, customAbbreviation, saveCustom
                            )}
                            placeholder="Cup"
                            hasError={!!error && !customName.trim()}
                            autoComplete="off"
                        />
                    </Field>

                    <Field
                        label="Bengali Name"
                        htmlFor="customUnitNameBn"
                        help="Optional — e.g., কাপ"
                    >
                        <Input
                            id="customUnitNameBn"
                            value={customNameBn}
                            onChange={(e) => onChange(
                                null, true, customName, e.target.value, customAbbreviation, saveCustom
                            )}
                            placeholder="কাপ"
                            autoComplete="off"
                        />
                    </Field>

                    <Field
                        label="Abbreviation"
                        htmlFor="customUnitAbbreviation"
                        help="Optional — e.g., kg, L, pcs"
                    >
                        <Input
                            id="customUnitAbbreviation"
                            value={customAbbreviation}
                            onChange={(e) => onChange(
                                null, true, customName, customNameBn, e.target.value, saveCustom
                            )}
                            placeholder="pcs"
                            maxLength={10}
                            autoComplete="off"
                        />
                    </Field>

                    <label className="flex items-start gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={saveCustom}
                            onChange={(e) => onChange(
                                null, true, customName, customNameBn, customAbbreviation, e.target.checked
                            )}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                            <span className="font-medium">
                                {customName.trim()
                                    ? `Save "${customName.trim()}" to my units`
                                    : 'Save to my units'}
                            </span>
                            <span className="block text-xs text-gray-500 mt-0.5">
                                Reuse it in future sales
                            </span>
                        </span>
                    </label>
                </div>
            )}
        </>
    );
}