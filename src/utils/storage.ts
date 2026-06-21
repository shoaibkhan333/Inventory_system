import type { InventoryState } from '../types';

const STORAGE_KEY = 'stockflow-inventory';

export const defaultSettings: InventoryState['settings'] = {
  companyName: 'StockFlow Inc.',
  currency: 'USD',
  lowStockAlerts: true,
  darkMode: false,
};

export const seedData: InventoryState = {
  settings: defaultSettings,
  categories: [
    {
      id: 'cat-1',
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      color: '#6366f1',
      createdAt: '2025-01-15T10:00:00.000Z',
    },
    {
      id: 'cat-2',
      name: 'Office Supplies',
      description: 'Stationery and office equipment',
      color: '#10b981',
      createdAt: '2025-01-15T10:00:00.000Z',
    },
    {
      id: 'cat-3',
      name: 'Furniture',
      description: 'Office and warehouse furniture',
      color: '#f59e0b',
      createdAt: '2025-01-15T10:00:00.000Z',
    },
    {
      id: 'cat-4',
      name: 'Raw Materials',
      description: 'Manufacturing raw materials',
      color: '#ef4444',
      createdAt: '2025-01-15T10:00:00.000Z',
    },
  ],
  suppliers: [
    {
      id: 'sup-1',
      name: 'TechParts Global',
      email: 'orders@techparts.com',
      phone: '+1 (555) 123-4567',
      address: '123 Tech Blvd, San Francisco, CA',
      contactPerson: 'Sarah Johnson',
      createdAt: '2025-01-10T10:00:00.000Z',
    },
    {
      id: 'sup-2',
      name: 'Office Depot Wholesale',
      email: 'wholesale@officedepot.com',
      phone: '+1 (555) 987-6543',
      address: '456 Supply Ave, Chicago, IL',
      contactPerson: 'Mike Chen',
      createdAt: '2025-01-10T10:00:00.000Z',
    },
    {
      id: 'sup-3',
      name: 'FurniCraft Ltd',
      email: 'sales@furnicraft.com',
      phone: '+1 (555) 456-7890',
      address: '789 Design St, Austin, TX',
      contactPerson: 'Emily Davis',
      createdAt: '2025-01-12T10:00:00.000Z',
    },
  ],
  products: [
    {
      id: 'prod-1',
      name: 'Wireless Mouse',
      sku: 'ELEC-WM-001',
      description: 'Ergonomic wireless mouse with USB receiver',
      categoryId: 'cat-1',
      supplierId: 'sup-1',
      quantity: 145,
      minStock: 30,
      unitPrice: 29.99,
      costPrice: 15.5,
      location: 'A-12-03',
      imageUrl: '',
      createdAt: '2025-02-01T10:00:00.000Z',
      updatedAt: '2025-06-01T10:00:00.000Z',
    },
    {
      id: 'prod-2',
      name: 'Mechanical Keyboard',
      sku: 'ELEC-KB-002',
      description: 'RGB mechanical keyboard with Cherry MX switches',
      categoryId: 'cat-1',
      supplierId: 'sup-1',
      quantity: 67,
      minStock: 20,
      unitPrice: 89.99,
      costPrice: 52.0,
      location: 'A-12-04',
      imageUrl: '',
      createdAt: '2025-02-01T10:00:00.000Z',
      updatedAt: '2025-06-01T10:00:00.000Z',
    },
    {
      id: 'prod-3',
      name: 'A4 Copy Paper (500 sheets)',
      sku: 'OFF-PAP-001',
      description: 'Premium white A4 copy paper, 80gsm',
      categoryId: 'cat-2',
      supplierId: 'sup-2',
      quantity: 8,
      minStock: 25,
      unitPrice: 6.99,
      costPrice: 3.2,
      location: 'B-01-01',
      imageUrl: '',
      createdAt: '2025-02-05T10:00:00.000Z',
      updatedAt: '2025-06-10T10:00:00.000Z',
    },
    {
      id: 'prod-4',
      name: 'Ballpoint Pens (Box of 50)',
      sku: 'OFF-PEN-002',
      description: 'Blue ink ballpoint pens, medium tip',
      categoryId: 'cat-2',
      supplierId: 'sup-2',
      quantity: 42,
      minStock: 15,
      unitPrice: 12.99,
      costPrice: 6.5,
      location: 'B-02-03',
      imageUrl: '',
      createdAt: '2025-02-05T10:00:00.000Z',
      updatedAt: '2025-06-05T10:00:00.000Z',
    },
    {
      id: 'prod-5',
      name: 'Ergonomic Office Chair',
      sku: 'FUR-CHR-001',
      description: 'Adjustable lumbar support office chair',
      categoryId: 'cat-3',
      supplierId: 'sup-3',
      quantity: 0,
      minStock: 5,
      unitPrice: 349.99,
      costPrice: 210.0,
      location: 'C-05-01',
      imageUrl: '',
      createdAt: '2025-03-01T10:00:00.000Z',
      updatedAt: '2025-06-15T10:00:00.000Z',
    },
    {
      id: 'prod-6',
      name: 'Standing Desk',
      sku: 'FUR-DSK-002',
      description: 'Electric height-adjustable standing desk',
      categoryId: 'cat-3',
      supplierId: 'sup-3',
      quantity: 12,
      minStock: 5,
      unitPrice: 599.99,
      costPrice: 380.0,
      location: 'C-05-02',
      imageUrl: '',
      createdAt: '2025-03-01T10:00:00.000Z',
      updatedAt: '2025-06-12T10:00:00.000Z',
    },
    {
      id: 'prod-7',
      name: 'USB-C Hub 7-in-1',
      sku: 'ELEC-HUB-003',
      description: 'Multi-port USB-C hub with HDMI and SD card',
      categoryId: 'cat-1',
      supplierId: 'sup-1',
      quantity: 18,
      minStock: 25,
      unitPrice: 49.99,
      costPrice: 22.0,
      location: 'A-13-01',
      imageUrl: '',
      createdAt: '2025-04-01T10:00:00.000Z',
      updatedAt: '2025-06-18T10:00:00.000Z',
    },
    {
      id: 'prod-8',
      name: 'Steel Bolts (Pack of 100)',
      sku: 'RAW-BLT-001',
      description: 'M8 stainless steel bolts',
      categoryId: 'cat-4',
      supplierId: 'sup-2',
      quantity: 320,
      minStock: 100,
      unitPrice: 24.99,
      costPrice: 11.0,
      location: 'D-01-05',
      imageUrl: '',
      createdAt: '2025-04-15T10:00:00.000Z',
      updatedAt: '2025-06-08T10:00:00.000Z',
    },
  ],
  movements: [
    {
      id: 'mov-1',
      productId: 'prod-1',
      type: 'in',
      quantity: 50,
      previousQuantity: 95,
      newQuantity: 145,
      reason: 'Restock from supplier',
      reference: 'PO-2025-042',
      createdAt: '2025-06-18T14:30:00.000Z',
    },
    {
      id: 'mov-2',
      productId: 'prod-3',
      type: 'out',
      quantity: 12,
      previousQuantity: 20,
      newQuantity: 8,
      reason: 'Office consumption',
      reference: 'REQ-2025-118',
      createdAt: '2025-06-17T09:15:00.000Z',
    },
    {
      id: 'mov-3',
      productId: 'prod-5',
      type: 'out',
      quantity: 3,
      previousQuantity: 3,
      newQuantity: 0,
      reason: 'Sold to customer',
      reference: 'SO-2025-089',
      createdAt: '2025-06-16T16:45:00.000Z',
    },
    {
      id: 'mov-4',
      productId: 'prod-7',
      type: 'adjustment',
      quantity: -2,
      previousQuantity: 20,
      newQuantity: 18,
      reason: 'Damaged units removed',
      reference: 'ADJ-2025-012',
      createdAt: '2025-06-15T11:00:00.000Z',
    },
    {
      id: 'mov-5',
      productId: 'prod-2',
      type: 'in',
      quantity: 25,
      previousQuantity: 42,
      newQuantity: 67,
      reason: 'New shipment received',
      reference: 'PO-2025-038',
      createdAt: '2025-06-14T10:30:00.000Z',
    },
  ],
};

export function loadState(): InventoryState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as InventoryState;
    }
  } catch {
    // fall through to seed data
  }
  return structuredClone(seedData);
}

export function saveState(state: InventoryState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function getStockStatus(quantity: number, minStock: number): 'in-stock' | 'low-stock' | 'out-of-stock' {
  if (quantity === 0) return 'out-of-stock';
  if (quantity <= minStock) return 'low-stock';
  return 'in-stock';
}

export const categoryColors = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
];
