import type { Category } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';

const OTHER_CODE = 'OTHER';

interface Props {
    categories: Category[];
    value: number | null;
    customNameEn: string;
    customNameBn: string;
    saveCustom: boolean;
    onChange: (categoryId: number | null, nameEn: string, nameBn: string, saveCustom: boolean) => void;
    required?: boolean;
    hasError?: boolean;
    error?: string;
}

export function ExpenseCategorySelect({
                                          categories,
                                          value,
                                          customNameEn,
                                          customNameBn,
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
            onChange(id, '', '', saveCustom);
        } else {
            onChange(id, customNameEn, customNameBn, saveCustom);
        }
    };

    return (
        <>
            <Field
                label="Category"
                htmlFor="categoryId"
                required={required}
                error={error}
                help="What type of cost is this?"
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
                            Specify the custom category
                        </div>
                        <div className="text-xs text-amber-700">
                            Required to distinguish this expense from generic "Other"
                        </div>
                    </div>

                    <Field
                        label="English Name"
                        htmlFor="customCategoryNameEn"
                        required
                        help="e.g., Honey Supplies"
                    >
                        <Input
                            id="customCategoryNameEn"
                            value={customNameEn}
                            onChange={(e) => onChange(value, e.target.value, customNameBn, saveCustom)}
                            placeholder="Honey Supplies"
                            hasError={!!error && !customNameEn.trim()}
                            autoComplete="off"
                        />
                    </Field>

                    <Field
                        label="Bengali Name"
                        htmlFor="customCategoryNameBn"
                        help="Optional — e.g., মধু সরবরাহ"
                    >
                        <Input
                            id="customCategoryNameBn"
                            value={customNameBn}
                            onChange={(e) => onChange(value, customNameEn, e.target.value, saveCustom)}
                            placeholder="মধু সরবরাহ"
                            autoComplete="off"
                        />
                    </Field>

                    <label className="flex items-start gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={saveCustom}
                            onChange={(e) => onChange(value, customNameEn, customNameBn, e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                            <span className="font-medium">
                                {customNameEn.trim()
                                    ? `Save "${customNameEn.trim()}" to my categories`
                                    : 'Save to my categories'}
                            </span>
                            <span className="block text-xs text-gray-500 mt-0.5">
                                Reuse it in future expenses
                            </span>
                        </span>
                    </label>
                </div>
            )}
        </>
    );
}