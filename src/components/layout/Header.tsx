import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Moon, Sun, LogOut } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { getStockStatus } from '../../utils/storage';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/categories': 'Categories',
  '/suppliers': 'Suppliers',
  '/movements': 'Stock Movements',
  '/reports': 'Reports & Analytics',
  '/settings': 'Settings',
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { state, updateSettings } = useInventory();
  const title = pageTitles[location.pathname] || 'StockFlow';

  const alertCount = state.settings.lowStockAlerts
    ? state.products.filter((p) => {
        const status = getStockStatus(p.quantity, p.minStock);
        return status === 'low-stock' || status === 'out-of-stock';
      }).length
    : 0;

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 px-6 backdrop-blur-md dark:bg-gray-950/80 lg:px-8">
      <div className="pl-10 lg:pl-0">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">{state.settings.companyName}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => updateSettings({ darkMode: !state.settings.darkMode })}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label="Toggle dark mode"
        >
          {state.settings.darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button
          className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {alertCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {alertCount}
            </span>
          )}
        </button>

        <div className="ml-2 flex items-center gap-2 rounded-lg border px-3 py-1.5 dark:border-gray-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-[10px] capitalize text-gray-500">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-1 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-800"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
