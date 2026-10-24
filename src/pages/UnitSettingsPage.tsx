import { useState, type FormEvent } from 'react';
import { Ruler } from 'lucide-react';
import { EntityManager, type ColumnDef } from '@/components/settings/EntityManager';
import { listUnitsAll, createUnit, updateUnit, toggleUnitActive, deleteUnit,  type UnitRequest } from '@/api/settings';
import type { Unit } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';

const localGenerateCode = (name: string) =>
    name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');

export function UnitSettingsPage() {
    const columns: ColumnDef<Unit>[] = [
        {
            key: 'name',
            header: 'Unit',
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Ruler size={16} />
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">
                            {item.name} {item.abbreviation && <span className="text-xs text-gray-500 ml-1">({item.abbreviation})</span>}
                        </div>
                        {item.nameBn && <div className="text-xs text-gray-500">{item.nameBn}</div>}
                    </div>
                </div>
            ),
        },
        {
            key: 'code',
            header: 'Code',
            render: (item) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-600">
                    {item.code}
                </span>
            ),
        },
    ];

    return (
        <EntityManager<Unit>
            title="Units"
            description="Manage how you measure products (Liters, Kg, Sacks, etc.)"
            queryKey="units-settings"
            queryFn={() => listUnitsAll(true)}
            createFn={createUnit}
            updateFn={updateUnit}
            toggleActiveFn={toggleUnitActive}
            deleteFn={deleteUnit}
            columns={columns}
            renderForm={(initial, onSubmit, onCancel) => (
                <UnitForm
                    initial={initial}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                />
            )}
            searchPlaceholder="Search units..."
        />
    );
}

function UnitForm({
                      initial,
                      onSubmit,
                      onCancel
                  }: {
    initial: Unit | null;
    onSubmit: (data: UnitRequest) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(initial?.name ?? '');
    const [nameBn, setNameBn] = useState(initial?.nameBn ?? '');
    const [abbreviation, setAbbreviation] = useState(initial?.abbreviation ?? '');
    const [error, setError] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Unit name is required.');
            return;
        }

        const payload: UnitRequest = {
            name: name.trim(),
            nameBn: nameBn.trim() || undefined,
            code: initial?.code || localGenerateCode(name),
            abbreviation: abbreviation.trim() || undefined,
            active: initial?.active ?? true,
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <Field label="Unit Name" htmlFor="unitName" required>
                <Input
                    id="unitName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Liter, Kilogram, Sack"
                    autoFocus
                />
            </Field>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Abbreviation" htmlFor="unitAbbr" help="Optional">
                    <Input
                        id="unitAbbr"
                        value={abbreviation}
                        onChange={(e) => setAbbreviation(e.target.value)}
                        placeholder="e.g. L, kg"
                    />
                </Field>

                <Field label="Name (Bengali)" htmlFor="unitNameBn" help="Optional">
                    <Input
                        id="unitNameBn"
                        value={nameBn}
                        onChange={(e) => setNameBn(e.target.value)}
                        placeholder="e.g. লিটার"
                    />
                </Field>
            </div>

            <Field label="System Code" htmlFor="unitCode" help="Auto-generated, cannot be changed on edit">
                <Input
                    id="unitCode"
                    value={initial?.code || localGenerateCode(name)}
                    disabled
                    className="bg-gray-100 text-gray-500 cursor-not-allowed font-mono"
                />
            </Field>

            <div className="flex items-center gap-3 pt-4">
                <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
                >
                    Save Unit
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}