import type { Unit } from '@/types';
import { Field } from '@/components/forms/Field';
import { Select } from '@/components/forms/Select';

const OTHER_VALUE = '__OTHER__';

interface Props {
    units: Unit[];
    value: number | null;
    isOther: boolean;
    onChange: (unitId: number | null, isOtherMode: boolean) => void;
    required?: boolean;
    hasError?: boolean;
    error?: string;
}

export function UnitSelect({
                               units,
                               value,
                               isOther,
                               onChange,
                               required,
                               hasError,
                               error,
                           }: Props) {
    const selectValue = isOther ? OTHER_VALUE : value !== null ? String(value) : '';

    const handleSelectChange = (newValue: string) => {
        if (newValue === OTHER_VALUE) {
            onChange(null, true);
        } else if (newValue === '') {
            onChange(null, false);
        } else {
            onChange(Number(newValue), false);
        }
    };

    return (
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
                <option value={OTHER_VALUE}> Other (New Unit)</option>
            </Select>
        </Field>
    );
}