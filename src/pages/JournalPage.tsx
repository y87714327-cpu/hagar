import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { JournalArticle } from '../types';
import { api } from '../services/api';
import { BookOpen, Sparkles, Clock, ArrowRight, Share2, Heart, MessageCircle } from 'lucide-react';

export const JournalPage: React.FC = () => {
  const { language, t, settings, setIsCommissionModalOpen } = useApp();
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<JournalArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadJournal = async () => {
      try {
        const data = await api.getJournalArticles();
        setArticles(data);
      } catch (err) {
        console.error('Failed to load journal articles:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadJournal();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-zinc-200 rounded-full shadow-xs">
          <BookOpen className="w-4 h-4 text-[#C6A15B]" />
          <span className="text-[11px] uppercase tracking-widest text-zinc-900 font-bold">
            {t('Behind the Easel · Atelier Journal', 'كواليس المرسم · مدونة الحرفة')}
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-950 tracking-tight leading-tight">
          {t('Craft Stories, Botanical Secrets & Care Guides', 'حكايات فنية، أسرار الزهور، وإرشادات العناية')}
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-light">
          {t(
            'Explore the techniques, materials, and delicate steps behind each handmade creation by artist Hager.',
            'اكتشفوا التقنيات، والخامات الأصيلة، والخطوات الدقيقة وراء كل قطعة تصنعها الفنانة هاجر بالمرسم.'
          )}
        </p>
      </div>

      {/* Selected Article Full View Modal / Inline */}
      {selectedArticle && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <span className="text-xs uppercase tracking-widest text-rose-600 font-bold">
              {(language === 'ar' && selectedArticle.category_ar) ? selectedArticle.category_ar : selectedArticle.category}
            </span>
            <button
              onClick={() => setSelectedArticle(null)}
              className="text-xs text-zinc-500 hover:text-zinc-900 underline font-medium cursor-pointer"
            >
              {t('← Back to all stories', '← العودة لكافة المقالات')}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 text-left rtl:text-right">
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-zinc-950 leading-snug">
                {(language === 'ar' && selectedArticle.title_ar) ? selectedArticle.title_ar : selectedArticle.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#C6A15B]" />
                  <span>{(language === 'ar' && selectedArticle.read_time_ar) ? selectedArticle.read_time_ar : selectedArticle.read_time}</span>
                </span>
                <span>·</span>
                <span className="font-medium">Artistic Touch Atelier #Hager</span>
              </div>
              <div className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line space-y-3 pt-2 font-light">
                {(language === 'ar' && selectedArticle.content_ar) ? selectedArticle.content_ar : selectedArticle.content}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-zinc-200 shadow-md bg-zinc-100 aspect-4/3">
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-zinc-500">
          {t('Loading atelier journal...', 'جاري تحميل مقالات المرسم...')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map(art => (
            <div
              key={art.id}
              onClick={() => {
                setSelectedArticle(art);
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="aspect-16/9 overflow-hidden bg-zinc-100">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  />
                </div>
                <div className="p-6 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-[#C6A15B] font-bold uppercase tracking-wider">
                    <span>{(language === 'ar' && art.category_ar) ? art.category_ar : art.category}</span>
                    <span className="text-zinc-400 font-normal lowercase font-sans">
                      {(language === 'ar' && art.read_time_ar) ? art.read_time_ar : art.read_time}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-zinc-950 group-hover:text-rose-600 transition-colors leading-snug">
                    {(language === 'ar' && art.title_ar) ? art.title_ar : art.title}
                  </h3>
                  <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed font-light">
                    {(language === 'ar' && art.excerpt_ar) ? art.excerpt_ar : art.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center gap-1.5 text-xs font-bold text-rose-600">
                <span>{t('Read guide', 'قراءة الدليل')}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Commission Callout Banner */}
      <div className="rounded-3xl bg-zinc-950 text-white border border-zinc-800 p-8 sm:p-12 text-center space-y-4 shadow-xl">
        <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white">
          {t('Want your wedding flowers or bridal bouquet preserved?', 'هل ترغبين بحفظ باقة زهور زفافك أو مناسبتك الخاصة؟')}
        </h3>
        <p className="text-sm text-zinc-300 max-w-lg mx-auto leading-relaxed font-light">
          {t(
            'Bring your cherished blossoms to our Cairo atelier. Hager will personally dry, frame, and seal them into heirloom keepsakes.',
            'أرسلي زهورك المفضلة لمرسم هاجر بالقاهرة، وسنقوم بتجفيفها وتخليدها داخل صواني ريزن فاخرة أو إطارات مذهبة.'
          )}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => setIsCommissionModalOpen(true)}
            className="py-3.5 px-6 bg-rose-600 text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-rose-500 transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#C6A15B]" />
            <span>{t('Start Bespoke Commission', 'بدء طلب التفصيل الخاص')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
