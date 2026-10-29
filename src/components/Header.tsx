import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Search, Menu, X, Lock, PackageCheck, Heart, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentRoute,
    setCurrentRoute,
    language,
    setLanguage,
    t,
    cartCount,
    setIsCartOpen,
    setIsSearchOpen,
    wishlist,
    setIsWishlistOpen,
    selectedCurrency,
    setSelectedCurrency,
    setIsOrderTrackerOpen,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: t('Home', 'الرئيسية') },
    { id: 'shop', label: t('Shop Boutique', 'المتجر') },
    { id: 'categories', label: t('Collections', 'المجموعات') },
    { id: 'journal', label: t('Atelier Journal', 'يوميات المرسم') },
    { id: 'about', label: t('The Artist', 'عن الفنانة') },
    { id: 'contact', label: t('Contact & Bespoke', 'تواصل وطلبات خاصة') },
  ];

  const handleNavClick = (routeId: string) => {
    setCurrentRoute(routeId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Zone 1: Official Brand Logo & Wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3.5 text-start group cursor-pointer focus-visible:outline-none shrink-0"
          title={t('Return to home page', 'العودة إلى الصفحة الرئيسية')}
          aria-label={t('Artistic Touch #Hager - Return to home page', 'آرتيستك تاتش #هاجر - العودة إلى الصفحة الرئيسية')}
        >
          <div className="relative">
            <img
              src="/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png"
              alt="Artistic Touch #Hager Logo"
              className="w-12 h-12 rounded-full object-cover shadow-xs border-2 border-[#C6A15B]/50 group-hover:scale-105 group-hover:border-[#C6A15B] transition-all"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 leading-none group-hover:text-rose-600 transition-colors">
              Artistic Touch
            </span>
            <span className="text-xs font-script font-semibold tracking-wide text-rose-500 leading-tight mt-0.5">
              #Hager
            </span>
          </div>
        </button>

        {/* Zone 2: Editorial Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-widest font-semibold text-zinc-600">
          {navLinks.map(link => {
            const isActive = currentRoute === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`cursor-pointer whitespace-nowrap transition-colors relative py-1 hover:text-zinc-950 ${
                  isActive ? 'text-zinc-950 font-bold' : ''
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Modern Utilities Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Currency Switcher */}
          <select
            value={selectedCurrency}
            onChange={e => setSelectedCurrency(e.target.value as any)}
            className="bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200/80 text-[11px] font-mono font-medium rounded-lg py-1.5 px-2 text-zinc-800 focus:border-[#C6A15B] focus:outline-none cursor-pointer transition-colors"
            title={t('Select Display Currency', 'اختر العملة المعروضة')}
          >
            <option value="EGP">EGP</option>
            <option value="SAR">SAR</option>
            <option value="AED">AED</option>
            <option value="USD">USD</option>
          </select>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="cursor-pointer text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-zinc-200/80 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
          >
            {language === 'en' ? 'عربي' : 'EN'}
          </button>

          {/* Track Order Trigger */}
          <button
            onClick={() => setIsOrderTrackerOpen(true)}
            className="cursor-pointer p-2 text-zinc-600 hover:text-zinc-900 transition-colors rounded-xl hover:bg-zinc-100"
            title={t('Track order status', 'تتبع حالة طلبك')}
            aria-label="Track Order"
          >
            <PackageCheck className="w-4.5 h-4.5" />
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="cursor-pointer p-2 text-zinc-600 hover:text-zinc-900 transition-colors rounded-xl hover:bg-zinc-100"
            aria-label={t('Search boutique', 'البحث في المتجر')}
            title={t('Search boutique', 'البحث في المتجر')}
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Wishlist Trigger */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="cursor-pointer relative p-2 text-zinc-600 hover:text-rose-600 transition-colors rounded-xl hover:bg-rose-50"
            aria-label={t('Wishlist', 'قائمة الرغبات')}
            title={t('Wishlist', 'قائمة الرغبات')}
          >
            <Heart className={`w-4.5 h-4.5 ${wishlist.length > 0 ? 'text-rose-600 fill-current' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Shopping Bag Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="cursor-pointer relative p-2 text-zinc-900 hover:text-rose-600 transition-colors rounded-xl hover:bg-zinc-100"
            aria-label={t('View shopping bag', 'عرض حقيبة التسوق')}
            title={t('Shopping bag', 'حقيبة التسوق')}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-zinc-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin Dashboard Discreet Shortcut */}
          <button
            onClick={() => handleNavClick('admin')}
            className="cursor-pointer p-2 text-zinc-400 hover:text-zinc-800 transition-colors rounded-xl hover:bg-zinc-100 hidden sm:inline-flex"
            title={t('Admin Dashboard', 'لوحة التحكم')}
            aria-label="Admin Dashboard"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden cursor-pointer p-2 text-zinc-900 hover:text-rose-600 transition-colors rounded-xl hover:bg-zinc-100"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200/80 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in fade-in slide-in-from-top-2">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`block w-full text-left rtl:text-right py-3 px-3.5 rounded-xl text-sm font-semibold transition-colors ${
                currentRoute === link.id
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-zinc-200/80 flex items-center justify-between px-3">
            <span className="text-xs text-zinc-500 font-medium">Artistic Touch #Hager</span>
            <button
              onClick={() => handleNavClick('admin')}
              className="text-xs text-[#C6A15B] font-semibold flex items-center gap-1.5 hover:underline"
            >
              <Lock className="w-3.5 h-3.5" />
              {t('Admin Area', 'منطقة الإدارة')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
