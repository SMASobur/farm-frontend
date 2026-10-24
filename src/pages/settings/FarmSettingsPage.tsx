import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, Lock, Upload, Image as ImageIcon } from 'lucide-react';
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

    // We explicitly type the Query data to fix the TS2339 errors
    const { data, isLoading } = useQuery({
        queryKey: ['farm-current'],
        queryFn: getCurrentFarm,
    });

    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (data?.data) {
            setName(data.data.name);
            setLocation(data.data.location ?? '');
            // Note: If logoUrl isn't in the CurrentFarm type yet, you can cast it or add it to the type
            setLogoUrl((data.data as any).logoUrl ?? null);
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: updateCurrentFarm,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['farm-current'] });
            toast.success('Farm details updated');
        },
        // Fixed the "any" type error
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
            const res = await apiClient.post('/api/farms/current/logo', formData, {
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
        if (!isOwner) return;
        await mutation.mutateAsync({ name: name.trim(), location: location.trim() });
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading farm details...</div>;

    const farm = data?.data;

    return (
        <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 max-w-2xl">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Farm Details</h2>
                <p className="text-sm text-gray-500 mb-6">Update your farm's public information and logo.</p>

                {!isOwner && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-6 text-sm text-amber-800 flex items-center gap-2">
                        <Lock size={16} /> Only the farm OWNER can edit these details.
                    </div>
                )}

                <div className="mb-6 pb-6 border-b border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Farm Logo</label>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Farm Logo" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon size={32} className="text-gray-400" />
                            )}
                        </div>
                        <div>
                            <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!isOwner || isUploading}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                {logoUrl ? 'Change Logo' : 'Upload Logo'}
                            </button>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Field label="Farm Code" htmlFor="code" help="Unique identifier, cannot be changed">
                        <Input id="code" value={farm?.code ?? ''} disabled className="bg-gray-100 text-gray-500 font-mono" />
                    </Field>

                    <Field label="Farm Name" htmlFor="name" required>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={!isOwner} />
                    </Field>

                    <Field label="Location" htmlFor="location">
                        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} disabled={!isOwner} placeholder="Village, District" />
                    </Field>

                    {isOwner && (
                        <div className="pt-2">
                            <button type="submit" disabled={mutation.isPending} className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 inline-flex items-center gap-2">
                                {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Save Changes
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}