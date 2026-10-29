import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { Search, ArrowUpDown, Filter, Sparkles, X } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { language, t, setCurrentRoute } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Read initial category filter from URL hash if provided
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('category=')) {
      const match = hash.match(/category=([^&]+)/);
      if (match && match[1]) {
        setSelectedCategory(match[1]);
      }
    }
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadFilteredProducts = async () => {
      setIsLoading(true);
      try {
        const prods = await api.getProducts({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          search: searchQuery.trim() || undefined,
          sort: sortBy,
        });
        setProducts(prods);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadFilteredProducts();
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, sortBy]);

  const displayedProducts = onlyInStock
    ? products.filter(p => !p.track_inventory || p.stock_quantity > 0)
    : products;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header Title & Description */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600">
          {t('Artisan Catalog & Atelier Pieces', 'الكتالوج الفني وإبداعات المرسم')}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-950 tracking-tight">
          {t('Artistic Touch Boutique', 'متجر آرتيستك تاتش')}
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-light">
          {t(
            'Explore our handcrafted botanical creations, archival artist tools, and bespoke stationery.',
            'استكشفوا إبداعاتنا اليدوية من الريزن والزهور، ومستلزمات الرسم الفاخرة، والقرطاسية الفنية.'
          )}
        </p>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Top Search & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3.5 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('Search products by name or details...', 'ابحث بالاسم أو التفاصيل...')}
              className="w-full pl-10 pr-9 rtl:pr-10 rtl:pl-9 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-rose-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 rtl:right-auto rtl:left-3"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector & In-Stock Check */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={e => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-rose-600 focus:ring-rose-500"
              />
              <span>{t('In stock only', 'المتوفر فقط')}</span>
            </label>

            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs text-zinc-800 focus:border-rose-500 focus:outline-none cursor-pointer font-medium"
              >
                <option value="newest">{t('Newest Arrivals', 'الأحدث أولاً')}</option>
                <option value="price-asc">{t('Price: Low to High', 'السعر: من الأقل للأعلى')}</option>
                <option value="price-desc">{t('Price: High to Low', 'السعر: من الأعلى للأقل')}</option>
                <option value="name-asc">{t('Alphabetical', 'أبجدياً')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Tab Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-zinc-100 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
            }`}
          >
            {t('All Creations', 'كافة المعروضات')}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
              }`}
            >
              {(language === 'ar' && cat.name_ar) ? cat.name_ar : cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Results Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-sm text-zinc-500">
          <div className="inline-block w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p>{t('Loading curated collection...', 'جاري تحميل المعروضات الفنية...')}</p>
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="py-24 text-center max-w-md mx-auto space-y-4 bg-white rounded-3xl border border-dashed border-zinc-300 p-8 shadow-xs">
          <button
            onClick={() => {
              setCurrentRoute('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="cursor-pointer mx-auto block group"
            title={t('Return to home page', 'العودة إلى الصفحة الرئيسية')}
          >
            <img
              src="/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png"
              alt="Artistic Touch"
              className="w-16 h-16 rounded-full mx-auto opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all border border-[#C6A15B]/40"
            />
          </button>
          <h3 className="font-serif text-2xl font-bold text-zinc-900">
            {t('Our collection is taking shape. Check back soon.', 'مجموعتنا الفنية قيد الإعداد. تفضلوا بالزيارة قريباً.')}
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            {t(
              'Hager is currently crafting new pieces in the atelier. If you need a custom artwork immediately, reach out via WhatsApp.',
              'تعمل هاجر حالياً على تنفيذ قطع فنية جديدة في المرسم. إذا كنتم ترغبون بطلب مخصص يمكنكم التواصل عبر واتساب.'
            )}
          </p>
          {(selectedCategory !== 'all' || searchQuery || onlyInStock) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setOnlyInStock(false);
              }}
              className="text-xs text-rose-600 font-bold hover:underline"
            >
              {t('Clear all filters', 'إعادة تعيين الفلاتر')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedProducts.map(prod => {
            const cat = categories.find(c => c.id === prod.category_id);
            const catName = (language === 'ar' && cat?.name_ar) ? cat.name_ar : cat?.name;
            return <ProductCard key={prod.id} product={prod} categoryName={catName} />;
          })}
        </div>
      )}
    </div>
  );
};
