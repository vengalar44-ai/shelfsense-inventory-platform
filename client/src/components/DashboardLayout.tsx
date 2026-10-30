import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ClockAlert,
  ShoppingCart,
  Truck,
  Users,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ShieldAlert,
  Sun,
  Moon,
  Store,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  const { user, business, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = React.useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Batches & FEFO', path: '/batches', icon: ClockAlert },
    { label: 'Inventory Movements', path: '/inventory', icon: Layers },
    { label: 'Point of Sale (POS)', path: '/pos', icon: ShoppingCart },
    { label: 'Purchases', path: '/purchases', icon: Truck },
    { label: 'Suppliers', path: '/suppliers', icon: Users },
    { label: 'Reports & Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    ...(user?.role === 'OWNER_ADMIN'
      ? [
          { label: 'Team Members', path: '/team', icon: Users },
          { label: 'Audit Trail', path: '/audit', icon: ShieldAlert },
          { label: 'Store Settings', path: '/settings', icon: Settings },
        ]
      : []),
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight leading-none text-slate-900 dark:text-white">
                ShelfSense
              </div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium tracking-wide uppercase mt-1">
                Smart Expiry ERP
              </div>
            </div>
          </div>

          {/* Current Business Badge */}
          <div className="px-4 py-3 mx-3 my-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Current Business
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
              {business?.name || 'Default Store'}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-sm border border-blue-200/50 dark:border-blue-800/40'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile & Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs uppercase border border-slate-300 dark:border-slate-600">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="truncate max-w-[110px]">
                <div className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">
                  {user?.fullName}
                </div>
                <div className="text-[10px] text-slate-500 capitalize">
                  {user?.role?.replace('_', ' ').toLowerCase()}
                </div>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-medium transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <h1 className="text-base font-bold text-slate-900 dark:text-white">
              {navItems.find((i) => i.path === location.pathname)?.label || 'ShelfSense Management'}
            </h1>
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-500">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Live Database Connected
            </span>
            <span>Role: <strong className="text-slate-700 dark:text-slate-300">{user?.role}</strong></span>
          </div>
        </header>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
