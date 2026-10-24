import { Outlet, NavLink } from 'react-router-dom';
import { User, Home, Lock, Tag, Ruler, PawPrint, Users } from 'lucide-react';

const settingsNav = [
    { to: '/settings/profile',  label: 'My Profile',        icon: User },
    { to: '/settings/farm',     label: 'Farm Details',      icon: Home },
    { to: '/settings/security', label: 'Security',          icon: Lock },
    { to: '/settings/categories', label: 'Categories',      icon: Tag },
    { to: '/settings/units',    label: 'Units',             icon: Ruler },
    { to: '/settings/species',  label: 'Species',           icon: PawPrint },
    { to: '/settings/customer-types', label: 'Customer Types', icon: Users },
];

export function SettingsLayout() {
    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage your account, farm details, and system dictionaries.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar nav */}
                <aside className="md:w-56 shrink-0">
                    <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
                        {settingsNav.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                                            isActive
                                                ? 'bg-green-50 text-green-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    <Icon size={16} />
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </nav>
                </aside>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}