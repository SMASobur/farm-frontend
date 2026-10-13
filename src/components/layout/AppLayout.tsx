import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFarm } from '@/hooks/useFarm';
import {
  LayoutDashboard,
  Beef,
  Users,
  UserCog,
  ShoppingCart,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  UserPlus,
  Menu,
  Image as ImageIcon,
} from 'lucide-react';
import { MobileDrawer } from './MobileDrawer';
import { FarmLogoModal } from '@/components/farm/FarmLogoModal';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/animals',   label: 'Animals',   icon: Beef },
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fallback farm name from auth if useFarm hasn't loaded yet
  const farmName = farm?.name || user?.farmName || 'Farm';
  const farmInitial = farmName.charAt(0).toUpperCase();

  return (
      <div className="min-h-screen bg-gray-50">
        {/* ============ Header ============ */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              {/* Hamburger — mobile only */}
              <button
                  onClick={() => setDrawerOpen(true)}
                  className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition shrink-0"
                  aria-label="Open menu"
              >
                <Menu size={20} />
              </button>

              <div className="flex items-center gap-2 min-w-0">
                {/* Logo or initial */}
                {farm?.logoUrl ? (
                    <img
                        src={farm.logoUrl}
                        alt={farmName}
                        className="w-8 h-8 rounded-md object-cover shrink-0"
                    />
                ) : (
                    <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center text-white font-bold shrink-0">
                      {farmInitial}
                    </div>
                )}

                {/* Farm name + user — hidden on smallest screens */}
                <div className="hidden sm:block min-w-0">
                  <div className="font-semibold text-gray-900 leading-tight truncate">
                    {farmName}
                  </div>
                  <div className="text-xs text-gray-500 leading-tight truncate">
                    {user?.fullName || user?.username} · {user?.role}
                  </div>
                </div>
              </div>
            </div>

            {/* Right-side actions */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Change Logo — hidden on very small screens, shows icon only */}
              <button
                  onClick={() => setShowLogoModal(true)}
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                  title="Change Farm Logo"
                  aria-label="Change Farm Logo"
              >
                <ImageIcon size={18} />
              </button>

              <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 px-3 py-1.5 rounded hover:bg-gray-100 transition"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto flex">
          {/* ============ Sidebar — desktop only ============ */}
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

          {/* ============ Main content ============ */}
          <main className="flex-1 min-w-0 pb-20 md:pb-4">
            <Outlet />
          </main>
        </div>

        {/* ============ Bottom nav — mobile only ============ */}
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

        {/* ============ Mobile drawer ============ */}
        <MobileDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            navItems={navItems}
            farmName={farmName}
            farmLogoUrl={farm?.logoUrl ?? null}
        />

        {/* ============ Farm logo modal ============ */}
        {showLogoModal && (
            <FarmLogoModal
                currentLogoUrl={farm?.logoUrl ?? null}
                farmName={farmName}
                onClose={() => setShowLogoModal(false)}
            />
        )}
      </div>
  );
}