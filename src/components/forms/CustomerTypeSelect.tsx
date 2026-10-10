import type { CustomerType } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';

const OTHER_CODE = 'OTHER';

interface Props {
    customerTypes: CustomerType[];
    value: number | null;
    customTypeName: string;
    saveCustom: boolean;
    onChange: (typeId: number | null, customName: string, saveCustom: boolean) => void;
    required?: boolean;
    hasError?: boolean;
    error?: string;
}

export function CustomerTypeSelect({
                                       customerTypes,
                                       value,
                                       customTypeName,
                                       saveCustom,
                                       onChange,
                                       required,
                                       hasError,
                                       error,
                                   }: Props) {
    const selected = customerTypes.find((t) => t.id === value);
    const isOther = selected?.code === OTHER_CODE;

    const handleSelectChange = (newValue: string) => {
        const typeId = newValue ? Number(newValue) : null;
        const t = customerTypes.find((x) => x.id === typeId);
        if (t?.code !== OTHER_CODE) {
            onChange(typeId, '', saveCustom);
        } else {
            onChange(typeId, customTypeName, saveCustom);
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
                <Field
                    label="What type?"
                    htmlFor="customTypeName"
                    required
                    help="Specify the type since 'Other' was selected"
                >
                    <Input
                        id="customTypeName"
                        value={customTypeName}
                        onChange={(e) => onChange(value, e.target.value, saveCustom)}
                        placeholder="e.g., Bakery, Grocery, Hotel"
                        hasError={!!error && !customTypeName}
                        autoComplete="off"
                    />

                    <label className="flex items-start gap-2 mt-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={saveCustom}
                            onChange={(e) => onChange(value, customTypeName, e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                            <span className="font-medium">
                                {customTypeName.trim()
                                    ? `Save "${customTypeName.trim()}" to my types`
                                    : 'Save to my types'}
                            </span>
                            <span className="block text-xs text-gray-500 mt-0.5">
                                Reuse it in future customer records
                            </span>
                        </span>
                    </label>
                </Field>
            )}
        </>
    );
}