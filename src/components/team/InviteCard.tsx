import { useState } from 'react';
import { Copy, Check, Loader2, Mail, User } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { revokeInvite } from '@/api/invites';
import { useToast } from '@/contexts/ToastContext';
import type { Invite } from '@/types';
import {
    INVITE_STATUS_LABELS,
    INVITE_STATUS_COLORS,
    ROLE_LABELS,
    ROLE_COLORS,
} from '@/types';
import { formatDateShort } from '@/lib/format';

export function InviteCard({ invite }: { invite: Invite }) {
    const queryClient = useQueryClient();
    const toast = useToast();

    const [copied, setCopied] = useState(false);
    const [confirmRevoke, setConfirmRevoke] = useState(false);

    const revokeMutation = useMutation({
        mutationFn: () => revokeInvite(invite.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invites'] });
            toast.success('Invite revoked');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to revoke');
        },
    });

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(invite.shareableMessage);
            setCopied(true);
            toast.success('Invite code copied');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy');
        }
    };

    // Determine status: use stored status, but if expired compute real status
    const displayStatus = invite.status === 'PENDING' && invite.expired ? 'EXPIRED' : invite.status;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-semibold text-gray-900 tracking-wider">
                            {invite.code}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[invite.role]}`}>
                            {ROLE_LABELS[invite.role]}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${INVITE_STATUS_COLORS[displayStatus]}`}>
                            {INVITE_STATUS_LABELS[displayStatus]}
                        </span>
                    </div>

                    {/* Optional metadata */}
                    {(invite.invitedName || invite.invitedEmail) && (
                        <div className="text-xs text-gray-500 mt-2 flex items-center gap-3 flex-wrap">
                            {invite.invitedName && (
                                <span className="inline-flex items-center gap-1">
                                    <User size={11} />
                                    {invite.invitedName}
                                </span>
                            )}
                            {invite.invitedEmail && (
                                <span className="inline-flex items-center gap-1">
                                    <Mail size={11} />
                                    {invite.invitedEmail}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Dates */}
                    <div className="text-xs text-gray-400 mt-2">
                        {invite.status === 'PENDING' && !invite.expired && (
                            <>Expires {formatDateShort(invite.expiresAt)}</>
                        )}
                        {invite.status === 'ACCEPTED' && invite.acceptedAt && (
                            <>Accepted by {invite.acceptedByName} · {formatDateShort(invite.acceptedAt)}</>
                        )}
                        {displayStatus === 'EXPIRED' && (
                            <>Expired {formatDateShort(invite.expiresAt)}</>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            {invite.status === 'PENDING' && !invite.expired && (
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                        onClick={handleCopy}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg transition"
                    >
                        {copied ? (
                            <>
                                <Check size={14} />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy size={14} />
                                Copy Invite
                            </>
                        )}
                    </button>

                    {!confirmRevoke ? (
                        <button
                            onClick={() => setConfirmRevoke(true)}
                            className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                        >
                            Revoke
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => revokeMutation.mutate()}
                                disabled={revokeMutation.isPending}
                                className="text-sm font-medium bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1.5"
                            >
                                {revokeMutation.isPending ? (
                                    <><Loader2 size={12} className="animate-spin" />Confirming…</>
                                ) : (
                                    <>Confirm</>
                                )}
                            </button>
                            <button
                                onClick={() => setConfirmRevoke(false)}
                                disabled={revokeMutation.isPending}
                                className="text-sm px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}