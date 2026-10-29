import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useApp } from '../../context/AppContext';
import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminOrders } from './AdminOrders';
import { AdminCommissions } from './AdminCommissions';
import { AdminSettings } from './AdminSettings';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Sparkles,
  Sliders,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { adminUser, logout } = useAdminAuth();
  const { setCurrentRoute } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'commissions' | 'settings'>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'orders', label: 'Customer Orders', icon: ShoppingCart },
    { id: 'commissions', label: 'Bespoke Requests', icon: Sparkles },
    { id: 'settings', label: 'Store Settings', icon: Sliders },
  ];

  const handleTabClick = (tabId: any) => {
    setActiveTab(tabId);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col justify-between border-r border-zinc-200/80 bg-white p-6 shrink-0 sticky top-0 h-screen shadow-xs">
        <div className="space-y-6">
          {/* Brand header */}
          <button
            onClick={() => setCurrentRoute('home')}
            className="cursor-pointer flex items-center gap-3 pb-4 border-b border-zinc-100 text-start group w-full focus-visible:outline-none"
            title="Return to Public Storefront"
          >
            <img
              src="/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png"
              alt="Logo"
              className="w-10 h-10 rounded-full border-2 border-[#C6A15B]/60 object-cover group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-serif text-lg font-bold text-zinc-900 block leading-tight group-hover:text-rose-600 transition-colors">
                Artistic Touch
              </span>
              <span className="text-[11px] font-script text-rose-500 font-semibold block">
                #Hager Admin
              </span>
            </div>
          </button>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`cursor-pointer w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-zinc-100 space-y-1.5 text-xs">
          <button
            onClick={() => setCurrentRoute('home')}
            className="cursor-pointer w-full flex items-center gap-2.5 px-3 py-2 text-zinc-600 hover:text-rose-600 transition-colors rounded-xl hover:bg-zinc-100 font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Public Boutique</span>
          </button>

          <button
            onClick={logout}
            className="cursor-pointer w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:text-rose-700 transition-colors rounded-xl hover:bg-rose-50 font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-zinc-200/80 p-4 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={() => setCurrentRoute('home')}
          className="cursor-pointer flex items-center gap-2.5 text-start group"
          title="Return to Public Storefront"
        >
          <img
            src="/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png"
            alt="Logo"
            className="w-8 h-8 rounded-full border border-[#C6A15B]/50 group-hover:scale-105 transition-transform"
          />
          <span className="font-serif font-bold text-sm text-zinc-900 group-hover:text-rose-600 transition-colors">
            Artistic Touch Admin
          </span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-zinc-800 rounded-xl hover:bg-zinc-100"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex">
          <div className="w-64 bg-white border-r border-zinc-200 h-full p-6 flex flex-col justify-between animate-in slide-in-from-left">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <button
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    setCurrentRoute('home');
                  }}
                  className="cursor-pointer flex items-center gap-2 text-start"
                >
                  <img
                    src="/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png"
                    alt="Logo"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-serif font-bold text-sm">Dashboard</span>
                </button>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-zinc-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-zinc-950 text-white'
                          : 'text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-zinc-100 space-y-1.5 text-xs">
              <button
                onClick={() => setCurrentRoute('home')}
                className="w-full flex items-center gap-2 px-3 py-2 text-zinc-600 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Public Boutique</span>
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
        </div>
      )}

      {/* Main Admin View Content */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        {activeTab === 'overview' && (
          <AdminOverview
            onNavigateTab={tab => setActiveTab(tab)}
            onOpenAddProduct={() => setActiveTab('products')}
          />
        )}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'categories' && <AdminCategories />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'commissions' && <AdminCommissions />}
        {activeTab === 'settings' && <AdminSettings />}
      </main>
    </div>
  );
};
