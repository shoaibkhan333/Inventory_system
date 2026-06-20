import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ArrowLeftRight,
  BarChart3,
  Settings,
  Menu,
  X,
  Boxes,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/categories', icon: Tags, label: 'Categories' },
  { to: '/suppliers', icon: Truck, label: 'Suppliers' },
  { to: '/movements', icon: ArrowLeftRight, label: 'Stock Movements' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <>
      <div className="flex h-16 items-center gap-3 border-b px-6 dark:border-gray-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Boxes className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">StockFlow</h1>
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Inventory System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm dark:bg-brand-950 dark:text-brand-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-4 dark:border-gray-800">
        <div className="rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 p-4 text-white">
          <p className="text-xs font-medium opacity-80">Pro Tip</p>
          <p className="mt-1 text-sm font-semibold">Use stock movements to track every change</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-white p-2 shadow-md lg:hidden dark:bg-gray-900"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-white dark:bg-gray-900 animate-slide-in">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            {navContent}
          </aside>
        </div>
      )}

      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:bg-white dark:lg:bg-gray-900">
        {navContent}
      </aside>
    </>
  );
}
