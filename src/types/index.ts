export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  supplierId: string;
  quantity: number;
  minStock: number;
  unitPrice: number;
  costPrice: number;
  location: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'in' | 'out' | 'adjustment';

export interface StockMovement {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference: string;
  createdAt: string;
}

export interface AppSettings {
  companyName: string;
  currency: string;
  lowStockAlerts: boolean;
  darkMode: boolean;
}

export interface InventoryState {
  categories: Category[];
  suppliers: Supplier[];
  products: Product[];
  movements: StockMovement[];
  settings: AppSettings;
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type CategoryFormData = Omit<Category, 'id' | 'createdAt'>;
export type SupplierFormData = Omit<Supplier, 'id' | 'createdAt'>;

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalStockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentMovements: StockMovement[];
}
