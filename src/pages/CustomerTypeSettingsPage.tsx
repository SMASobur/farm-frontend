import { useState, type FormEvent } from 'react';
import { Users } from 'lucide-react';
import { EntityManager, type ColumnDef } from '@/components/settings/EntityManager';
import { listCustomerTypesAll, createCustomerType, updateCustomerType, toggleCustomerTypeActive, type CustomerTypeRequest } from '@/api/settings';
import type { CustomerType } from '@/types';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';

const localGenerateCode = (name: string) =>
    name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');

export function CustomerTypeSettingsPage() {
    const columns: ColumnDef<CustomerType>[] = [
        {
            key: 'name',
            header: 'Customer Type',
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Users size={16} />
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.nameBn && <div className="text-xs text-gray-500">{item.nameBn}</div>}
                    </div>
                </div>
            ),
        },
    ];

    return (
        <EntityManager<CustomerType>
            title="Customer Types"
            description="Manage buyer categories (Household, Wholesaler, Restaurant, etc.)"
            queryKey="customer-types-settings"
            queryFn={() => listCustomerTypesAll(true)}
            createFn={createCustomerType}
            updateFn={updateCustomerType}
            toggleActiveFn={toggleCustomerTypeActive}
            columns={columns}
            renderForm={(initial, onSubmit, onCancel) => (
                <CustomerTypeForm
                    initial={initial}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                />
            )}
            searchPlaceholder="Search customer types..."
        />
    );
}

function CustomerTypeForm({
                              initial,
                              onSubmit,
                              onCancel
                          }: {
    initial: CustomerType | null;
    onSubmit: (data: CustomerTypeRequest) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(initial?.name ?? '');
    const [nameBn, setNameBn] = useState(initial?.nameBn ?? '');
    const [error, setError] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Customer Type name is required.');
            return;
        }

        const payload: CustomerTypeRequest = {
            name: name.trim(),
            nameBn: nameBn.trim() || undefined,
            code: initial?.code || localGenerateCode(name),
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

            <Field label="Type Name" htmlFor="ctName" required>
                <Input
                    id="ctName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Household, Restaurant, Wholesaler"
                    autoFocus
                />
            </Field>

            <Field label="Name (Bengali)" htmlFor="ctNameBn" help="Optional">
                <Input
                    id="ctNameBn"
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    placeholder="e.g. পরিবার"
                />
            </Field>

            <Field label="System Code" htmlFor="ctCode" help="Auto-generated, cannot be changed on edit">
                <Input
                    id="ctCode"
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
                    Save Customer Type
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