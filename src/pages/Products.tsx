import { useState, useMemo } from 'react';
import {
  Plus,
  Package,
  Pencil,
  Trash2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Grid3X3,
  List,
  Filter,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ApiError } from '../services/api';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import SearchBar from '../components/ui/SearchBar';
import EmptyState from '../components/ui/EmptyState';
import Badge, { getStockBadgeVariant, getStockBadgeLabel } from '../components/ui/Badge';
import Card from '../components/ui/Card';
import type { Product, ProductFormData, MovementType } from '../types';
import {
  formatCurrency,
  getStockStatus,
} from '../utils/storage';

const emptyProduct: ProductFormData = {
  name: '',
  sku: '',
  description: '',
  categoryId: '',
  supplierId: '',
  quantity: 0,
  minStock: 10,
  unitPrice: 0,
  costPrice: 0,
  location: '',
  imageUrl: '',
};

export default function Products() {
  const {
    state,
    addProduct,
    updateProduct,
    deleteProduct,
    addMovement,
    getCategoryById,
  } = useInventory();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [productModal, setProductModal] = useState(false);
  const [movementModal, setMovementModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyProduct);

  const [movementType, setMovementType] = useState<MovementType>('in');
  const [movementQty, setMovementQty] = useState('');
  const [movementReason, setMovementReason] = useState('');
  const [movementRef, setMovementRef] = useState('');

  const filteredProducts = useMemo(() => {
    return state.products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
      const status = getStockStatus(p.quantity, p.minStock);
      const matchesStatus = !statusFilter || status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [state.products, search, categoryFilter, statusFilter]);

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setProductModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      quantity: product.quantity,
      minStock: product.minStock,
      unitPrice: product.unitPrice,
      costPrice: product.costPrice,
      location: product.location,
      imageUrl: product.imageUrl,
    });
    setProductModal(true);
  };

  const openMovement = (product: Product, type: MovementType) => {
    setSelectedProduct(product);
    setMovementType(type);
    setMovementQty('');
    setMovementReason('');
    setMovementRef('');
    setMovementModal(true);
  };

  const openDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteModal(true);
  };

  const handleSaveProduct = async () => {
    if (!form.name || !form.sku || !form.categoryId || !form.supplierId) {
      toast('error', 'Please fill in all required fields');
      return;
    }
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, form);
        toast('success', 'Product updated successfully');
      } else {
        await addProduct(form);
        toast('success', 'Product added successfully');
      }
      setProductModal(false);
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Failed to save product');
    }
  };

  const handleMovement = async () => {
    if (!selectedProduct || !movementQty || !movementReason) {
      toast('error', 'Please fill in quantity and reason');
      return;
    }
    try {
      await addMovement(
        selectedProduct.id,
        movementType,
        Number(movementQty),
        movementReason,
        movementRef
      );
      toast('success', `Stock ${movementType === 'in' ? 'added' : movementType === 'out' ? 'removed' : 'adjusted'} successfully`);
      setMovementModal(false);
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Failed to record movement');
    }
  };

  const handleDelete = async () => {
    if (selectedProduct) {
      try {
        await deleteProduct(selectedProduct.id);
        toast('success', 'Product deleted');
        setDeleteModal(false);
      } catch (err) {
        toast('error', err instanceof ApiError ? err.message : 'Failed to delete product');
      }
    }
  };

  const categoryOptions = state.categories.map((c) => ({ value: c.id, label: c.name }));
  const supplierOptions = state.suppliers.map((s) => ({ value: s.id, label: s.name }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredProducts.length} of {state.products.length} products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border dark:border-gray-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-l-lg p-2 ${viewMode === 'grid' ? 'bg-brand-50 text-brand-600 dark:bg-brand-950' : 'text-gray-400'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-r-lg p-2 ${viewMode === 'list' ? 'bg-brand-50 text-brand-600 dark:bg-brand-950' : 'text-gray-400'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name or SKU..."
          className="flex-1"
        />
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2 dark:bg-gray-900 animate-slide-up">
          <Select
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[{ value: '', label: 'All Categories' }, ...categoryOptions]}
          />
          <Select
            label="Stock Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'in-stock', label: 'In Stock' },
              { value: 'low-stock', label: 'Low Stock' },
              { value: 'out-of-stock', label: 'Out of Stock' },
            ]}
          />
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="No products found"
          description="Try adjusting your search or filters, or add a new product."
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const category = getCategoryById(product.categoryId);
            const status = getStockStatus(product.quantity, product.minStock);
            return (
              <Card key={product.id} hover className="group relative">
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: category?.color || '#6366f1' }}
                  >
                    {product.name.slice(0, 2).toUpperCase()}
                  </div>
                  <Badge variant={getStockBadgeVariant(status)} dot>
                    {getStockBadgeLabel(status)}
                  </Badge>
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500">{product.sku}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{product.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Unit Price</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(product.unitPrice, state.settings.currency)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 border-t pt-4 dark:border-gray-800">
                  <Button variant="ghost" size="sm" onClick={() => openMovement(product, 'in')} title="Stock In">
                    <ArrowDownToLine className="h-4 w-4 text-emerald-600" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openMovement(product, 'out')} title="Stock Out">
                    <ArrowUpFromLine className="h-4 w-4 text-red-600" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openDelete(product)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">SKU</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Qty</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-800">
                {filteredProducts.map((product) => {
                  const category = getCategoryById(product.categoryId);
                  const status = getStockStatus(product.quantity, product.minStock);
                  return (
                    <tr key={product.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                            style={{ backgroundColor: category?.color || '#6366f1' }}
                          >
                            {product.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{product.sku}</td>
                      <td className="px-4 py-3 text-gray-500">{category?.name}</td>
                      <td className="px-4 py-3 font-medium">{product.quantity}</td>
                      <td className="px-4 py-3">{formatCurrency(product.unitPrice, state.settings.currency)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={getStockBadgeVariant(status)} dot>
                          {getStockBadgeLabel(status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openMovement(product, 'in')}>
                            <ArrowDownToLine className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openMovement(product, 'out')}>
                            <ArrowUpFromLine className="h-4 w-4 text-red-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDelete(product)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      <Modal
        open={productModal}
        onClose={() => setProductModal(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Product Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Wireless Mouse"
          />
          <Input
            label="SKU *"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            placeholder="e.g. ELEC-WM-001"
          />
          <Select
            label="Category *"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            options={categoryOptions}
            placeholder="Select category"
          />
          <Select
            label="Supplier *"
            value={form.supplierId}
            onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
            options={supplierOptions}
            placeholder="Select supplier"
          />
          <Input
            label="Quantity"
            type="number"
            min={0}
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
          />
          <Input
            label="Min Stock Level"
            type="number"
            min={0}
            value={form.minStock}
            onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })}
          />
          <Input
            label="Unit Price"
            type="number"
            min={0}
            step={0.01}
            value={form.unitPrice}
            onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })}
          />
          <Input
            label="Cost Price"
            type="number"
            min={0}
            step={0.01}
            value={form.costPrice}
            onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })}
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. A-12-03"
            className="sm:col-span-2"
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Product description..."
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setProductModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveProduct}>
            {editingProduct ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </Modal>

      {/* Stock Movement Modal */}
      <Modal
        open={movementModal}
        onClose={() => setMovementModal(false)}
        title={`Stock ${movementType === 'in' ? 'In' : movementType === 'out' ? 'Out' : 'Adjustment'}`}
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedProduct.name}</p>
              <p className="text-xs text-gray-500">
                Current stock: <span className="font-semibold">{selectedProduct.quantity}</span> units
              </p>
            </div>
            <Input
              label="Quantity *"
              type="number"
              min={1}
              value={movementQty}
              onChange={(e) => setMovementQty(e.target.value)}
            />
            <Input
              label="Reason *"
              value={movementReason}
              onChange={(e) => setMovementReason(e.target.value)}
              placeholder="e.g. Restock from supplier"
            />
            <Input
              label="Reference"
              value={movementRef}
              onChange={(e) => setMovementRef(e.target.value)}
              placeholder="e.g. PO-2025-042"
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setMovementModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleMovement}>Confirm</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Product" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? This action cannot be
          undone and will also remove all associated stock movements.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
