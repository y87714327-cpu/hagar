import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { ShoppingBag, MessageCircle, ArrowLeft, Check, AlertCircle, Shield, Sparkles, Heart, Share2 } from 'lucide-react';

export const ProductDetailsPage: React.FC = () => {
  const {
    selectedProductSlug,
    setCurrentRoute,
    language,
    t,
    addToCart,
    settings,
    setIsCartOpen,
    toggleWishlist,
    isWishlisted,
    formatPrice,
    showToast,
  } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedProductSlug) return;

    const loadProductData = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedImageIndex(0);
      setQuantity(1);
      try {
        const data = await api.getProduct(selectedProductSlug);
        setProduct(data.product);
        if (data.category) setCategory(data.category);
        setRelated(data.related || []);
      } catch (err: any) {
        setError(err.message || 'Product not found');
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, [selectedProductSlug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-sm text-zinc-500">
        <div className="inline-block w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p>{t('Loading artwork details...', 'جاري تحميل تفاصيل العمل الفني...')}</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-zinc-900">
          {t('Product Unavailable', 'المنتج غير متاح حالياً')}
        </h2>
        <p className="text-xs text-zinc-500 leading-relaxed">
          {error || t('The artwork you are looking for is no longer published or does not exist.', 'العمل الفني المطلوب غير متاح أو تم نقله.')}
        </p>
        <button
          onClick={() => setCurrentRoute('shop')}
          className="text-xs font-bold text-rose-600 hover:underline"
        >
          {t('← Return to boutique shop', '← العودة إلى المتجر')}
        </button>
      </div>
    );
  }

  const isOutOfStock = product.track_inventory && product.stock_quantity <= 0;
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  const displayName = (language === 'ar' && product.name_ar) ? product.name_ar : product.name;
  const displayDescription = (language === 'ar' && product.description_ar)
    ? product.description_ar
    : product.description;

  const images = (product.images && product.images.length > 0)
    ? product.images
    : ['/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png'];

  const categoryName = (language === 'ar' && category?.name_ar) ? category.name_ar : category?.name;

  const handleWhatsAppInquiry = () => {
    const phone = settings?.whatsapp_number?.replace(/\+/g, '').replace(/\s+/g, '') || '201023456789';
    const msg = encodeURIComponent(
      `Hello Hager! 🌸 I am inquiring about "${product.name}" (${product.price} ${product.currency}):\n${window.location.href}`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <button
          onClick={() => setCurrentRoute('shop')}
          className="hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <span>{t('Back to Shop', 'العودة للمتجر')}</span>
        </button>
        {categoryName && (
          <>
            <span>/</span>
            <button
              onClick={() => {
                window.location.hash = `shop?category=${product.category_id}`;
                setCurrentRoute('shop');
              }}
              className="hover:text-rose-600 transition-colors font-medium"
            >
              {categoryName}
            </button>
          </>
        )}
        <span>/</span>
        <span className="text-zinc-900 font-semibold truncate max-w-xs">{displayName}</span>
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Gallery Images */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 sm:aspect-square w-full rounded-3xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-md">
            <img
              src={images[selectedImageIndex]}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png';
              }}
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 bg-rose-600 text-white rounded-lg shadow-sm">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-rose-600 ring-2 ring-rose-500/20'
                      : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="lg:col-span-5 space-y-6 bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div>
            {categoryName && (
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#C6A15B] block mb-1">
                {categoryName}
              </span>
            )}
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-zinc-950 leading-tight">
              {displayName}
            </h1>
            {product.sku && (
              <span className="text-[11px] text-zinc-400 font-mono block mt-1">
                SKU: {product.sku}
              </span>
            )}
          </div>

          {/* Price Block */}
          <div className="pt-2 flex items-baseline gap-3">
            <span className="font-serif text-3xl font-bold text-zinc-950 font-mono tabular-nums">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-zinc-400 line-through font-mono tabular-nums">
                {formatPrice(product.original_price!)}
              </span>
            )}
          </div>

          {/* Stock Status Tag */}
          <div className="text-xs flex items-center gap-2">
            {isOutOfStock ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {t('Currently Out of Stock', 'غير متوفر حالياً بالمخزن')}
              </span>
            ) : product.track_inventory ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {t(`In Stock (${product.stock_quantity} available)`, `متوفر بالمخزن (${product.stock_quantity} قطع متبقية)`)}
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {t('Available for immediate craft & delivery', 'متاح للصنع والتوصيل المباشر')}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="pt-2 border-t border-zinc-100 text-xs sm:text-sm text-zinc-600 leading-relaxed space-y-2 whitespace-pre-line font-light">
            {displayDescription}
          </div>

          {/* Quantity Selector & Actions */}
          {!isOutOfStock ? (
            <div className="pt-4 border-t border-zinc-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 font-medium">
                    {t('Quantity:', 'الكمية:')}
                  </span>
                  <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-950 cursor-pointer font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-mono font-bold text-zinc-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => {
                        if (!product.track_inventory || quantity < product.stock_quantity) {
                          setQuantity(quantity + 1);
                        }
                      }}
                      className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-950 cursor-pointer font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Secondary Actions: Wishlist & Share */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`cursor-pointer p-2.5 rounded-xl border transition-all ${
                      isWishlisted(product.id)
                        ? 'border-rose-600 bg-rose-50 text-rose-600'
                        : 'border-zinc-200 text-zinc-500 hover:text-rose-600 hover:border-rose-200 bg-white'
                    }`}
                    title={isWishlisted(product.id) ? t('In Wishlist', 'في المفضلة') : t('Save to Wishlist', 'حفظ في المفضلة')}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        showToast(t('Artwork link copied to clipboard!', 'تم نسخ رابط العمل الفني إلى الحافظة!'));
                      }
                    }}
                    className="cursor-pointer p-2.5 rounded-xl border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 bg-white transition-all"
                    title={t('Share Artwork', 'مشاركة العمل')}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    addToCart(product, quantity);
                    setIsCartOpen(true);
                  }}
                  className="cursor-pointer w-full py-3.5 px-4 bg-zinc-950 text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-rose-500/20"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('Add to Shopping Bag', 'إضافة لحقيبة التسوق')}</span>
                </button>

                <button
                  onClick={handleWhatsAppInquiry}
                  className="cursor-pointer w-full py-3.5 px-4 bg-[#25D366] text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-[#20ba59] transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('Ask Hager on WhatsApp', 'استفسار عبر واتساب')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-zinc-100 space-y-3">
              <button
                disabled
                className="w-full py-3.5 px-4 bg-zinc-100 text-zinc-400 text-xs font-bold rounded-xl cursor-not-allowed"
              >
                {t('Sold Out', 'نفد من المخزون')}
              </button>
              <button
                onClick={handleWhatsAppInquiry}
                className="cursor-pointer w-full py-3 px-4 border border-[#C6A15B] text-zinc-900 text-xs font-semibold rounded-xl hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>{t('Request Remake on WhatsApp', 'طلب إعادة تصنيع مخصصة')}</span>
              </button>
            </div>
          )}

          {/* Atelier Trust Guarantee */}
          <div className="pt-4 border-t border-zinc-100 grid grid-cols-2 gap-3 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C6A15B] shrink-0" />
              <span>{t('Artisanal Gift Packaging', 'تغليف هدايا فني أنيق')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{t('Safe Bubble Packing', 'حماية فائقة أثناء الشحن')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {related.length > 0 && (
        <div className="pt-12 border-t border-zinc-200 space-y-8">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-950">
              {t('You May Also Cherish', 'قطع فنية أخرى قد تعجبكم')}
            </h2>
            <button
              onClick={() => setCurrentRoute('shop')}
              className="text-xs uppercase tracking-wider font-bold text-rose-600 hover:underline"
            >
              {t('View all collections →', 'عرض كافة المجموعات ←')}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map(rel => (
              <ProductCard key={rel.id} product={rel} categoryName={categoryName} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
