import { useState, type FormEvent } from 'react';
import { ShoppingCart, Receipt } from 'lucide-react';
import { EntityManager, type ColumnDef } from '@/components/settings/EntityManager.tsx';
import {
    listCategoriesAll,
    createCategory,
    updateCategory,
    toggleCategoryActive,
    deleteCategory,
    type CategoryRequest
} from '@/api/settings.ts';
import type { Category } from '@/types';
import { Field } from '@/components/forms/Field.tsx';
import { Input } from '@/components/forms/Input.tsx';
import { Select } from '@/components/forms/Select.tsx';

const localGenerateCode = (name: string) =>
    name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');

export function CategorySettingsPage() {
    const columns: ColumnDef<Category>[] = [
        {
            key: 'name',
            header: 'Category',
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.type === 'PRODUCT' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                        {item.type === 'PRODUCT' ? <ShoppingCart size={16} /> : <Receipt size={16} />}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.nameBn && <div className="text-xs text-gray-500">{item.nameBn}</div>}
                    </div>
                </div>
            ),
        },
        {
            key: 'type',
            header: 'Type',
            render: (item) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    item.type === 'PRODUCT'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                }`}>
                    {item.type === 'PRODUCT' ? 'Product' : 'Expense'}
                </span>
            ),
        },
    ];

    return (
        <EntityManager<Category>
            title="Categories"
            description="Manage product categories (for sales) and expense categories."
            queryKey="categories-settings"
            queryFn={() => listCategoriesAll(true)}
            createFn={createCategory}
            updateFn={updateCategory}
            toggleActiveFn={toggleCategoryActive}
            deleteFn={deleteCategory} // <-- ADDED THIS LINE
            columns={columns}
            renderForm={(initial, onSubmit, onCancel) => (
                <CategoryForm
                    initial={initial}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                />
            )}
            searchPlaceholder="Search categories..."
        />
    );
}

function CategoryForm({
                          initial,
                          onSubmit,
                          onCancel
                      }: {
    initial: Category | null;
    onSubmit: (data: CategoryRequest) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(initial?.name ?? '');
    const [nameBn, setNameBn] = useState(initial?.nameBn ?? '');
    const [type, setType] = useState<'PRODUCT' | 'EXPENSE'>(initial?.type as 'PRODUCT' | 'EXPENSE' ?? 'PRODUCT');
    const [error, setError] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Category name is required.');
            return;
        }

        const payload: CategoryRequest = {
            name: name.trim(),
            nameBn: nameBn.trim() || undefined,
            code: initial?.code || localGenerateCode(name),
            type,
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

            <Field label="Category Name" htmlFor="catName" required>
                <Input
                    id="catName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Milk, Feed, Medicine"
                    autoFocus
                />
            </Field>

            <Field label="Name (Bengali)" htmlFor="catNameBn" help="Optional">
                <Input
                    id="catNameBn"
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    placeholder="e.g. দুধ"
                />
            </Field>

            <Field label="Category Type" htmlFor="catType" required>
                <Select
                    id="catType"
                    value={type}
                    onChange={(e) => setType(e.target.value as 'PRODUCT' | 'EXPENSE')}
                >
                    <option value="PRODUCT">Product (for Sales)</option>
                    <option value="EXPENSE">Expense (for Expenses)</option>
                </Select>
            </Field>

            <div className="flex items-center gap-3 pt-4">
                <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
                >
                    Save Category
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