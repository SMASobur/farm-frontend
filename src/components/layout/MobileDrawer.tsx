import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
    to: string;
    label: string;
    icon: LucideIcon;
}

interface Props {
    open: boolean;
    onClose: () => void;
    navItems: NavItem[];
    farmName: string;
    farmLogoUrl: string | null;
}

export function MobileDrawer({ open, onClose, navItems, farmName, farmLogoUrl }: Props) {
    const { user } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    const farmInitial = farmName.charAt(0).toUpperCase();

    return (
        <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 animate-in fade-in duration-150"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                            {farmLogoUrl ? (
                                <img
                                    src={farmLogoUrl}
                                    alt={farmName}
                                    className="w-9 h-9 rounded-md object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-9 h-9 bg-green-600 rounded-md flex items-center justify-center text-white font-bold shrink-0">
                                    {farmInitial}
                                </div>
                            )}
                            <div className="min-w-0">
                                <div className="font-semibold text-gray-900 leading-tight text-sm truncate">
                                    {farmName}
                                </div>
                                <div className="text-xs text-gray-500 leading-tight truncate">
                                    {user?.fullName || user?.username}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition shrink-0"
                            aria-label="Close menu"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="text-xs text-gray-400">{user?.role}</div>
                </div>

                {/* Nav items */}
                <nav className="flex-1 overflow-y-auto p-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.to);
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                                    isActive
                                        ? 'bg-green-50 text-green-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100">
                    <div className="text-xs text-gray-400 text-center">
                        Farm Management
                    </div>
                </div>
            </div>
        </div>
    );
}