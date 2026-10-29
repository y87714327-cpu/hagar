/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { CommissionModal } from './components/CommissionModal';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { JournalPage } from './pages/JournalPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { CheckCircle2 } from 'lucide-react';

const MainRouter: React.FC = () => {
  const { currentRoute, toastMessage } = useApp();
  const { isAuthenticated, isLoading } = useAdminAuth();

  // If viewing admin route
  if (currentRoute === 'admin') {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center text-xs text-[#302A2D]/60">
          Verifying administrator session...
        </div>
      );
    }
    if (!isAuthenticated) {
      return <AdminLogin />;
    }
    return <AdminLayout />;
  }

  // Public Storefront View
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FFF9F0] text-[#302A2D]">
      <div>
        <AnnouncementBar />
        <Header />
        
        <main>
          {currentRoute === 'home' && <HomePage />}
          {currentRoute === 'shop' && <ShopPage />}
          {currentRoute === 'categories' && <ShopPage />}
          {currentRoute === 'product' && <ProductDetailsPage />}
          {currentRoute === 'journal' && <JournalPage />}
          {currentRoute === 'about' && <AboutPage />}
          {currentRoute === 'contact' && <ContactPage />}
        </main>
      </div>

      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      <SearchModal />
      <OrderTrackerModal />
      <CommissionModal />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#302A2D] text-[#FFF9F0] px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-[#C6A15B] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AdminAuthProvider>
      <AppProvider>
        <MainRouter />
      </AppProvider>
    </AdminAuthProvider>
  );
}
