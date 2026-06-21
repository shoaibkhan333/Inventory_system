const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  return localStorage.getItem('stockflow-token');
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('stockflow-token', token);
  } else {
    localStorage.removeItem('stockflow-token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  } catch {
    throw new ApiError(
      'Cannot reach the server. Start the backend with: cd server && npm run dev',
      0
    );
  }

  if (!res.ok) {
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      throw new ApiError(
        res.status === 404
          ? 'API not found on this URL. Open StockFlow at http://localhost:5180 with the backend running.'
          : `Server error (${res.status})`,
        res.status
      );
    }
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(body.error || 'Request failed', res.status);
  }

  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<import('../types').AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (name: string, email: string, password: string) =>
      request<import('../types').AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),
    me: () => request<{ user: import('../types').User }>('/auth/me'),
  },

  inventory: {
    getState: () => request<import('../types').InventoryState>('/inventory/state'),
    addCategory: (data: import('../types').CategoryFormData) =>
      request<import('../types').Category>('/inventory/categories', { method: 'POST', body: JSON.stringify(data) }),
    updateCategory: (id: string, data: import('../types').CategoryFormData) =>
      request<import('../types').Category>(`/inventory/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCategory: (id: string) =>
      request<{ success: boolean }>(`/inventory/categories/${id}`, { method: 'DELETE' }),
    addSupplier: (data: import('../types').SupplierFormData) =>
      request<import('../types').Supplier>('/inventory/suppliers', { method: 'POST', body: JSON.stringify(data) }),
    updateSupplier: (id: string, data: import('../types').SupplierFormData) =>
      request<import('../types').Supplier>(`/inventory/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteSupplier: (id: string) =>
      request<{ success: boolean }>(`/inventory/suppliers/${id}`, { method: 'DELETE' }),
    addProduct: (data: import('../types').ProductFormData) =>
      request<import('../types').Product>('/inventory/products', { method: 'POST', body: JSON.stringify(data) }),
    updateProduct: (id: string, data: import('../types').ProductFormData) =>
      request<import('../types').Product>(`/inventory/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProduct: (id: string) =>
      request<{ success: boolean }>(`/inventory/products/${id}`, { method: 'DELETE' }),
    addMovement: (data: { productId: string; type: string; quantity: number; reason: string; reference: string }) =>
      request<import('../types').StockMovement>('/inventory/movements', { method: 'POST', body: JSON.stringify(data) }),
    updateSettings: (data: Partial<import('../types').AppSettings>) =>
      request<import('../types').AppSettings>('/inventory/settings', { method: 'PUT', body: JSON.stringify(data) }),
    reset: () => request<import('../types').InventoryState>('/inventory/reset', { method: 'POST' }),
    import: (data: import('../types').InventoryState) =>
      request<{ success: boolean }>('/inventory/import', { method: 'POST', body: JSON.stringify(data) }),
  },
};

export { ApiError };
