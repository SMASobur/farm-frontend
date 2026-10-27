import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, X } from 'lucide-react';
import { createCustomer } from '@/api/customers';
import type { CustomerRequest } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';

interface Props {
    onClose: () => void;
    onSuccess: (customerId: number) => void;
}

export function NewCustomerModal({ onClose, onSuccess }: Props) {
    const queryClient = useQueryClient();
    const toast = useToast();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const mutation = useMutation({
        mutationFn: (data: CustomerRequest) => createCustomer(data),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success('Customer created');
            onSuccess(res.data.id); // Pass the new ID back to the Sale form
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to create customer');
        },
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        await mutation.mutateAsync({ name: name.trim(), phone: phone.trim() });
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-xl">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Add New Customer</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <Field label="Customer Name" htmlFor="name" required>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Rahim Uddin"
                            autoFocus
                        />
                    </Field>
                    <Field label="Phone Number" htmlFor="phone" help="Optional">
                        <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="01712345678"
                        />
                    </Field>
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={mutation.isPending || !name.trim()}
                            className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                        >
                            {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Customer
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}