import { useState, type FormEvent, useEffect } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createInvite } from '@/api/invites';
import { useToast } from '@/contexts/ToastContext';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import type { CreateInviteRequest, InvitableRole } from '@/types';
import { ROLE_LABELS } from '@/types';

const ROLE_OPTIONS: InvitableRole[] = ['WORKER', 'MANAGER', 'ADMIN'];

interface Props {
    onClose: () => void;
}

export function InviteModal({ onClose }: Props) {
    const queryClient = useQueryClient();
    const toast = useToast();

    const [invitedName, setInvitedName] = useState('');
    const [invitedEmail, setInvitedEmail] = useState('');
    const [role, setRole] = useState<InvitableRole>('WORKER');
    const [expiryDays, setExpiryDays] = useState('7');
    const [error, setError] = useState('');

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const mutation = useMutation({
        mutationFn: (data: CreateInviteRequest) => createInvite(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invites'] });
            toast.success('Invite created');
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to create invite');
        },
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        const days = parseInt(expiryDays, 10);
        if (isNaN(days) || days < 1 || days > 30) {
            setError('Expiry must be between 1 and 30 days');
            return;
        }

        await mutation.mutateAsync({
            invitedName: invitedName.trim() || undefined,
            invitedEmail: invitedEmail.trim() || undefined,
            role,
            expiryDays: days,
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Invite a Team Member</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <p className="text-sm text-gray-500">
                        A shareable code will be generated. Send it to the person so they can join your farm.
                    </p>

                    <Field label="Name" htmlFor="invitedName" help="Optional — for your reference">
                        <Input
                            id="invitedName"
                            value={invitedName}
                            onChange={(e) => setInvitedName(e.target.value)}
                            placeholder="e.g., Karim Sheikh"
                            autoComplete="off"
                        />
                    </Field>

                    <Field label="Email" htmlFor="invitedEmail" help="Optional">
                        <Input
                            id="invitedEmail"
                            type="email"
                            value={invitedEmail}
                            onChange={(e) => setInvitedEmail(e.target.value)}
                            placeholder="karim@example.com"
                            autoComplete="off"
                        />
                    </Field>

                    <Field label="Role" htmlFor="role" required>
                        <Select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as InvitableRole)}
                        >
                            {ROLE_OPTIONS.map((r) => (
                                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Expires in (days)" htmlFor="expiryDays" required help="Between 1 and 30 days">
                        <Input
                            id="expiryDays"
                            type="number"
                            min="1"
                            max="30"
                            value={expiryDays}
                            onChange={(e) => setExpiryDays(e.target.value)}
                        />
                    </Field>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition inline-flex items-center justify-center gap-2"
                        >
                            {mutation.isPending ? (
                                <><Loader2 size={18} className="animate-spin" />Creating…</>
                            ) : (
                                <><Send size={18} />Create Invite</>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={mutation.isPending}
                            className="px-4 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}