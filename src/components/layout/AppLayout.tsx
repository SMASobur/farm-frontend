import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Egg,
  Milk,
  Layers,
  Bird,
  Ham,
  Users,
  HardHat,
  ShoppingCart,
  Receipt,
  BarChart3,
  UserPlus,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/milk',      label: 'Milk',     icon: Milk },
  { to: '/eggs',      label: 'Eggs',     icon: Egg },
  { to: '/sales',     label: 'Sales',    icon: ShoppingCart },
  { to: '/expenses',  label: 'Expenses', icon: Receipt },
  { to: '/pools', label: 'Pools', icon: Layers },
  { to: '/flocks',    label: 'Batches',  icon: Bird },
  { to: '/animals',   label: 'Animals',  icon: Ham },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/workers',   label: 'Workers',  icon: HardHat },
  { to: '/reports',   label: 'Reports',  icon: BarChart3 },
  { to: '/settings',  label: 'Settings', icon: Settings },
  { to: '/team',      label: 'Team',     icon: UserPlus },
];

// First 4 items always shown on mobile bottom nav
const mobilePrimaryItems = navItems.slice(0, 4);
// Remaining items accessible via "More" menu
const mobileMoreItems = navItems.slice(4);

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    setMoreOpen(false);
  };

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link
                to="/dashboard"
                className="flex items-center gap-2 hover:opacity-90 transition"
                title="Go to Dashboard"
            >
              <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center text-white font-bold">
                F
              </div>
              <div className="hidden sm:block">
                <div className="font-semibold text-gray-900 leading-tight">
                  {user?.farmName || 'Farm'}
                </div>
                <div className="text-xs text-gray-500 leading-tight">
                  {user?.fullName || user?.username} · {user?.role}
                </div>
              </div>
            </Link>
            <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 px-3 py-1.5 rounded hover:bg-gray-100 transition"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
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

        {/* Mobile "More" drawer */}
        {moreOpen && (
            <>
              {/* Backdrop */}
              <div
                  className="md:hidden fixed inset-0 bg-black/40 z-40"
                  onClick={() => setMoreOpen(false)}
              />
              {/* Drawer */}
              <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl border-t border-gray-200 z-50 p-4 animate-in slide-in-from-bottom duration-200">
                <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-gray-900">
                                More
                            </span>
                  <button
                      onClick={() => setMoreOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {mobileMoreItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.to);
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={handleLinkClick}
                            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-xs transition ${
                                isActive
                                    ? 'bg-green-50 text-green-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <Icon size={20} />
                          {item.label}
                        </Link>
                    );
                  })}
                </div>
              </div>
            </>
        )}

        {/* Bottom nav — mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-1 z-40">
          {mobilePrimaryItems.map((item) => {
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
          {/* More button */}
          <button
              onClick={() => setMoreOpen((v) => !v)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 text-xs flex-1 ${
                  moreOpen ? 'text-green-600 font-medium' : 'text-gray-500'
              }`}
          >
            <Menu size={20} />
            More
          </button>
        </nav>
      </div>
  );
}