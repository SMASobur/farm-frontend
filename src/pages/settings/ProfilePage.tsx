import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';
import { updateProfile } from '@/api/settings';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';

export function ProfileSettingsPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const toast = useToast();

    const [fullName, setFullName] = useState(user?.fullName ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [phone, setPhone] = useState('');

    const mutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            toast.success('Profile updated');
            queryClient.invalidateQueries({ queryKey: ['auth-me'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update'),
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await mutation.mutateAsync({ fullName, email, phone });
    };

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 max-w-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-1">My Profile</h2>
            <p className="text-sm text-gray-500 mb-6">Update your personal information.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="Username" htmlFor="username" help="Cannot be changed">
                    <Input id="username" value={user?.username ?? ''} disabled className="bg-gray-100" />
                </Field>
                <Field label="Full Name" htmlFor="fullName">
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </Field>
                <Field label="Email" htmlFor="email">
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field label="Phone" htmlFor="phone">
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01712345678" />
                </Field>
                <button type="submit" disabled={mutation.isPending} className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 inline-flex items-center gap-2">
                    {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Profile
                </button>
            </form>
        </div>
    );
}