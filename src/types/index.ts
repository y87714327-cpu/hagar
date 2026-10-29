export interface Product {
  id: string;
  name: string;
  name_ar?: string;
  slug: string;
  short_description?: string;
  short_description_ar?: string;
  description: string;
  description_ar?: string;
  price: number;
  original_price?: number;
  currency: string;
  category_id: string;
  sku?: string;
  stock_quantity: number;
  track_inventory: boolean;
  is_featured: boolean;
  is_published: boolean;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_ar?: string;
  slug: string;
  description?: string;
  description_ar?: string;
  image?: string;
  order: number;
  is_published: boolean;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  image?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  notes?: string;
  items: OrderItem[];
  total_amount: number;
  currency: string;
  status: OrderStatus;
  payment_method: 'cod' | 'whatsapp' | 'manual';
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  announcement_bar_text: string;
  announcement_bar_text_ar: string;
  announcement_bar_enabled: boolean;
  hero_headline: string;
  hero_headline_ar: string;
  hero_subheadline: string;
  hero_subheadline_ar: string;
  hero_image: string;
  brand_story: string;
  brand_story_ar: string;
  about_philosophy?: string;
  about_philosophy_ar?: string;
  whatsapp_number: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  pinterest_url: string;
  currency: string;
  default_language: 'en' | 'ar';
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
  created_at: string;
}

export interface DashboardStats {
  active_products: number;
  total_categories: number;
  out_of_stock_count: number;
  total_orders: number;
  total_revenue: number;
  recent_products: Product[];
  recent_orders: Order[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
  read: boolean;
}

export interface CommissionRequest {
  id: string;
  request_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  medium_type: 'resin_tray' | 'journal_calligraphy' | 'bridal_preservation' | 'custom_canvas';
  color_palette: string;
  personalization_text?: string;
  notes?: string;
  status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export interface JournalArticle {
  id: string;
  title: string;
  title_ar: string;
  slug: string;
  read_time: string;
  read_time_ar: string;
  category: string;
  category_ar: string;
  excerpt: string;
  excerpt_ar: string;
  content: string;
  content_ar: string;
  image: string;
  published_at: string;
}

