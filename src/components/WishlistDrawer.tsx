import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { api } from '../services/api';
import { X, Heart, ShoppingBag, Trash2, ArrowRight, MessageCircle } from 'lucide-react';

export const WishlistDrawer: React.FC = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    toggleWishlist,
    addToCart,
    navigateToProduct,
    formatPrice,
    language,
    t,
    settings,
  } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isWishlistOpen) return;
    const fetchWishlistProducts = async () => {
      setIsLoading(true);
      try {
        const allProds = await api.getProducts();
        setProducts(allProds.filter(p => wishlist.includes(p.id)));
      } catch (err) {
        console.error('Failed to load wishlist products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWishlistProducts();
  }, [isWishlistOpen, wishlist]);

  if (!isWishlistOpen) return null;

  const handleShareWishlistOnWhatsApp = () => {
    const phone = settings?.whatsapp_number?.replace(/\+/g, '').replace(/\s+/g, '') || '201023456789';
    const itemsList = products.map(p => `• ${p.name} (${p.price} ${p.currency})`).join('\n');
    const msg = encodeURIComponent(
      `Hello Hager! 🌸 Here is my saved wishlist of artworks from Artistic Touch:\n\n${itemsList}\n\nI would love to ask about availability and custom details!`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsWishlistOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 rtl:right-auto rtl:left-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white border-l rtl:border-l-0 rtl:border-r border-zinc-200 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-rose-600 fill-current" />
              <h2 className="font-serif text-xl font-bold text-zinc-950">
                {t('My Saved Wishlist', 'قائمة الرغبات والمفضلات')}
              </h2>
              <span className="text-xs text-zinc-400 font-mono font-medium">
                ({wishlist.length})
              </span>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors rounded-xl hover:bg-zinc-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {isLoading ? (
              <div className="py-16 text-center text-xs text-zinc-500">
                {t('Loading your saved pieces...', 'جاري تحميل المفضلات...')}
              </div>
            ) : wishlist.length === 0 || products.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <Heart className="w-12 h-12 text-zinc-300 mx-auto stroke-1" />
                <h3 className="font-serif text-lg font-bold text-zinc-900">
                  {t('Your wishlist is empty', 'قائمتك المفضلة فارغة حالياً')}
                </h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed font-light">
                  {t(
                    'Click the heart icon on any creation you love to save it here for later.',
                    'انقر على أيقونة القلب على أي قطعة فنية تحبها لحفظها والرجوع إليها لاحقاً.'
                  )}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {products.map(prod => (
                  <div key={prod.id} className="py-3.5 flex gap-3.5 items-center">
                    <img
                      src={prod.images?.[0] || '/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png'}
                      alt={prod.name}
                      onClick={() => {
                        navigateToProduct(prod.slug);
                        setIsWishlistOpen(false);
                      }}
                      className="w-16 h-16 rounded-xl object-cover bg-zinc-100 border border-zinc-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                    />
                    <div className="flex-1 min-w-0">
                      <h4
                        onClick={() => {
                          navigateToProduct(prod.slug);
                          setIsWishlistOpen(false);
                        }}
                        className="text-sm font-semibold text-zinc-900 truncate cursor-pointer hover:text-rose-600 transition-colors"
                      >
                        {(language === 'ar' && prod.name_ar) ? prod.name_ar : prod.name}
                      </h4>
                      <div className="text-xs text-zinc-900 font-mono font-bold mt-0.5">
                        {formatPrice(prod.price)}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => {
                            addToCart(prod);
                            toggleWishlist(prod.id);
                          }}
                          className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{t('Move to Bag', 'نقل للحقيبة')}</span>
                        </button>
                        <button
                          onClick={() => toggleWishlist(prod.id)}
                          className="text-xs text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          {t('Remove', 'إزالة')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Action */}
          {products.length > 0 && (
            <div className="p-5 border-t border-zinc-100 bg-white space-y-2">
              <button
                onClick={handleShareWishlistOnWhatsApp}
                className="w-full py-3.5 px-4 bg-[#25D366] text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-[#20ba59] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t('Share Wishlist with Hager via WhatsApp', 'مشاركة المفضلات مع هاجر عبر واتساب')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
