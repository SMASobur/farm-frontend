import type { CustomerType } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';

const OTHER_CODE = 'OTHER';

interface Props {
    customerTypes: CustomerType[];
    value: number | null;
    customName: string;
    customNameBn: string;
    saveCustom: boolean;
    onChange: (
        typeId: number | null,
        customNameEn: string,
        customNameBn: string,
        saveCustom: boolean
    ) => void;
    required?: boolean;
    hasError?: boolean;
    error?: string;
}

export function CustomerTypeSelect({
                                       customerTypes,
                                       value,
                                       customName,
                                       customNameBn,
                                       saveCustom,
                                       onChange,
                                       required,
                                       hasError,
                                       error,
                                   }: Props) {
    const selected = customerTypes.find((t) => t.id === value);
    const isOther = selected?.code === OTHER_CODE;

    const handleSelectChange = (newValue: string) => {
        const id = newValue ? Number(newValue) : null;
        const t = customerTypes.find((x) => x.id === id);
        if (t?.code !== OTHER_CODE) {
            onChange(id, '', '', saveCustom);
        } else {
            onChange(id, customName, customNameBn, saveCustom);
        }
    };

    return (
        <>
            <Field
                label="Customer Type"
                htmlFor="customerTypeId"
                required={required}
                error={error}
                help="What kind of customer is this?"
            >
                <Select
                    id="customerTypeId"
                    value={value ?? ''}
                    onChange={(e) => handleSelectChange(e.target.value)}
                    hasError={hasError}
                >
                    <option value="">Select type…</option>
                    {customerTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                            {t.nameBn ? ` · ${t.nameBn}` : ''}
                        </option>
                    ))}
                </Select>
            </Field>

            {isOther && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-4">
                    <div>
                        <div className="text-sm font-medium text-amber-900 mb-1">
                            Specify the custom type
                        </div>
                        <div className="text-xs text-amber-700">
                            Required to distinguish from generic "Other"
                        </div>
                    </div>

                    <Field
                        label="English Name"
                        htmlFor="customTypeName"
                        required
                        help="e.g., Bakery, Grocery, Hotel"
                    >
                        <Input
                            id="customTypeName"
                            value={customName}
                            onChange={(e) => onChange(value, e.target.value, customNameBn, saveCustom)}
                            placeholder="Bakery"
                            hasError={!!error && !customName.trim()}
                            autoComplete="off"
                        />
                    </Field>

                    <Field
                        label="Bengali Name"
                        htmlFor="customTypeNameBn"
                        help="Optional — e.g., বেকারি"
                    >
                        <Input
                            id="customTypeNameBn"
                            value={customNameBn}
                            onChange={(e) => onChange(value, customName, e.target.value, saveCustom)}
                            placeholder="বেকারি"
                            autoComplete="off"
                        />
                    </Field>

                    <label className="flex items-start gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={saveCustom}
                            onChange={(e) => onChange(value, customName, customNameBn, e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                            <span className="font-medium">
                                {customName.trim()
                                    ? `Save "${customName.trim()}" to my types`
                                    : 'Save to my types'}
                            </span>
                            <span className="block text-xs text-gray-500 mt-0.5">
                                Reuse it in future customer records
                            </span>
                        </span>
                    </label>
                </div>
            )}
        </>
    );
}