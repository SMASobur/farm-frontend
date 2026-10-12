import type { Category, Unit } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';

const OTHER_CODE = 'OTHER';

interface Props {
    categories: Category[];
    units: Unit[];
    value: number | null;
    customProductName: string;
    customProductNameBn: string;
    customProductDefaultUnitId: number | null;
    saveCustom: boolean;
    onChange: (
        categoryId: number | null,
        customNameEn: string,
        customNameBn: string,
        defaultUnitId: number | null,
        saveCustom: boolean
    ) => void;
    required?: boolean;
    hasError?: boolean;
    error?: string;
}

export function CategorySelect({
                                   categories,
                                   units,
                                   value,
                                   customProductName,
                                   customProductNameBn,
                                   customProductDefaultUnitId,
                                   saveCustom,
                                   onChange,
                                   required,
                                   hasError,
                                   error,
                               }: Props) {
    const selected = categories.find((c) => c.id === value);
    const isOther = selected?.code === OTHER_CODE;

    const handleSelectChange = (newValue: string) => {
        const id = newValue ? Number(newValue) : null;
        const cat = categories.find((c) => c.id === id);
        if (cat?.code !== OTHER_CODE) {
            onChange(id, '', '', null, saveCustom);
        } else {
            onChange(id, customProductName, customProductNameBn, customProductDefaultUnitId, saveCustom);
        }
    };

    return (
        <>
            <Field
                label="Category"
                htmlFor="categoryId"
                required={required}
                error={error}
                help="What product is being sold?"
            >
                <Select
                    id="categoryId"
                    value={value ?? ''}
                    onChange={(e) => handleSelectChange(e.target.value)}
                    hasError={hasError}
                >
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                            {c.nameBn ? ` · ${c.nameBn}` : ''}
                        </option>
                    ))}
                </Select>
            </Field>

            {isOther && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-4">
                    <div>
                        <div className="text-sm font-medium text-amber-900 mb-1">
                            Specify the custom product
                        </div>
                        <div className="text-xs text-amber-700">
                            Required to distinguish from generic "Other"
                        </div>
                    </div>

                    <Field
                        label="English Name"
                        htmlFor="customProductName"
                        required
                        help="e.g., Honey, Grass, Dung"
                    >
                        <Input
                            id="customProductName"
                            value={customProductName}
                            onChange={(e) =>
                                onChange(value, e.target.value, customProductNameBn,
                                    customProductDefaultUnitId, saveCustom)
                            }
                            placeholder="Honey"
                            hasError={!!error && !customProductName.trim()}
                            autoComplete="off"
                        />
                    </Field>

                    <Field
                        label="Bengali Name"
                        htmlFor="customProductNameBn"
                        help="Optional — e.g., মধু"
                    >
                        <Input
                            id="customProductNameBn"
                            value={customProductNameBn}
                            onChange={(e) =>
                                onChange(value, customProductName, e.target.value,
                                    customProductDefaultUnitId, saveCustom)
                            }
                            placeholder="মধু"
                            autoComplete="off"
                        />
                    </Field>

                    {/* Default Unit — appears when user opts to save */}
                    <Field
                        label="Default Unit"
                        htmlFor="customProductDefaultUnitId"
                        help="Optional — pre-selects the unit when this category is reused"
                    >
                        <Select
                            id="customProductDefaultUnitId"
                            value={customProductDefaultUnitId ?? ''}
                            onChange={(e) =>
                                onChange(value, customProductName, customProductNameBn,
                                    e.target.value ? Number(e.target.value) : null, saveCustom)
                            }
                        >
                            <option value="">— None (user picks each time) —</option>
                            {units.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                    {u.abbreviation ? ` · ${u.abbreviation}` : ''}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    <label className="flex items-start gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={saveCustom}
                            onChange={(e) =>
                                onChange(value, customProductName, customProductNameBn,
                                    customProductDefaultUnitId, e.target.checked)
                            }
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                            <span className="font-medium">
                                {customProductName.trim()
                                    ? `Save "${customProductName.trim()}" to my categories`
                                    : 'Save to my categories'}
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