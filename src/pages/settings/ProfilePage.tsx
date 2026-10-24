import { useState, useEffect, type FormEvent } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Loader2, Save, Edit2, X, User, Mail, Phone } from 'lucide-react';
import { updateProfile } from '@/api/settings';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';

interface UserProfile {
    username: string;
    fullName: string;
    email: string;
    phone: string;
}

export function ProfileSettingsPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const toast = useToast();

    const [isEditing, setIsEditing] = useState(false);

    // 1. Fetch data properly
    const { data, isLoading } = useQuery({
        queryKey: ['auth-me'],
        queryFn: async () => {
            const res = await apiClient.get<{ data: UserProfile }>('/api/auth/me');
            return res.data.data;
        },
    });

    // 2. Form State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // 3. Populate form state when data arrives
    useEffect(() => {
        if (data) {
            setFullName(data.fullName ?? '');
            setEmail(data.email ?? '');
            setPhone(data.phone ?? '');
        }
    }, [data]);

    // 4. Update Mutation
    const mutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            toast.success('Profile updated');
            queryClient.invalidateQueries({ queryKey: ['auth-me'] });
            setIsEditing(false);
        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Failed to update');
        },
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const payload: any = {};
        if (fullName.trim()) payload.fullName = fullName.trim();
        if (email.trim()) payload.email = email.trim();
        if (phone.trim()) payload.phone = phone.trim();
        await mutation.mutateAsync(payload);
    };

    const handleCancel = () => {
        setFullName(data?.fullName ?? '');
        setEmail(data?.email ?? '');
        setPhone(data?.phone ?? '');
        setIsEditing(false);
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 max-w-2xl">
            {/* Header with Edit Button */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        {data?.fullName ? `${data.fullName}'s Profile` : 'My Profile'}
                    </h2>
                    <p className="text-sm text-gray-500">Manage your personal information.</p>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition"
                >
                    <Edit2 size={16} />
                    Edit Profile
                </button>
            </div>

            {/* View Mode */}
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <User size={20} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Username</div>
                        <div className="text-base text-gray-900 font-medium">{data?.username || user?.username || 'Not set'}</div>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
                        <User size={20} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Full Name</div>
                        <div className="text-base text-gray-900">{data?.fullName || 'Not set'}</div>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Mail size={20} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Email Address</div>
                        <div className="text-base text-gray-900">{data?.email || 'Not set'}</div>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <Phone size={20} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Phone Number</div>
                        <div className="text-base text-gray-900">{data?.phone || 'Not set'}</div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
                >
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Edit Profile</h3>
                            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 p-1">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-5">
                            <Field label="Username" htmlFor="username" help="Cannot be changed">
                                <Input id="username" value={data?.username ?? user?.username ?? ''} disabled className="bg-gray-100 text-gray-500" />
                            </Field>

                            <Field label="Full Name" htmlFor="fullName">
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                />
                            </Field>

                            <Field label="Email" htmlFor="email">
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                />
                            </Field>

                            <Field label="Phone" htmlFor="phone">
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
                                    disabled={mutation.isPending}
                                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition inline-flex items-center justify-center gap-2"
                                >
                                    {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={mutation.isPending}
                                    className="px-4 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}