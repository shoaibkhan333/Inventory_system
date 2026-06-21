import { useState } from 'react';
import { Plus, Tags, Pencil, Trash2 } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Card from '../components/ui/Card';
import type { Category, CategoryFormData } from '../types';
import { categoryColors } from '../utils/storage';

const emptyCategory: CategoryFormData = {
  name: '',
  description: '',
  color: categoryColors[0],
};

export default function Categories() {
  const { state, addCategory, updateCategory, deleteCategory } = useInventory();
  const { toast } = useToast();

  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormData>(emptyCategory);

  const productCount = (catId: string) =>
    state.products.filter((p) => p.categoryId === catId).length;

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyCategory, color: categoryColors[state.categories.length % categoryColors.length] });
    setModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description, color: cat.color });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      toast('error', 'Category name is required');
      return;
    }
    try {
      if (editing) {
        await updateCategory(editing.id, form);
        toast('success', 'Category updated');
      } else {
        await addCategory(form);
        toast('success', 'Category created');
      }
      setModal(false);
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Failed to save category');
    }
  };

  const handleDelete = async () => {
    if (selected) {
      const count = productCount(selected.id);
      if (count > 0) {
        toast('error', `Cannot delete — ${count} products use this category`);
        setDeleteModal(false);
        return;
      }
      try {
        await deleteCategory(selected.id);
        toast('success', 'Category deleted');
        setDeleteModal(false);
      } catch (err) {
        toast('error', err instanceof Error ? err.message : 'Failed to delete category');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{state.categories.length} categories</p>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {state.categories.length === 0 ? (
        <EmptyState
          icon={<Tags className="h-8 w-8" />}
          title="No categories yet"
          description="Create categories to organize your inventory products."
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.categories.map((cat) => (
            <Card key={cat.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Tags className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{cat.name}</h3>
                    <p className="text-xs text-gray-500">{productCount(cat.id)} products</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelected(cat);
                      setDeleteModal(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {cat.description || 'No description'}
              </p>
              <div className="mt-4 h-1.5 rounded-full" style={{ backgroundColor: cat.color, opacity: 0.3 }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    backgroundColor: cat.color,
                    width: `${Math.min(100, (productCount(cat.id) / Math.max(state.products.length, 1)) * 100)}%`,
                  }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <Input
            label="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Electronics"
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
            <div className="flex flex-wrap gap-2">
              {categoryColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                    form.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Category" size="sm">
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
