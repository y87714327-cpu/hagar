import React from 'react';
import { useApp } from '../context/AppContext';
import { Palette, Heart, Feather, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { language, t, settings, setCurrentRoute, setIsCommissionModalOpen } = useApp();

  const brandStory = (language === 'ar' && settings?.brand_story_ar)
    ? settings.brand_story_ar
    : settings?.brand_story;

  const philosophy = (language === 'ar' && settings?.about_philosophy_ar)
    ? settings.about_philosophy_ar
    : settings?.about_philosophy || 'We believe art is not merely an object, but a tangible feeling. Each brushstroke, pressed bloom, and gold flake is applied by hand with intention and heart.';

  const whatsappLink = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\+/g, '').replace(/\s+/g, '')}`
    : '#';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-20">
      {/* Hero Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <button
          onClick={() => setCurrentRoute('home')}
          className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-zinc-200 rounded-full shadow-xs hover:border-[#C6A15B] transition-colors"
          title={t('Return to home page', 'العودة إلى الصفحة الرئيسية')}
        >
          <img
            src="/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png"
            alt="Logo"
            className="w-6 h-6 rounded-full border border-[#C6A15B]/50"
          />
          <span className="text-xs uppercase tracking-widest text-zinc-900 font-bold">
            {t('The Atelier Story', 'قصة المرسم')}
          </span>
        </button>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-950 tracking-tight leading-tight">
          {t('Artistic Touch by #Hager', 'آرتيستك تاتش بأنامل #هاجر')}
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-light">
          {t(
            'A creative sanctuary where raw elements meet gold leaf and timeless handcrafted beauty.',
            'مساحة إبداعية تلتقي فيها الزهور الطبيعية مع لمسات الذهب والحرفية اليدوية الراقية.'
          )}
        </p>
      </div>

      {/* Main Editorial Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6 text-left rtl:text-right">
          <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 block">
            {t('Our Origins', 'البدايات والشغف')}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-950 leading-tight">
            {t('Every creation has a story, and every detail matters.', 'كل لمسة فنية وراها حكاية، ولكل تفصيلة قيمة.')}
          </h2>
          <div className="space-y-4 text-base text-zinc-600 leading-relaxed font-light">
            <p>{brandStory}</p>
            <p>{philosophy}</p>
          </div>

          <div className="pt-4 grid grid-cols-2 gap-6 border-t border-zinc-200 text-xs">
            <div>
              <span className="font-bold text-zinc-900 block mb-1">
                {t('Botanical Preservation', 'حفظ الزهور الطبيعية')}
              </span>
              <p className="text-zinc-500 leading-relaxed font-light">
                {t('Petals pressed at peak bloom to preserve delicate veins and vivid pigment.', 'تجفيف البتلات في أبهى مراحل تفتحها للحفاظ على حيوية اللون والتفاصيل.')}
              </p>
            </div>
            <div>
              <span className="font-bold text-zinc-900 block mb-1">
                {t('Bespoke Gold Finishing', 'تطعيم ذهبي يدوي')}
              </span>
              <p className="text-zinc-500 leading-relaxed font-light">
                {t('Champagne gold leaf edges and signatures that elevate every bespoke piece.', 'حواف مذهبة بذهب الشمبانيا وبصمة فنية تمنح كل قطعة رونقاً خاصاً.')}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative">
          <div className="relative rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl bg-white aspect-4/3">
            <img
              src="/src/assets/images/artist_studio_craft_1793303319329.jpg"
              alt="Hager working on watercolors"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png';
              }}
            />
          </div>
        </div>
      </div>

      {/* Visual Inspiration Studio Grid */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600">
            {t('Visual Inspiration', 'إلهام بصري من المرسم')}
          </span>
          <h2 className="font-serif text-3xl font-bold text-zinc-950">
            {t('Atelier Glimpses & Fine Details', 'لقطات من كواليس الصنع')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-white aspect-4/3 shadow-xs">
            <img
              src="/src/assets/images/hero_artist_atelier_1793303316706.jpg"
              alt="Artistic Atelier"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-white aspect-4/3 shadow-xs">
            <img
              src="/src/assets/images/handmade_resin_decor_1793303318148.jpg"
              alt="Resin floral tray"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-white aspect-4/3 shadow-xs">
            <img
              src="/src/assets/images/artistic_stationery_set_1793303318911.jpg"
              alt="Handmade stationery"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* Contact Callout */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
        <h3 className="font-serif text-2xl sm:text-4xl font-bold text-zinc-950">
          {t('Have a creative idea or special gift request?', 'هل لديكم فكرة عمل فني أو هدية خاصة؟')}
        </h3>
        <p className="text-sm sm:text-base text-zinc-600 max-w-lg mx-auto leading-relaxed font-light">
          {t('Hager welcomes custom commissions, bridal bouquet preservation, and personalized calligraphy gifts.', 'تسعد هاجر باستقبال طلبات التنسيق الخاص، وحفظ باقات الزفاف، وتذكارات الخط العربي المخصصة.')}
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setIsCommissionModalOpen(true)}
            className="cursor-pointer py-3.5 px-6 bg-rose-600 text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-rose-500 transition-all shadow-md"
          >
            {t('Start Custom Commission', 'بدء طلب مخصص')}
          </button>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3.5 px-6 bg-[#25D366] text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-[#20ba59] transition-colors flex items-center gap-2 shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t('Chat with Hager', 'تحدث مع هاجر مباشرة')}</span>
          </a>
          <button
            onClick={() => setCurrentRoute('shop')}
            className="cursor-pointer py-3.5 px-6 bg-zinc-900 text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-black transition-colors"
          >
            {t('Shop the Collection', 'تسوق المعروضات')}
          </button>
        </div>
      </div>
    </div>
  );
};
