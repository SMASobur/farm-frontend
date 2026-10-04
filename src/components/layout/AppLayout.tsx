import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Beef,
  Users,
  ShoppingCart,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/animals',   label: 'Animals',   icon: Beef },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/sales',     label: 'Sales',     icon: ShoppingCart },
  { to: '/expenses',  label: 'Expenses',  icon: Receipt },
  { to: '/reports',   label: 'Reports',   icon: BarChart3 },
  { to: '/settings',  label: 'Settings',  icon: Settings },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
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
            </div>
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
      </div>
  );
}