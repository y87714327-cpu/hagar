import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Product, Category, JournalArticle } from '../types';
import { api } from '../services/api';
import { ArrowRight, Sparkles, Heart, Palette, Feather, ShieldCheck, MessageCircle, ChevronRight, BookOpen, Clock } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { language, t, settings, setCurrentRoute, setIsCommissionModalOpen } = useApp();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [cats, prods, journal] = await Promise.all([
          api.getCategories(),
          api.getProducts({ featured: true }),
          api.getJournalArticles().catch(() => []),
        ]);
        setCategories(cats);
        setFeaturedProducts(prods);
        setArticles(journal.slice(0, 2));
      } catch (err) {
        console.error('Failed to load home page content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const headline = (language === 'ar' && settings?.hero_headline_ar)
    ? settings.hero_headline_ar
    : settings?.hero_headline || 'Every Creation Has a Story.';

  const subheadline = (language === 'ar' && settings?.hero_subheadline_ar)
    ? settings.hero_subheadline_ar
    : settings?.hero_subheadline || 'Discover a world of creativity, color, and carefully crafted artistic details.';

  const heroImage = settings?.hero_image || '/src/assets/images/hero_artist_atelier_1793303316706.jpg';

  const whatsappLink = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\+/g, '').replace(/\s+/g, '')}`
    : '#';

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-x-hidden">
      {/* 1. Hero Section - Sleek High-Fashion Editorial */}
      <section className="relative pt-6 pb-16 lg:pt-14 lg:pb-24">
        {/* Modern ambient radiance blurs (replaces dull yellow with ethereal luxury glow) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-rose-200/30 via-[#D9C8F5]/20 to-amber-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* Left Column: Brand Statement */}
            <div className="lg:col-span-7 space-y-7 text-left rtl:text-right">
              
              {/* Brand Status Pill */}
              <div className="inline-flex items-center gap-3 py-1.5 px-3.5 bg-white border border-zinc-200/90 rounded-full shadow-xs backdrop-blur-md">
                <img
                  src="/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png"
                  alt="Artistic Touch Official Logo"
                  className="w-7 h-7 rounded-full object-cover border border-[#C6A15B]/50 shrink-0"
                />
                <span className="text-[11px] uppercase tracking-widest text-zinc-900 font-bold">
                  Artistic Touch <span className="text-rose-500 font-script normal-case text-sm">#Hager</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-zinc-500 font-medium hidden sm:inline">
                  {t('Cairo Atelier', 'مرسم القاهرة')}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-zinc-950 leading-[1.1] tracking-tight text-balance">
                {headline}
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl font-normal">
                {subheadline}
              </p>

              {/* Modern Action Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  onClick={() => {
                    setCurrentRoute('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="cursor-pointer py-3.5 px-7 bg-zinc-950 text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-rose-600 transition-all shadow-md hover:shadow-xl hover:shadow-rose-500/20 flex items-center gap-2 group"
                >
                  <span>{t('Explore Collection', 'استكشف المجموعات')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setIsCommissionModalOpen(true)}
                  className="cursor-pointer py-3.5 px-6 bg-white text-zinc-900 border border-zinc-200/90 text-xs uppercase tracking-wider font-bold rounded-xl hover:border-rose-500 hover:text-rose-600 hover:bg-rose-50/30 transition-all shadow-xs flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#C6A15B]" />
                  <span>{t('Bespoke Commission', 'طلب تصميم مخصص')}</span>
                </button>
              </div>

              {/* Modern Trust Bar */}
              <div className="pt-8 border-t border-zinc-200/80 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-bold text-zinc-900 block text-sm sm:text-base font-serif">100% {t('Handmade', 'يدوي')}</span>
                  <span className="text-zinc-500 text-[11px]">{t('Original Egyptian atelier', 'إبداع أصيل من المرسم')}</span>
                </div>
                <div>
                  <span className="font-bold text-zinc-900 block text-sm sm:text-base font-serif">{t('Bespoke', 'تصاميم')}</span>
                  <span className="text-zinc-500 text-[11px]">{t('Bridal & floral keepsakes', 'تخليد زهور وأفراح')}</span>
                </div>
                <div>
                  <span className="font-bold text-zinc-900 block text-sm sm:text-base font-serif">{t('Worldwide', 'شحن')}</span>
                  <span className="text-zinc-500 text-[11px]">{t('Carefully boxed gifts', 'تغليف هدايا ملكي')}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl bg-white aspect-4/3 lg:aspect-4/5 group">
                  <img
                    src={heroImage}
                    alt="Artistic Touch Studio Atelier"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                  {/* Corner Brand Seal */}
                  <div className="absolute bottom-5 inset-x-5 text-white backdrop-blur-md bg-zinc-900/60 p-4 rounded-2xl border border-white/20 flex items-center justify-between shadow-lg">
                    <div>
                      <span className="font-serif font-bold text-base block text-white">Artistic Touch Atelier</span>
                      <span className="text-xs text-rose-200/90 font-medium">{t('Handmade by Hager in Cairo', 'بأنامل الفنانة هاجر — القاهرة')}</span>
                    </div>
                    <img
                      src="/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png"
                      alt="Artistic Touch Badge"
                      className="w-10 h-10 rounded-full border-2 border-[#C6A15B] shadow-md shrink-0"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Featured Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-8 pb-4 border-b border-zinc-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 block mb-1">
              {t('Curated Mediums', 'المجموعات الفنية')}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-zinc-950">
              {t('Explore by Category', 'استكشف حسب التصنيف')}
            </h2>
          </div>
          <button
            onClick={() => {
              setCurrentRoute('categories');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs uppercase tracking-wider font-bold text-zinc-700 hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer group"
          >
            <span>{t('View all categories', 'عرض كافة التصنيفات')}</span>
            <ChevronRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="py-14 text-center text-sm text-zinc-500 bg-white rounded-2xl border border-dashed border-zinc-200">
            {t('No categories configured yet.', 'لم يتم إضافة تصنيفات بعد.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(cat => (
              <div
                key={cat.id}
                onClick={() => {
                  window.location.hash = `shop?category=${cat.id}`;
                  setCurrentRoute('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group relative rounded-2xl overflow-hidden border border-zinc-200 bg-white cursor-pointer hover:shadow-xl hover:shadow-zinc-200/60 transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className="aspect-4/3 w-full overflow-hidden bg-zinc-100 relative">
                  <img
                    src={cat.image || '/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png'}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                  <h3 className="font-serif text-lg font-bold group-hover:text-rose-300 transition-colors">
                    {(language === 'ar' && cat.name_ar) ? cat.name_ar : cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-zinc-300 line-clamp-1 mt-1 font-light">
                      {(language === 'ar' && cat.description_ar) ? cat.description_ar : cat.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Featured Creations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-8 pb-4 border-b border-zinc-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 block mb-1">
              {t('Atelier Highlights', 'مختارات مميزة')}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-zinc-950">
              {t('Featured Creations', 'إبداعات مختارة')}
            </h2>
          </div>
          <button
            onClick={() => {
              setCurrentRoute('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs uppercase tracking-wider font-bold text-zinc-700 hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer group"
          >
            <span>{t('Browse entire store', 'تصفح المتجر بالكامل')}</span>
            <ChevronRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-500 bg-white rounded-2xl border border-dashed border-zinc-200">
            {t('Our collection is taking shape. Check back soon.', 'مجموعتنا الفنية قيد الإعداد. تفضلوا بالزيارة قريباً.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map(prod => {
              const cat = categories.find(c => c.id === prod.category_id);
              const catName = (language === 'ar' && cat?.name_ar) ? cat.name_ar : cat?.name;
              return <ProductCard key={prod.id} product={prod} categoryName={catName} />;
            })}
          </div>
        )}
      </section>

      {/* 4. Bespoke Custom Commissions Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-zinc-950 text-white p-8 sm:p-14 border border-zinc-800 shadow-2xl">
          {/* Subtle luminous background ambient mesh */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#C6A15B]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4 text-left rtl:text-right">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C6A15B] text-xs font-semibold tracking-wider uppercase border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('Bespoke Atelier Commissions', 'طلبات مخصصة وتصاميم خاصة')}</span>
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
                {t('Have a specific memory or wedding bouquet to preserve?', 'لديكِ ذكرى محبوبة أو بوكيه ورد زفاف ترغبين في تخليده؟')}
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
                {t(
                  'Artist Hager personalizes custom botanical resin vanity trays, gold-leaf jewelry holders, and deckled calligraphy journals. Share your ideas and get a tailored commission.',
                  'تقوم الفنانة هاجر بتصميم صواني ريزن خاصة بزهوركم المجففة، وقطع زينة مطلية بورق الذهب، ودفاتر خط عربي شخصية. شاركونا فكرتكم لنحولها لقطعة فنية أبدية.'
                )}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3.5 justify-end">
              <button
                onClick={() => setIsCommissionModalOpen(true)}
                className="cursor-pointer py-4 px-6 bg-rose-600 text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-rose-500 transition-all shadow-lg hover:shadow-rose-600/30 flex items-center justify-center gap-2 group"
              >
                <span>{t('Start Custom Commission', 'ابدأ طلبك المخصص')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </button>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="py-4 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs uppercase tracking-wider font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>{t('WhatsApp Direct Chat', 'واتساب مباشر')}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Brand Story & Artisanal Craftsmanship Section */}
      <section className="bg-white border-y border-zinc-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Atelier Craft Photography */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden border border-zinc-200 shadow-xl aspect-square bg-zinc-100 group">
                <img
                  src="/src/assets/images/artist_studio_craft_1793303319329.jpg"
                  alt="Artist Hager at work in the atelier"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png';
                  }}
                />
              </div>
            </div>

            {/* Story Text */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6 text-left rtl:text-right">
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 block">
                {t('Craftsmanship & Philosophy', 'فلسفة الصنع والإبداع')}
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-950 leading-tight">
                {t(
                  'Handcrafted with patience, finished with gold, and designed to inspire.',
                  'صُنعت بصبر وشغف، وزُينت بلمسات ذهبية لتُلهم كل حواسكم.'
                )}
              </h2>
              <p className="text-base text-zinc-600 leading-relaxed font-light">
                {(language === 'ar' && settings?.brand_story_ar)
                  ? settings.brand_story_ar
                  : settings?.brand_story}
              </p>
              
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-zinc-100">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C6A15B] flex items-center justify-center shrink-0 border border-amber-200/60">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">
                      {t('Artisanal Materials', 'خامات فنية نقية')}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {t('Archival cotton papers, pure artist pigments, and crystal non-yellowing resin.', 'أوراق قطنية أرشيفية، ألوان أصلية، وريزن نقي غير قابل للاصفرار.')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/60">
                    <Feather className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">
                      {t('Personal Signature', 'بصمة شخصية')}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {t('Every artwork is inspected, wrapped, and sealed by hand.', 'كل قطعة تُراجع وتُغلّف يدوياً بختم شمعي خاص.')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setCurrentRoute('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="cursor-pointer text-xs uppercase tracking-wider font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>{t('Read the full atelier story', 'اقرأ قصة المرسم بالكامل')}</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Atelier Journal Preview (Editorial Articles) */}
      {articles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-8 pb-4 border-b border-zinc-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 block mb-1">
                {t('From the Studio Desk', 'من مرسم هاجر')}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-zinc-950">
                {t('Atelier Journal & Care Guides', 'يوميات المرسم وإرشادات العناية')}
              </h2>
            </div>
            <button
              onClick={() => {
                setCurrentRoute('journal');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs uppercase tracking-wider font-bold text-zinc-700 hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer group"
            >
              <span>{t('View all journal entries', 'عرض كافة المقالات')}</span>
              <ChevronRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map(art => (
              <article
                key={art.id}
                onClick={() => {
                  setCurrentRoute('journal');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group cursor-pointer bg-white border border-zinc-200/80 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col"
              >
                <div className="aspect-16/9 w-full overflow-hidden bg-zinc-100">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1 justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="text-[#C6A15B] font-semibold">
                        {(language === 'ar' && art.category_ar) ? art.category_ar : art.category}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3" />
                        {(language === 'ar' && art.read_time_ar) ? art.read_time_ar : art.read_time}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-zinc-900 group-hover:text-rose-600 transition-colors">
                      {(language === 'ar' && art.title_ar) ? art.title_ar : art.title}
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                      {(language === 'ar' && art.excerpt_ar) ? art.excerpt_ar : art.excerpt}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-rose-600">
                    <span>{t('Read Guide', 'قراءة الدليل')}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
