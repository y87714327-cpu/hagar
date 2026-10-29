import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, language, t, navigateToProduct, formatPrice } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const prods = await api.getProducts({ search: searchTerm.trim() });
        setResults(prods);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div
        onClick={() => setIsSearchOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="relative mx-auto max-w-xl bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="relative border-b border-zinc-100 p-4.5 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={t('Search by artwork, supplies, journals...', 'ابحث عن لوحات، مستلزمات، دفاتر...')}
            autoFocus
            className="w-full bg-transparent text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              {t('Searching collections...', 'جاري البحث في المجموعات الفنية...')}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1.5">
              {results.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => {
                    navigateToProduct(prod.slug);
                    setIsSearchOpen(false);
                  }}
                  className="flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-zinc-50 transition-colors cursor-pointer group"
                >
                  <img
                    src={prod.images?.[0] || '/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png'}
                    alt={prod.name}
                    className="w-12 h-12 rounded-xl object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-900 group-hover:text-rose-600 transition-colors truncate">
                      {(language === 'ar' && prod.name_ar) ? prod.name_ar : prod.name}
                    </h4>
                    <p className="text-xs text-zinc-500 font-mono tabular-nums">
                      {formatPrice(prod.price)}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-rose-600 transition-colors rtl:rotate-180" />
                </div>
              ))}
            </div>
          ) : searchTerm.trim() ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              {t('No creations found matching your search.', 'لم يتم العثور على قطع فنية تطابق بحثك.')}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-zinc-400 font-light">
              {t('Start typing to explore handmade creations and art materials.', 'ابدأ بالكتابة لاستكشاف المصنوعات اليدوية والمستلزمات الفنية.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
