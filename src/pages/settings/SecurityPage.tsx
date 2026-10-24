import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Save, Lock } from 'lucide-react';
import { changePassword } from '@/api/settings';
import { useToast } from '@/contexts/ToastContext';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';

export function SecuritySettingsPage() {
    const toast = useToast();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const mutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            toast.success('Password changed');
            setCurrentPassword('');
            setNewPassword('');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to change password'),
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await mutation.mutateAsync({ currentPassword, newPassword });
    };

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 max-w-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2"><Lock size={18} /> Security</h2>
            <p className="text-sm text-gray-500 mb-6">Change your account password.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="Current Password" htmlFor="currentPassword" required>
                    <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </Field>
                <Field label="New Password" htmlFor="newPassword" required>
                    <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </Field>
                <button type="submit" disabled={mutation.isPending} className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 inline-flex items-center gap-2">
                    {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Change Password
                </button>
            </form>
        </div>
    );
}