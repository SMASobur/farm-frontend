import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, Edit2, X, Home, MapPin, Upload, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '@/api/client';
import { getCurrentFarm, updateCurrentFarm } from '@/api/settings';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';

export function FarmSettingsPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isOwner = user?.role === 'OWNER';
    const [isEditing, setIsEditing] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['farm-current'],
        queryFn: getCurrentFarm,
    });

    // Form State
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (data?.data) {
            setName(data.data.name);
            setLocation(data.data.location ?? '');
            setLogoUrl((data.data as any).logoUrl ?? null);
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: updateCurrentFarm,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['farm-current'] });
            toast.success('Farm details updated');
            setIsEditing(false);
        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Failed to update farm');
        },
    });

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            const res = await apiClient.post('/api/farms/logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setLogoUrl(res.data.data.logoUrl);
            queryClient.invalidateQueries({ queryKey: ['farm-current'] });
            toast.success('Logo uploaded successfully');
        } catch {
            toast.error('Failed to upload logo');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await mutation.mutateAsync({ name: name.trim(), location: location.trim() });
    };

    const handleCancel = () => {
        setName(data?.data.name ?? '');
        setLocation(data?.data.location ?? '');
        setIsEditing(false);
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading farm details...</div>;

    const farm = data?.data;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 max-w-2xl">
            {/* Header with Edit Button */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Farm Details</h2>
                    <p className="text-sm text-gray-500">Manage your farm's public information.</p>
                </div>
                {isOwner && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition"
                    >
                        <Edit2 size={16} />
                        Edit Details
                    </button>
                )}
            </div>

            {/* View Mode */}
            <div className="space-y-6">
                {/* Logo */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Farm Logo" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon size={24} className="text-gray-400" />
                        )}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Farm Logo</div>
                        <div className="text-xs text-gray-400 mt-1">Click edit to change logo</div>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
                        <Home size={20} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Farm Code</div>
                        <div className="text-base text-gray-900 font-mono">{farm?.code}</div>
                        <div className="text-xs text-gray-400">Cannot be changed</div>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Home size={20} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Farm Name</div>
                        <div className="text-base text-gray-900 font-medium">{farm?.name || 'Not set'}</div>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Location</div>
                        <div className="text-base text-gray-900">{farm?.location || 'Not set'}</div>
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
                            <h3 className="font-bold text-gray-900">Edit Farm Details</h3>
                            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 p-1">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-5">

                            {/* Logo Upload Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Farm Logo</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-16 h-16 rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Farm Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={24} className="text-gray-400" />
                                        )}
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                        {logoUrl ? 'Change' : 'Upload'}
                                    </button>
                                </div>
                            </div>

                            <Field label="Farm Name" htmlFor="name" required>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your farm name"
                                />
                            </Field>

                            <Field label="Location" htmlFor="location">
                                <Input
                                    id="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Village, District"
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