import type { Category } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';

const OTHER_CODE = 'OTHER';

interface Props {
    categories: Category[];
    value: number | null;
    customProductName: string;
    saveCustom: boolean;
    onChange: (categoryId: number | null, customName: string, saveCustom: boolean) => void;
    required?: boolean;
    hasError?: boolean;
    error?: string;
}

export function CategorySelect({
                                   categories,
                                   value,
                                   customProductName,
                                   saveCustom,
                                   onChange,
                                   required,
                                   hasError,
                                   error,
                               }: Props) {
    const selectedCategory = categories.find((c) => c.id === value);
    const isOther = selectedCategory?.code === OTHER_CODE;

    const handleSelectChange = (newValue: string) => {
        const catId = newValue ? Number(newValue) : null;
        const cat = categories.find((c) => c.id === catId);
        if (cat?.code !== OTHER_CODE) {
            onChange(catId, '', saveCustom);
        } else {
            onChange(catId, customProductName, saveCustom);
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
                <Field
                    label="What are you selling?"
                    htmlFor="customProductName"
                    required
                    help="Specify the exact product since category is 'Other'"
                >
                    <Input
                        id="customProductName"
                        value={customProductName}
                        onChange={(e) => onChange(value, e.target.value, saveCustom)}
                        placeholder="e.g., Honey, Grass, Dung"
                        hasError={!!error && !customProductName}
                        autoComplete="off"
                    />

                    <label className="flex items-start gap-2 mt-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={saveCustom}
                            onChange={(e) => onChange(value, customProductName, e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                            <span className="font-medium">
                                Save "{customProductName || 'this'}" as a category
                            </span>
                            <span className="block text-xs text-gray-500 mt-0.5">
                                Reuse it in future sales
                            </span>
                        </span>
                    </label>
                </Field>
            )}
        </>
    );
}