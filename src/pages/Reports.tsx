import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useInventory } from '../context/InventoryContext';
import Card from '../components/ui/Card';
import Badge, { getStockBadgeVariant, getStockBadgeLabel } from '../components/ui/Badge';
import { formatCurrency, getStockStatus } from '../utils/storage';

export default function Reports() {
  const { state, getCategoryById, getSupplierById } = useInventory();
  const { products, categories, suppliers, movements, settings } = state;

  const inventoryValue = products.reduce((sum, p) => sum + p.quantity * p.costPrice, 0);
  const retailValue = products.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
  const potentialProfit = retailValue - inventoryValue;

  const categoryReport = useMemo(() => {
    return categories.map((cat) => {
      const catProducts = products.filter((p) => p.categoryId === cat.id);
      return {
        name: cat.name,
        products: catProducts.length,
        units: catProducts.reduce((s, p) => s + p.quantity, 0),
        value: catProducts.reduce((s, p) => s + p.quantity * p.costPrice, 0),
        color: cat.color,
      };
    });
  }, [categories, products]);

  const supplierReport = useMemo(() => {
    return suppliers.map((sup) => {
      const supProducts = products.filter((p) => p.supplierId === sup.id);
      return {
        name: sup.name.length > 15 ? sup.name.slice(0, 15) + '...' : sup.name,
        products: supProducts.length,
        value: supProducts.reduce((s, p) => s + p.quantity * p.costPrice, 0),
      };
    });
  }, [suppliers, products]);

  const stockStatusData = useMemo(() => {
    const inStock = products.filter((p) => getStockStatus(p.quantity, p.minStock) === 'in-stock').length;
    const lowStock = products.filter((p) => getStockStatus(p.quantity, p.minStock) === 'low-stock').length;
    const outOfStock = products.filter((p) => getStockStatus(p.quantity, p.minStock) === 'out-of-stock').length;
    return [
      { name: 'In Stock', value: inStock, color: '#10b981' },
      { name: 'Low Stock', value: lowStock, color: '#f59e0b' },
      { name: 'Out of Stock', value: outOfStock, color: '#ef4444' },
    ];
  }, [products]);

  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.quantity * b.unitPrice - a.quantity * a.unitPrice)
      .slice(0, 5);
  }, [products]);

  const movementSummary = useMemo(() => {
    const last7 = movements.slice(0, 20);
    const grouped: Record<string, { in: number; out: number }> = {};
    last7.forEach((m) => {
      const day = new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!grouped[day]) grouped[day] = { in: 0, out: 0 };
      if (m.type === 'in') grouped[day].in += m.quantity;
      if (m.type === 'out') grouped[day].out += m.quantity;
    });
    return Object.entries(grouped).map(([day, data]) => ({ day, ...data }));
  }, [movements]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-gray-500">Inventory Cost Value</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(inventoryValue, settings.currency)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Retail Value</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(retailValue, settings.currency)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Potential Profit</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {formatCurrency(potentialProfit, settings.currency)}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-base font-semibold">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryReport}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number, name: string) =>
                name === 'value' ? formatCurrency(value, settings.currency) : value
              } />
              <Bar dataKey="products" fill="#6366f1" name="Products" radius={[4, 4, 0, 0]} />
              <Bar dataKey="units" fill="#10b981" name="Units" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-4 text-base font-semibold">Stock Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockStatusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {stockStatusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-base font-semibold">Supplier Performance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={supplierReport} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={(value: number) => formatCurrency(value, settings.currency)} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Inventory Value" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-4 text-base font-semibold">Movement Trends</h3>
          {movementSummary.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={movementSummary}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="in" stroke="#10b981" strokeWidth={2} name="Stock In" dot />
                <Line type="monotone" dataKey="out" stroke="#ef4444" strokeWidth={2} name="Stock Out" dot />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-gray-500">No movement data available</p>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 text-base font-semibold">Top Products by Retail Value</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-800/50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Product</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Supplier</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Qty</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Retail Value</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {topProducts.map((product) => {
                const status = getStockStatus(product.quantity, product.minStock);
                return (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {getCategoryById(product.categoryId)?.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {getSupplierById(product.supplierId)?.name}
                    </td>
                    <td className="px-4 py-3 text-right">{product.quantity}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(product.quantity * product.unitPrice, settings.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStockBadgeVariant(status)} dot>
                        {getStockBadgeLabel(status)}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
