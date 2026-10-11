import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Users, Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { listInvites } from '@/api/invites';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { InviteCard } from '@/components/team/InviteCard';
import { InviteModal } from '@/components/team/InviteModal';
import type { Invite } from '@/types';
import { ROLE_LABELS, ROLE_COLORS } from '@/types';

export function TeamPage() {
    const { user } = useAuth();
    const toast = useToast();

    const [showInviteModal, setShowInviteModal] = useState(false);

    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['invites'],
        queryFn: () => listInvites(),
    });

    const invites: Invite[] = data?.data ?? [];

    // Separate active from historical
    const pendingInvites = invites.filter((i) => i.status === 'PENDING' && !i.expired);
    const otherInvites = invites.filter((i) => i.status !== 'PENDING' || i.expired);

    // Only OWNER and ADMIN can invite
    const canInvite = user?.role === 'OWNER' || user?.role === 'ADMIN';

    const handleInviteClick = () => {
        if (!canInvite) {
            toast.error('Only OWNER or ADMIN can invite members');
            return;
        }
        setShowInviteModal(true);
    };

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Team</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage who has access to your farm
                    </p>
                </div>
                {canInvite && (
                    <button
                        onClick={handleInviteClick}
                        className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Invite Member</span>
                        <span className="sm:hidden">Invite</span>
                    </button>
                )}
            </div>

            {/* Current user info */}
            {user && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Users size={14} />
                        You
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-semibold shrink-0">
                            {(user.fullName || user.username).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">
                                {user.fullName || user.username}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                                {user.username}
                            </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS[user.role]}`}>
                            {ROLE_LABELS[user.role]}
                        </span>
                    </div>
                </div>
            )}

            {/* Refreshing indicator */}
            {isFetching && !isLoading && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-blue-800">
                    <RefreshCw size={12} className="animate-spin shrink-0" />
                    <span>Refreshing…</span>
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-32 shimmer rounded-2xl"></div>
                    ))}
                </div>
            )}

            {/* Error */}
            {isError && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
                    <p className="text-red-800 font-semibold">Couldn't load invites</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2"
                    >
                        <RefreshCw size={16} /> Try again
                    </button>
                </div>
            )}

            {/* Pending invites */}
            {!isLoading && !isError && (
                <>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Mail size={14} />
                            Pending Invites
                            {pendingInvites.length > 0 && (
                                <span className="text-xs font-normal text-gray-400">
                                    ({pendingInvites.length})
                                </span>
                            )}
                        </h2>

                        {pendingInvites.length === 0 ? (
                            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center">
                                <Mail className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-sm text-gray-500">
                                    No pending invites.
                                </p>
                                {canInvite && (
                                    <button
                                        onClick={handleInviteClick}
                                        className="inline-flex items-center gap-1.5 mt-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                                    >
                                        <Plus size={14} />
                                        Create First Invite
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingInvites.map((invite) => (
                                    <InviteCard key={invite.id} invite={invite} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* History */}
                    {otherInvites.length > 0 && (
                        <div>
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Invite History
                            </h2>
                            <div className="space-y-3">
                                {otherInvites.map((invite) => (
                                    <InviteCard key={invite.id} invite={invite} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    How invites work
                </h3>
                <ol className="text-xs text-blue-800 space-y-1.5 list-decimal list-inside">
                    <li>Create an invite, you get a unique code</li>
                    <li>Copy the code and send it via WhatsApp or SMS</li>
                    <li>They open the app, click "Join Farm", enter the code</li>
                    <li>They set a username &amp; password and join your farm</li>
                </ol>
            </div>

            {/* Modal */}
            {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
        </div>
    );
}