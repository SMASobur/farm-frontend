import { useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, CheckCircle2, XCircle, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export interface ColumnDef<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => ReactNode;
}

interface Props<T> {
    title: string;
    description: string;
    queryKey: string;
    queryFn: () => Promise<{ data: T[] }>;
    createFn: (data: any) => Promise<any>;
    updateFn: (id: number, data: any) => Promise<any>;
    toggleActiveFn?: (id: number, active: boolean) => Promise<any>;
    deleteFn?: (id: number) => Promise<any>;
    columns: ColumnDef<T>[];
    renderForm: (initialData: T | null, onSubmit: (data: any) => void, onCancel: () => void) => ReactNode;
    searchPlaceholder?: string;
    filterFn?: (item: T, query: string) => boolean;
}

export function EntityManager<T extends { id: number; name: string; active: boolean }>({
                                                                                           title,
                                                                                           description,
                                                                                           queryKey,
                                                                                           queryFn,
                                                                                           createFn,
                                                                                           updateFn,
                                                                                           toggleActiveFn,
                                                                                           deleteFn,
                                                                                           columns,
                                                                                           renderForm,
                                                                                           searchPlaceholder = 'Search...',
                                                                                           filterFn,
                                                                                       }: Props<T>) {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);

    // NEW: State for delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<T | null>(null);

    // Fetch Data
    const { data, isLoading } = useQuery({
        queryKey: [queryKey],
        queryFn,
    });

    const items = data?.data ?? [];

    // Filtering
    const filteredItems = filterFn
        ? items.filter((item) => filterFn(item, search))
        : items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: createFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            toast.success('Created successfully');
            setIsModalOpen(false);
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create'),
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: (args: { id: number; data: any }) => updateFn(args.id, args.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            toast.success('Updated successfully');
            setIsModalOpen(false);
            setEditingItem(null);
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update'),
    });

    // Toggle Mutation
    const toggleMutation = useMutation({
        mutationFn: (args: { id: number; active: boolean }) => toggleActiveFn!(args.id, args.active),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            toast.success('Status updated');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update status'),
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: deleteFn!,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            toast.success('Deleted permanently');
            setDeleteTarget(null); // Close modal
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete');
            setDeleteTarget(null); // Close modal on error too
        },
    });

    const handleSubmit = (formData: any) => {
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
                <button
                    onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                >
                    <Plus size={18} />
                    Add New
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                />
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-14 shimmer rounded-lg"></div>
                    ))}
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No {title.toLowerCase()} found.
                </div>
            ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                    {filteredItems.map((item) => (
                        <div key={item.id} className={`flex items-center justify-between p-4 hover:bg-gray-50 transition ${!item.active ? 'opacity-60 bg-gray-50' : ''}`}>
                            <div className="flex-1 min-w-0">
                                {columns.map((col) => (
                                    <div key={String(col.key)} className="flex items-center gap-2">
                                        {col.render ? col.render(item) : (
                                            <span className="text-sm text-gray-900 font-medium truncate">
                                                {(item as any)[col.key]}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 ml-4 shrink-0">
                                {!item.active && (
                                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                                        Inactive
                                    </span>
                                )}
                                <button
                                    onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                    title="Edit"
                                >
                                    <Edit2 size={16} />
                                </button>
                                {toggleActiveFn && (
                                    <button
                                        onClick={() => toggleMutation.mutate({ id: item.id, active: !item.active })}
                                        className={`p-2 rounded-lg transition ${
                                            item.active
                                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                        }`}
                                        title={item.active ? 'Deactivate' : 'Activate'}
                                    >
                                        {item.active ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                                    </button>
                                )}
                                {deleteFn && (
                                    <button
                                        onClick={() => setDeleteTarget(item)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Delete Permanently"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) { setIsModalOpen(false); setEditingItem(null); } }}
                >
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">
                                {editingItem ? 'Edit' : 'Add'} {title}
                            </h3>
                            <button
                                onClick={() => { setIsModalOpen(false); setEditingItem(null); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-5">
                            {renderForm(
                                editingItem,
                                handleSubmit,
                                () => { setIsModalOpen(false); setEditingItem(null); }
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* NEW: Delete Confirmation Modal */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
                >
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete {title}?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to permanently delete <strong>"{deleteTarget.name}"</strong>? This action cannot be undone.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    disabled={deleteMutation.isPending}
                                    className="flex-1 px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteMutation.mutate(deleteTarget.id)}
                                    disabled={deleteMutation.isPending}
                                    className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
                                >
                                    {deleteMutation.isPending ? (
                                        <><Loader2 size={16} className="animate-spin" /> Deleting...</>
                                    ) : (
                                        'Yes, Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}