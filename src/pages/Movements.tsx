import { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ApiError } from '../services/api';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import SearchBar from '../components/ui/SearchBar';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import type { MovementType } from '../types';
import { formatDateTime } from '../utils/storage';

const typeConfig = {
  in: { label: 'Stock In', icon: ArrowDownToLine, variant: 'success' as const, sign: '+' },
  out: { label: 'Stock Out', icon: ArrowUpFromLine, variant: 'danger' as const, sign: '-' },
  adjustment: { label: 'Adjustment', icon: RefreshCw, variant: 'warning' as const, sign: '±' },
};

export default function Movements() {
  const { state, addMovement, getProductById } = useInventory();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modal, setModal] = useState(false);

  const [productId, setProductId] = useState('');
  const [movementType, setMovementType] = useState<MovementType>('in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');

  const filtered = useMemo(() => {
    return state.movements.filter((m) => {
      const product = getProductById(m.productId);
      const matchesSearch =
        product?.name.toLowerCase().includes(search.toLowerCase()) ||
        m.reason.toLowerCase().includes(search.toLowerCase()) ||
        m.reference.toLowerCase().includes(search.toLowerCase());
      const matchesType = !typeFilter || m.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [state.movements, search, typeFilter, getProductById]);

  const stats = useMemo(() => {
    const ins = state.movements.filter((m) => m.type === 'in').reduce((s, m) => s + m.quantity, 0);
    const outs = state.movements.filter((m) => m.type === 'out').reduce((s, m) => s + m.quantity, 0);
    const adjs = state.movements.filter((m) => m.type === 'adjustment').length;
    return { ins, outs, adjs, total: state.movements.length };
  }, [state.movements]);

  const productOptions = state.products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }));

  const handleSubmit = async () => {
    if (!productId || !quantity || !reason) {
      toast('error', 'Please fill in all required fields');
      return;
    }
    try {
      await addMovement(productId, movementType, Number(quantity), reason, reference);
      toast('success', 'Stock movement recorded');
      setModal(false);
      setProductId('');
      setQuantity('');
      setReason('');
      setReference('');
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Failed to record movement');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="flex items-center gap-3">
          <div className="rounded-lg bg-brand-50 p-2 text-brand-600 dark:bg-brand-950">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Movements</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950">
            <ArrowDownToLine className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.ins}</p>
            <p className="text-xs text-gray-500">Units Received</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="rounded-lg bg-red-50 p-2 text-red-600 dark:bg-red-950">
            <ArrowUpFromLine className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.outs}</p>
            <p className="text-xs text-gray-500">Units Dispatched</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.adjs}</p>
            <p className="text-xs text-gray-500">Adjustments</p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search movements..."
            className="flex-1"
          />
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: '', label: 'All Types' },
              { value: 'in', label: 'Stock In' },
              { value: 'out', label: 'Stock Out' },
              { value: 'adjustment', label: 'Adjustment' },
            ]}
            className="sm:w-48"
          />
        </div>
        <Button onClick={() => setModal(true)}>
          <Plus className="h-4 w-4" /> Record Movement
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ArrowLeftRight className="h-8 w-8" />}
          title="No movements found"
          description="Record stock movements to track inventory changes."
          action={
            <Button onClick={() => setModal(true)}>
              <Plus className="h-4 w-4" /> Record Movement
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((mov) => {
            const product = getProductById(mov.productId);
            const config = typeConfig[mov.type];
            const Icon = config.icon;
            return (
              <Card key={mov.id} className="flex items-center gap-4 !p-4">
                <div
                  className={`rounded-xl p-3 ${
                    mov.type === 'in'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950'
                      : mov.type === 'out'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product?.name || 'Unknown'}
                    </p>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {mov.reason}
                    {mov.reference && ` · Ref: ${mov.reference}`}
                  </p>
                  <p className="text-xs text-gray-400">{formatDateTime(mov.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      mov.type === 'in'
                        ? 'text-emerald-600'
                        : mov.type === 'out'
                          ? 'text-red-600'
                          : 'text-amber-600'
                    }`}
                  >
                    {config.sign}
                    {mov.quantity}
                  </p>
                  <p className="text-xs text-gray-500">
                    {mov.previousQuantity} → {mov.newQuantity}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Record Stock Movement">
        <div className="space-y-4">
          <Select
            label="Product *"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            options={productOptions}
            placeholder="Select product"
          />
          <Select
            label="Movement Type *"
            value={movementType}
            onChange={(e) => setMovementType(e.target.value as MovementType)}
            options={[
              { value: 'in', label: 'Stock In' },
              { value: 'out', label: 'Stock Out' },
              { value: 'adjustment', label: 'Adjustment' },
            ]}
          />
          <Input
            label="Quantity *"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <Input
            label="Reason *"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Restock from supplier"
          />
          <Input
            label="Reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. PO-2025-042"
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Record</Button>
        </div>
      </Modal>
    </div>
  );
}
