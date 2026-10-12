import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFarm } from '@/hooks/useFarm';
import { FarmLogoModal } from '@/components/farm/FarmLogoModal';
import {
  LayoutDashboard,
  Egg,
  Users,
  UserCog,
  ShoppingCart,
  Receipt,
  BarChart3,
  UserPlus,
  Settings,
  LogOut,
  Image as ImageIcon,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/animals',   label: 'Animals',   icon: Egg },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/workers',   label: 'Workers',   icon: UserCog },
  { to: '/sales',     label: 'Sales',     icon: ShoppingCart },
  { to: '/expenses',  label: 'Expenses',  icon: Receipt },
  { to: '/reports',   label: 'Reports',   icon: BarChart3 },
  { to: '/team',      label: 'Team',      icon: UserPlus },
  { to: '/settings',  label: 'Settings',  icon: Settings },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { data: farm } = useFarm();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoModal, setShowLogoModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine what to display for the farm logo / initial
  const displayFarmName = farm?.name || user?.farmName || 'Farm';
  const farmInitial = displayFarmName.charAt(0).toUpperCase();
  const logoUrl = farm?.logoUrl;

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {/* Logo / Initial */}
              {logoUrl ? (
                  <img
                      src={logoUrl}
                      alt={displayFarmName}
                      className="w-8 h-8 rounded-md object-cover shrink-0 border border-gray-100"
                  />
              ) : (
                  <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center text-white font-bold shrink-0">
                    {farmInitial}
                  </div>
              )}

              {/* Farm name + user */}
              <div className="hidden sm:block min-w-0">
                <div className="font-semibold text-gray-900 leading-tight truncate">
                  {displayFarmName}
                </div>
                <div className="text-xs text-gray-500 leading-tight truncate">
                  {user?.fullName || user?.username} · {user?.role}
                </div>
              </div>
            </div>

            {/* Right-side actions */}
            <div className="flex items-center gap-1">
              {/* Change logo button */}
              <button
                  onClick={() => setShowLogoModal(true)}
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                  title="Change Farm Logo"
                  aria-label="Change Farm Logo"
              >
                <ImageIcon size={18} />
              </button>



              {/* Logout */}
              <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto flex">
          {/* Sidebar — desktop */}
          <aside className="hidden md:block w-56 shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-57px)] sticky top-[57px] self-start">
            <nav className="p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.to);
                return (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition ${
                            isActive
                                ? 'bg-green-50 text-green-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <Icon size={16} />
                      {item.label}
                    </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 pb-20 md:pb-4">
            <Outlet />
          </main>
        </div>

        {/* Bottom nav — mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-1 z-40">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to);
            return (
                <Link
                    key={item.to}
                    to={item.to}
                    className={`flex flex-col items-center gap-0.5 px-2 py-1.5 text-xs flex-1 ${
                        isActive ? 'text-green-600 font-medium' : 'text-gray-500'
                    }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
            );
          })}
        </nav>

        {/* Farm Logo Modal */}
        {showLogoModal && (
            <FarmLogoModal
                currentLogoUrl={logoUrl ?? null}
                farmName={displayFarmName}
                onClose={() => setShowLogoModal(false)}
            />
        )}
      </div>
  );
}