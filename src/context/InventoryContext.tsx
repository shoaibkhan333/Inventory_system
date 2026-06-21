import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  useCallback,
  useState,
} from 'react';
import type {
  InventoryState,
  Product,
  Category,
  Supplier,
  StockMovement,
  ProductFormData,
  CategoryFormData,
  SupplierFormData,
  MovementType,
  AppSettings,
  DashboardStats,
} from '../types';
import { defaultSettings, loadState, saveState, generateId, seedData } from '../utils/storage';

type Action =
  | { type: 'LOAD'; payload: InventoryState }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'UPDATE_SUPPLIER'; payload: Supplier }
  | { type: 'DELETE_SUPPLIER'; payload: string }
  | { type: 'ADD_MOVEMENT'; payload: StockMovement }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> };

const emptyState: InventoryState = {
  categories: [],
  suppliers: [],
  products: [],
  movements: [],
  settings: defaultSettings,
};

function reducer(state: InventoryState, action: Action): InventoryState {
  switch (action.type) {
    case 'LOAD':
      return action.payload;

    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
        movements: state.movements.filter((m) => m.productId !== action.payload),
      };

    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
      };

    case 'ADD_SUPPLIER':
      return { ...state, suppliers: [...state.suppliers, action.payload] };

    case 'UPDATE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };

    case 'DELETE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.filter((s) => s.id !== action.payload),
      };

    case 'ADD_MOVEMENT': {
      const movement = action.payload;
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === movement.productId
            ? { ...p, quantity: movement.newQuantity, updatedAt: movement.createdAt }
            : p
        ),
        movements: [movement, ...state.movements],
      };
    }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    default:
      return state;
  }
}

interface InventoryContextValue {
  state: InventoryState;
  loading: boolean;
  addProduct: (data: ProductFormData) => Promise<void>;
  updateProduct: (id: string, data: ProductFormData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (data: CategoryFormData) => Promise<void>;
  updateCategory: (id: string, data: CategoryFormData) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSupplier: (data: SupplierFormData) => Promise<void>;
  updateSupplier: (id: string, data: SupplierFormData) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  addMovement: (productId: string, type: MovementType, quantity: number, reason: string, reference: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  resetData: () => Promise<void>;
  exportData: () => string;
  importData: (json: string) => Promise<boolean>;
  getDashboardStats: () => DashboardStats;
  getCategoryById: (id: string) => Category | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
  getProductById: (id: string) => Product | undefined;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, emptyState);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    dispatch({ type: 'LOAD', payload: loadState() });
    setLoading(false);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveState(state);
  }, [state, ready]);

  useEffect(() => {
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.darkMode]);

  const addProduct = useCallback(async (data: ProductFormData) => {
    const now = new Date().toISOString();
    const product: Product = { id: generateId('prod'), ...data, createdAt: now, updatedAt: now };
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  }, []);

  const updateProduct = useCallback(async (id: string, data: ProductFormData) => {
    const existing = state.products.find((p) => p.id === id);
    if (!existing) throw new Error('Product not found');
    const product: Product = { ...existing, ...data, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_PRODUCT', payload: product });
  }, [state.products]);

  const deleteProduct = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
  }, []);

  const addCategory = useCallback(async (data: CategoryFormData) => {
    const category: Category = {
      id: generateId('cat'),
      ...data,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_CATEGORY', payload: category });
  }, []);

  const updateCategory = useCallback(async (id: string, data: CategoryFormData) => {
    const existing = state.categories.find((c) => c.id === id);
    if (!existing) throw new Error('Category not found');
    dispatch({ type: 'UPDATE_CATEGORY', payload: { ...existing, ...data } });
  }, [state.categories]);

  const deleteCategory = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  }, []);

  const addSupplier = useCallback(async (data: SupplierFormData) => {
    const supplier: Supplier = {
      id: generateId('sup'),
      ...data,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_SUPPLIER', payload: supplier });
  }, []);

  const updateSupplier = useCallback(async (id: string, data: SupplierFormData) => {
    const existing = state.suppliers.find((s) => s.id === id);
    if (!existing) throw new Error('Supplier not found');
    dispatch({ type: 'UPDATE_SUPPLIER', payload: { ...existing, ...data } });
  }, [state.suppliers]);

  const deleteSupplier = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_SUPPLIER', payload: id });
  }, []);

  const addMovement = useCallback(
    async (productId: string, type: MovementType, quantity: number, reason: string, reference: string) => {
      const product = state.products.find((p) => p.id === productId);
      if (!product) throw new Error('Product not found');

      let delta = quantity;
      if (type === 'out') delta = -Math.abs(quantity);
      if (type === 'in') delta = Math.abs(quantity);

      const previousQuantity = product.quantity;
      const newQuantity = Math.max(0, previousQuantity + delta);
      const now = new Date().toISOString();

      const movement: StockMovement = {
        id: generateId('mov'),
        productId,
        type,
        quantity: type === 'adjustment' ? quantity : Math.abs(quantity),
        previousQuantity,
        newQuantity,
        reason,
        reference,
        createdAt: now,
      };
      dispatch({ type: 'ADD_MOVEMENT', payload: movement });
    },
    [state.products]
  );

  const updateSettings = useCallback(async (settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const resetData = useCallback(async () => {
    dispatch({ type: 'LOAD', payload: structuredClone(seedData) });
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importData = useCallback(async (json: string) => {
    try {
      const parsed = JSON.parse(json) as InventoryState;
      if (!parsed.products || !parsed.categories || !parsed.suppliers) return false;
      dispatch({ type: 'LOAD', payload: parsed });
      return true;
    } catch {
      return false;
    }
  }, []);

  const getDashboardStats = useCallback((): DashboardStats => {
    const { products, categories, suppliers, movements } = state;
    return {
      totalProducts: products.length,
      totalCategories: categories.length,
      totalSuppliers: suppliers.length,
      totalStockValue: products.reduce((sum, p) => sum + p.quantity * p.costPrice, 0),
      lowStockCount: products.filter((p) => p.quantity > 0 && p.quantity <= p.minStock).length,
      outOfStockCount: products.filter((p) => p.quantity === 0).length,
      recentMovements: movements.slice(0, 5),
    };
  }, [state]);

  const getCategoryById = useCallback(
    (id: string) => state.categories.find((c) => c.id === id),
    [state.categories]
  );

  const getSupplierById = useCallback(
    (id: string) => state.suppliers.find((s) => s.id === id),
    [state.suppliers]
  );

  const getProductById = useCallback(
    (id: string) => state.products.find((p) => p.id === id),
    [state.products]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-gray-500">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <InventoryContext.Provider
      value={{
        state,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addMovement,
        updateSettings,
        resetData,
        exportData,
        importData,
        getDashboardStats,
        getCategoryById,
        getSupplierById,
        getProductById,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
