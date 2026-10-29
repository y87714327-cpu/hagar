import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, SiteSettings, OrderItem } from '../types';
import { api } from '../services/api';

export type Language = 'en' | 'ar';

export interface CartItem extends OrderItem {
  max_stock?: number;
  slug?: string;
}

export type AvailableCurrency = 'EGP' | 'SAR' | 'AED' | 'USD';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, ar?: string) => string;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  // Currency
  selectedCurrency: AvailableCurrency;
  setSelectedCurrency: (curr: AvailableCurrency) => void;
  formatPrice: (priceInEgp: number) => string;
  // Modals
  isOrderTrackerOpen: boolean;
  setIsOrderTrackerOpen: (open: boolean) => void;
  isCommissionModalOpen: boolean;
  setIsCommissionModalOpen: (open: boolean) => void;
  // Settings & Routing
  settings: SiteSettings | null;
  refreshSettings: () => Promise<void>;
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
  selectedProductSlug: string | null;
  navigateToProduct: (slug: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('at_lang') as Language) || 'en';
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('at_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('at_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [selectedCurrency, setSelectedCurrencyState] = useState<AvailableCurrency>(() => {
    return (localStorage.getItem('at_currency') as AvailableCurrency) || 'EGP';
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simple clean hash-based routing with fallback to 'home'
  const [currentRoute, setCurrentRouteState] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '') || 'home';
    return hash;
  });
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      if (hash.startsWith('product/')) {
        const slug = hash.replace('product/', '');
        setSelectedProductSlug(slug);
        setCurrentRouteState('product');
      } else {
        setSelectedProductSlug(null);
        setCurrentRouteState(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setCurrentRoute = (route: string) => {
    if (route === 'home') {
      setSelectedProductSlug(null);
      setCurrentRouteState('home');
      if (window.location.hash && window.location.hash !== '#home' && window.location.hash !== '#') {
        window.location.hash = 'home';
      } else {
        window.location.hash = '';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.location.hash = route;
    setCurrentRouteState(route);
    setSelectedProductSlug(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProduct = (slug: string) => {
    window.location.hash = `product/${slug}`;
    setSelectedProductSlug(slug);
    setCurrentRouteState('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync language with document direction
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('at_lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Bilingual translation helper
  const t = (en: string, ar?: string): string => {
    if (language === 'ar' && ar) {
      return ar;
    }
    return en;
  };

  // Persist cart
  useEffect(() => {
    localStorage.setItem('at_cart', JSON.stringify(cart));
  }, [cart]);

  // Load site settings
  const refreshSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (product.track_inventory && newQty > product.stock_quantity) {
          showToast(language === 'ar' ? 'الكمية المطلوبة تتجاوز المخزون المتوفر' : 'Requested quantity exceeds available stock');
          return prev;
        }
        return prev.map(item =>
          item.product_id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        if (product.track_inventory && quantity > product.stock_quantity) {
          showToast(language === 'ar' ? 'الكمية المطلوبة تتجاوز المخزون المتوفر' : 'Requested quantity exceeds available stock');
          return prev;
        }
        return [
          ...prev,
          {
            product_id: product.id,
            product_name: product.name,
            price: product.price,
            quantity,
            image: product.images?.[0] || '',
            max_stock: product.track_inventory ? product.stock_quantity : undefined,
            slug: product.slug,
          },
        ];
      }
    });

    showToast(language === 'ar' ? 'تمت الإضافة إلى حقيبة التسوق' : 'Added to shopping bag');
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.product_id === productId) {
          if (item.max_stock !== undefined && quantity > item.max_stock) {
            showToast(language === 'ar' ? 'الكمية المطلوبة تتجاوز المخزون المتوفر' : 'Cannot exceed available stock');
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  // Wishlist persistence
  useEffect(() => {
    localStorage.setItem('at_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(language === 'ar' ? 'تمت الإزالة من قائمة الرغبات' : 'Removed from wishlist');
        return prev.filter(id => id !== productId);
      } else {
        showToast(language === 'ar' ? 'تمت الإضافة إلى قائمة الرغبات 🌸' : 'Added to wishlist 🌸');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // Currency switcher
  const setSelectedCurrency = (curr: AvailableCurrency) => {
    setSelectedCurrencyState(curr);
    localStorage.setItem('at_currency', curr);
  };

  const formatPrice = (priceInEgp: number): string => {
    let rate = 1;
    let symbol = 'EGP';
    if (selectedCurrency === 'SAR') {
      rate = 0.076;
      symbol = language === 'ar' ? 'ر.س' : 'SAR';
    } else if (selectedCurrency === 'AED') {
      rate = 0.074;
      symbol = language === 'ar' ? 'د.إ' : 'AED';
    } else if (selectedCurrency === 'USD') {
      rate = 0.020;
      symbol = '$';
    } else {
      symbol = language === 'ar' ? 'ج.م' : (settings?.currency || 'EGP');
    }

    const converted = Math.round(priceInEgp * rate);
    if (selectedCurrency === 'USD') {
      return `$${converted.toLocaleString()}`;
    }
    return `${converted.toLocaleString()} ${symbol}`;
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        isWishlisted,
        isWishlistOpen,
        setIsWishlistOpen,
        selectedCurrency,
        setSelectedCurrency,
        formatPrice,
        isOrderTrackerOpen,
        setIsOrderTrackerOpen,
        isCommissionModalOpen,
        setIsCommissionModalOpen,
        settings,
        refreshSettings,
        currentRoute,
        setCurrentRoute,
        selectedProductSlug,
        navigateToProduct,
        toastMessage,
        showToast,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
