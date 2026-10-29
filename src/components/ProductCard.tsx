import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Eye, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, categoryName }) => {
  const {
    language,
    t,
    addToCart,
    navigateToProduct,
    toggleWishlist,
    isWishlisted,
    formatPrice,
  } = useApp();

  const isOutOfStock = product.track_inventory && product.stock_quantity <= 0;
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  const displayName = (language === 'ar' && product.name_ar) ? product.name_ar : product.name;
  const mainImage = product.images?.[0] || '/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png';
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="group relative flex flex-col bg-white border border-zinc-200/80 hover:border-zinc-300 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300 hover:-translate-y-1">
      {/* Product Image Area */}
      <div
        onClick={() => navigateToProduct(product.slug)}
        className="relative aspect-4/3 sm:aspect-square w-full overflow-hidden bg-zinc-100/70 cursor-pointer"
      >
        <img
          src={mainImage}
          alt={displayName}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png';
          }}
        />

        {/* Minimal Modern Badges */}
        <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {isOutOfStock ? (
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-zinc-900/90 text-white rounded-md backdrop-blur-xs">
              {t('Sold Out', 'نفد من المخزون')}
            </span>
          ) : hasDiscount ? (
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-rose-600 text-white rounded-md shadow-xs">
              -{discountPercent}%
            </span>
          ) : product.is_featured ? (
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-[#C6A15B] text-white rounded-md shadow-xs">
              {t('Featured', 'مميز')}
            </span>
          ) : null}
        </div>

        {/* Wishlist Button Top Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`cursor-pointer absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10 p-2.5 rounded-full backdrop-blur-md transition-all shadow-xs ${
            wishlisted
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white/85 text-zinc-600 hover:text-rose-600 hover:bg-white'
          }`}
          title={wishlisted ? t('Remove from wishlist', 'إزالة من المفضلة') : t('Save to wishlist', 'حفظ في المفضلة')}
          aria-label={t('Wishlist', 'المفضلة')}
        >
          <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Overlay Button on Hover */}
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2.5 pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateToProduct(product.slug);
            }}
            className="pointer-events-auto p-2.5 bg-white/95 text-zinc-900 rounded-full shadow-lg hover:bg-zinc-950 hover:text-white transition-all cursor-pointer transform scale-90 group-hover:scale-100"
            title={t('View details', 'عرض التفاصيل')}
          >
            <Eye className="w-4 h-4" />
          </button>
          {!isOutOfStock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className="pointer-events-auto p-2.5 bg-rose-600 text-white rounded-full shadow-lg hover:bg-rose-700 transition-all cursor-pointer transform scale-90 group-hover:scale-100"
              title={t('Quick Add to Bag', 'إضافة سريعة')}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 bg-white">
        <div>
          {categoryName && (
            <div className="text-[10px] uppercase tracking-widest text-[#C6A15B] font-bold mb-1">
              {categoryName}
            </div>
          )}
          <h3
            onClick={() => navigateToProduct(product.slug)}
            className="font-serif text-base sm:text-lg font-semibold text-zinc-900 line-clamp-1 group-hover:text-rose-600 transition-colors cursor-pointer"
          >
            {displayName}
          </h3>
          {product.short_description && (
            <p className="text-xs text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
              {(language === 'ar' && product.short_description_ar)
                ? product.short_description_ar
                : product.short_description}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-zinc-900 font-mono tabular-nums">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-zinc-400 line-through font-mono tabular-nums">
                {formatPrice(product.original_price!)}
              </span>
            )}
          </div>

          <button
            onClick={() => {
              if (isOutOfStock) {
                navigateToProduct(product.slug);
              } else {
                addToCart(product);
              }
            }}
            disabled={isOutOfStock}
            className={`cursor-pointer text-xs font-semibold py-2 px-3 rounded-xl transition-all flex items-center gap-1.5 ${
              isOutOfStock
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                : 'bg-zinc-900 text-white hover:bg-rose-600 shadow-xs'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? t('Sold Out', 'نفد') : t('Add to Bag', 'إضافة')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
