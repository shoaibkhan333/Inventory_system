import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Tags,
  Truck,
  DollarSign,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { useInventory } from '../context/InventoryContext';
import { StatCard } from '../components/ui/Card';
import Card from '../components/ui/Card';
import Badge, { getStockBadgeVariant, getStockBadgeLabel } from '../components/ui/Badge';
import {
  formatCurrency,
  formatDateTime,
  getStockStatus,
} from '../utils/storage';

const movementIcons = {
  in: ArrowDownToLine,
  out: ArrowUpFromLine,
  adjustment: RefreshCw,
};

const movementColors = {
  in: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
  out: 'text-red-600 bg-red-50 dark:bg-red-950',
  adjustment: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
};

export default function Dashboard() {
  const { state, getDashboardStats, getProductById, getCategoryById } = useInventory();
  const stats = getDashboardStats();
  const { settings, products, categories, movements } = state;

  const categoryChartData = useMemo(() => {
    return categories.map((cat) => ({
      name: cat.name,
      value: products.filter((p) => p.categoryId === cat.id).reduce((sum, p) => sum + p.quantity, 0),
      color: cat.color,
    }));
  }, [categories, products]);

  const stockValueByCategory = useMemo(() => {
    return categories.map((cat) => ({
      name: cat.name.length > 12 ? cat.name.slice(0, 12) + '...' : cat.name,
      value: products
        .filter((p) => p.categoryId === cat.id)
        .reduce((sum, p) => sum + p.quantity * p.costPrice, 0),
    }));
  }, [categories, products]);

  const movementTrend = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
      day,
      stockIn: Math.floor(Math.random() * 30) + 10 + i * 2,
      stockOut: Math.floor(Math.random() * 25) + 5 + i,
    }));
  }, []);

  const lowStockProducts = products
    .filter((p) => {
      const status = getStockStatus(p.quantity, p.minStock);
      return status !== 'in-stock';
    })
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Package className="h-6 w-6" />}
          color="brand"
        />
        <StatCard
          title="Stock Value"
          value={formatCurrency(stats.totalStockValue, settings.currency)}
          icon={<DollarSign className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockCount}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="amber"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStockCount}
          icon={<Package className="h-6 w-6" />}
          color="red"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
            Weekly Stock Activity
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={movementTrend}>
              <defs>
                <linearGradient id="stockIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="stockOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} className="text-gray-500" />
              <YAxis tick={{ fontSize: 12 }} className="text-gray-500" />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Area type="monotone" dataKey="stockIn" stroke="#6366f1" fill="url(#stockIn)" name="Stock In" />
              <Area type="monotone" dataKey="stockOut" stroke="#ef4444" fill="url(#stockOut)" name="Stock Out" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
            Stock by Category
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-2">
            {categoryChartData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.name}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Movements</h3>
            <Link to="/movements" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {movements.slice(0, 5).map((mov) => {
              const product = getProductById(mov.productId);
              const Icon = movementIcons[mov.type];
              return (
                <div
                  key={mov.id}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className={`rounded-lg p-2 ${movementColors[mov.type]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {product?.name || 'Unknown Product'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {mov.reason} · {formatDateTime(mov.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      mov.type === 'in' ? 'text-emerald-600' : mov.type === 'out' ? 'text-red-600' : 'text-amber-600'
                    }`}
                  >
                    {mov.type === 'in' ? '+' : mov.type === 'out' ? '-' : '±'}
                    {mov.quantity}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Stock Alerts</h3>
            <Link to="/products" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Manage
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">All products are well stocked!</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => {
                const status = getStockStatus(product.quantity, product.minStock);
                const category = getCategoryById(product.categoryId);
                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-white text-xs font-bold"
                      style={{ backgroundColor: category?.color || '#6366f1' }}
                    >
                      {product.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {product.quantity} / Min: {product.minStock}
                      </p>
                    </div>
                    <Badge variant={getStockBadgeVariant(status)} dot>
                      {getStockBadgeLabel(status)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          Inventory Value by Category
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stockValueByCategory}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => formatCurrency(value, settings.currency)} />
            <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card hover className="flex items-center gap-4">
          <div className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Tags className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCategories}</p>
            <p className="text-sm text-gray-500">Categories</p>
          </div>
        </Card>
        <Card hover className="flex items-center gap-4">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSuppliers}</p>
            <p className="text-sm text-gray-500">Suppliers</p>
          </div>
        </Card>
        <Card hover className="flex items-center gap-4">
          <div className="rounded-xl bg-purple-50 p-3 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {products.reduce((sum, p) => sum + p.quantity, 0)}
            </p>
            <p className="text-sm text-gray-500">Total Units in Stock</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
