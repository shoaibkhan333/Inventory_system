import { useState } from 'react';
import { Plus, Truck, Pencil, Trash2, Mail, Phone, MapPin, User } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Card from '../components/ui/Card';
import type { Supplier, SupplierFormData } from '../types';

const emptySupplier: SupplierFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  contactPerson: '',
};

export default function Suppliers() {
  const { state, addSupplier, updateSupplier, deleteSupplier } = useInventory();
  const { toast } = useToast();

  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierFormData>(emptySupplier);

  const productCount = (supId: string) =>
    state.products.filter((p) => p.supplierId === supId).length;

  const openAdd = () => {
    setEditing(null);
    setForm(emptySupplier);
    setModal(true);
  };

  const openEdit = (sup: Supplier) => {
    setEditing(sup);
    setForm({
      name: sup.name,
      email: sup.email,
      phone: sup.phone,
      address: sup.address,
      contactPerson: sup.contactPerson,
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast('error', 'Name and email are required');
      return;
    }
    try {
      if (editing) {
        await updateSupplier(editing.id, form);
        toast('success', 'Supplier updated');
      } else {
        await addSupplier(form);
        toast('success', 'Supplier added');
      }
      setModal(false);
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Failed to save supplier');
    }
  };

  const handleDelete = async () => {
    if (selected) {
      const count = productCount(selected.id);
      if (count > 0) {
        toast('error', `Cannot delete — ${count} products linked to this supplier`);
        setDeleteModal(false);
        return;
      }
      try {
        await deleteSupplier(selected.id);
        toast('success', 'Supplier deleted');
        setDeleteModal(false);
      } catch (err) {
        toast('error', err instanceof Error ? err.message : 'Failed to delete supplier');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{state.suppliers.length} suppliers</p>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Supplier
        </Button>
      </div>

      {state.suppliers.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-8 w-8" />}
          title="No suppliers yet"
          description="Add suppliers to track where your products come from."
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Supplier
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.suppliers.map((sup) => (
            <Card key={sup.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{sup.name}</h3>
                    <p className="text-xs text-gray-500">{productCount(sup.id)} products</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(sup)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelected(sup);
                      setDeleteModal(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  {sup.contactPerson || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {sup.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {sup.phone || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-1">{sup.address || 'N/A'}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Company Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Contact Person"
            value={form.contactPerson}
            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
          />
          <Input
            label="Email *"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            label="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="sm:col-span-2"
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button>
        </div>
      </Modal>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Supplier" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Delete <strong>{selected?.name}</strong>? Products must be reassigned first.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
