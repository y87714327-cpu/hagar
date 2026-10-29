import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { api } from '../../services/api';
import { Package, FolderTree, AlertTriangle, ShoppingCart, DollarSign, Plus, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { Product, Order } from '../../types';

interface AdminOverviewProps {
  onNavigateTab: (tab: 'products' | 'categories' | 'orders' | 'settings') => void;
  onOpenAddProduct: () => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigateTab, onOpenAddProduct }) => {
  const { token, adminUser } = useAdminAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupGuide, setShowSetupGuide] = useState(true);

  useEffect(() => {
    if (!token) return;
    const loadStats = async () => {
      try {
        const data = await api.getAdminAnalytics(token);
        setStats(data.stats);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, [token]);

  if (isLoading || !stats) {
    return (
      <div className="py-16 text-center text-xs text-[#302A2D]/60">
        Loading atelier telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl p-6 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#302A2D]">
            Welcome, {adminUser?.name || 'Hager'} 🌸
          </h1>
          <p className="text-xs text-[#302A2D]/70 mt-1">
            Manage your boutique creations, inventory, categories, and real customer orders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddProduct}
            className="cursor-pointer py-2.5 px-4 bg-[#302A2D] text-[#FFF9F0] text-xs font-semibold rounded-lg hover:bg-black transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Real Database Metric Cards (Anti-slop: strictly factual data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Products */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCF] rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#302A2D]/60 font-semibold block">
              Active Products
            </span>
            <span className="text-2xl font-bold text-[#302A2D] font-mono tabular-nums mt-1 block">
              {stats.active_products}
            </span>
            <span className="text-[11px] text-[#302A2D]/50">
              of {stats.total_products} total listed
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#F4B6C2]/20 text-[#E85D8A] flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCF] rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#302A2D]/60 font-semibold block">
              Categories
            </span>
            <span className="text-2xl font-bold text-[#302A2D] font-mono tabular-nums mt-1 block">
              {stats.total_categories}
            </span>
            <span className="text-[11px] text-[#302A2D]/50">
              curated collections
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#D9C8F5]/30 text-[#A85A83] flex items-center justify-center">
            <FolderTree className="w-5 h-5" />
          </div>
        </div>

        {/* Out of Stock Alert */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCF] rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#302A2D]/60 font-semibold block">
              Out of Stock
            </span>
            <span className={`text-2xl font-bold font-mono tabular-nums mt-1 block ${stats.out_of_stock_count > 0 ? 'text-amber-600' : 'text-[#302A2D]'}`}>
              {stats.out_of_stock_count}
            </span>
            <span className="text-[11px] text-[#302A2D]/50">
              {stats.out_of_stock_count > 0 ? 'needs restocking' : 'inventory healthy'}
            </span>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stats.out_of_stock_count > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Real Store Revenue */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCF] rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#302A2D]/60 font-semibold block">
              Real Revenue
            </span>
            <span className="text-2xl font-bold text-[#302A2D] font-mono tabular-nums mt-1 block">
              {stats.total_revenue.toLocaleString()} {stats.currency}
            </span>
            <span className="text-[11px] text-[#302A2D]/50">
              from {stats.total_orders} submitted orders
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#C6A15B]/15 text-[#C6A15B] flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* First-Time Setup & Management Guide */}
      {showSetupGuide && (
        <div className="bg-gradient-to-r from-[#FFFDF9] via-[#FFF9F0] to-[#F4B6C2]/15 border border-[#C6A15B]/40 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#C6A15B]" />
              <h2 className="font-serif text-lg font-bold text-[#302A2D]">
                Store Owner Quickstart & Operations Guide
              </h2>
            </div>
            <button
              onClick={() => setShowSetupGuide(false)}
              className="text-xs text-[#302A2D]/50 hover:text-[#302A2D]"
            >
              Dismiss
            </button>
          </div>

          <p className="text-xs text-[#302A2D]/80 leading-relaxed">
            As the owner of <strong>Artistic Touch #Hager</strong>, you have full control over your boutique without writing code:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="bg-white/80 border border-[#EBDCCF] rounded-xl p-3.5 space-y-1.5">
              <span className="font-semibold text-xs text-[#302A2D] block">
                1. Product Management
              </span>
              <p className="text-[11px] text-[#302A2D]/70 leading-relaxed">
                Add new resin trays, journals, or art supplies. Upload images directly from your phone/laptop. Set prices, inventory tracking, and toggle draft/published status instantly.
              </p>
            </div>

            <div className="bg-white/80 border border-[#EBDCCF] rounded-xl p-3.5 space-y-1.5">
              <span className="font-semibold text-xs text-[#302A2D] block">
                2. Categories & Curation
              </span>
              <p className="text-[11px] text-[#302A2D]/70 leading-relaxed">
                Create new collections, rename existing ones, or reorder them. Products are automatically filtered by category on the shop page.
              </p>
            </div>

            <div className="bg-white/80 border border-[#EBDCCF] rounded-xl p-3.5 space-y-1.5">
              <span className="font-semibold text-xs text-[#302A2D] block">
                3. WhatsApp & Order Processing
              </span>
              <p className="text-[11px] text-[#302A2D]/70 leading-relaxed">
                View real customer orders, customer addresses, and special notes. Update order statuses (Confirmed, Shipped, Delivered) and chat with customers on WhatsApp with 1 click.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders & Recent Products 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Real Orders */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBDCCF]">
            <h3 className="font-serif text-lg font-bold text-[#302A2D]">
              Recent Orders
            </h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-[#E85D8A] hover:underline"
            >
              View all orders ({stats.total_orders})
            </button>
          </div>

          {stats.recent_orders && stats.recent_orders.length > 0 ? (
            <div className="divide-y divide-[#EBDCCF]/60">
              {stats.recent_orders.map((ord: Order) => (
                <div key={ord.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#302A2D]">
                        {ord.order_number}
                      </span>
                      <span className="text-[11px] text-[#302A2D]/60">
                        by {ord.customer_name}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#302A2D]/50 mt-0.5">
                      {ord.items.length} item(s) · {new Date(ord.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#302A2D] font-mono tabular-nums block">
                      {ord.total_amount.toLocaleString()} {ord.currency}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-emerald-700">
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#302A2D]/50 space-y-1">
              <ShoppingCart className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p>No orders submitted yet.</p>
              <p className="text-[11px] text-[#302A2D]/40">When customers place orders, they will appear here in real-time.</p>
            </div>
          )}
        </div>

        {/* Recently Updated Products */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBDCCF]">
            <h3 className="font-serif text-lg font-bold text-[#302A2D]">
              Catalog Inventory
            </h3>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-semibold text-[#E85D8A] hover:underline"
            >
              Manage all products ({stats.total_products})
            </button>
          </div>

          <div className="divide-y divide-[#EBDCCF]/60">
            {stats.recent_products && stats.recent_products.map((p: Product) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.images?.[0] || '/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png'}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover bg-neutral-100 border border-[#EBDCCF] shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-[#302A2D] truncate">
                      {p.name}
                    </h4>
                    <span className="text-[11px] text-[#302A2D]/60 font-mono">
                      {p.price.toLocaleString()} {p.currency}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm ${p.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'}`}>
                    {p.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
