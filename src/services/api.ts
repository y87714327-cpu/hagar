import { Product, Category, Order, SiteSettings, ContactMessage, DashboardStats, CommissionRequest, JournalArticle } from '../types';

export const api = {
  // Public APIs
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    const data = await res.json();
    return data.settings;
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    return data.categories;
  },

  async getProducts(params?: { category?: string; search?: string; sort?: string; featured?: boolean }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.featured) query.set('featured', 'true');

    const res = await fetch(`/api/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data.products;
  },

  async getProduct(slugOrId: string): Promise<{ product: Product; category?: Category; related: Product[] }> {
    const res = await fetch(`/api/products/${slugOrId}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch product');
    }
    return res.json();
  },

  async createOrder(orderData: {
    customer_name: string;
    customer_email?: string;
    customer_phone: string;
    customer_address?: string;
    notes?: string;
    items: Array<{ product_id: string; product_name: string; quantity: number }>;
    payment_method: 'cod' | 'whatsapp' | 'manual';
  }): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit order');
    return data.order;
  },

  async trackOrder(referenceQuery: string): Promise<Order> {
    const res = await fetch(`/api/orders/track/${encodeURIComponent(referenceQuery)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to find order');
    return data.order;
  },

  async submitCommission(commissionData: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    medium_type: string;
    color_palette: string;
    personalization_text?: string;
    notes?: string;
  }): Promise<CommissionRequest> {
    const res = await fetch('/api/commissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commissionData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit commission request');
    return data.commission;
  },

  async getJournalArticles(): Promise<JournalArticle[]> {
    const res = await fetch('/api/journal');
    if (!res.ok) throw new Error('Failed to fetch journal articles');
    const data = await res.json();
    return data.articles;
  },

  async sendContactMessage(msg: { name: string; email: string; phone?: string; message: string }): Promise<string> {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');
    return data.message;
  },

  // Admin APIs
  async adminLogin(credentials: { email: string; password: string }) {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async adminLogout(token: string) {
    const res = await fetch('/api/admin/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  async getAdminAnalytics(token: string): Promise<DashboardStats & { stats: any }> {
    const res = await fetch('/api/admin/analytics', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics');
    return data;
  },

  async getAdminProducts(token: string): Promise<Product[]> {
    const res = await fetch('/api/admin/products', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin products');
    return data.products;
  },

  async createAdminProduct(token: string, product: Partial<Product>): Promise<Product> {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create product');
    return data.product;
  },

  async updateAdminProduct(token: string, id: string, updates: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update product');
    return data.product;
  },

  async deleteAdminProduct(token: string, id: string): Promise<void> {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete product');
  },

  async duplicateAdminProduct(token: string, id: string): Promise<Product> {
    const res = await fetch(`/api/admin/products/${id}/duplicate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to duplicate product');
    return data.product;
  },

  async getAdminCategories(token: string): Promise<Category[]> {
    const res = await fetch('/api/admin/categories', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch categories');
    return data.categories;
  },

  async createAdminCategory(token: string, category: Partial<Category>): Promise<Category> {
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(category),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create category');
    return data.category;
  },

  async updateAdminCategory(token: string, id: string, updates: Partial<Category>): Promise<Category> {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update category');
    return data.category;
  },

  async deleteAdminCategory(token: string, id: string, force = false): Promise<void> {
    const res = await fetch(`/api/admin/categories/${id}?force=${force}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete category');
  },

  async getAdminOrders(token: string): Promise<Order[]> {
    const res = await fetch('/api/admin/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
    return data.orders;
  },

  async updateAdminOrderStatus(token: string, id: string, status: string): Promise<Order> {
    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update order status');
    return data.order;
  },

  async updateAdminSettings(token: string, settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update settings');
    return data.settings;
  },

  async uploadAdminImage(token: string, imageBase64: string, filename: string, contentType: string): Promise<string> {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageBase64, filename, contentType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Image upload failed');
    return data.url;
  },

  async changeAdminPassword(token: string, currentPassword: string, newPassword: string): Promise<void> {
    const res = await fetch('/api/admin/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password change failed');
  },

  async getAdminCommissions(token: string): Promise<CommissionRequest[]> {
    const res = await fetch('/api/admin/commissions', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch commissions');
    return data.commissions;
  },

  async updateAdminCommissionStatus(token: string, id: string, status: string): Promise<CommissionRequest> {
    const res = await fetch(`/api/admin/commissions/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update commission status');
    return data.commission;
  },
};
