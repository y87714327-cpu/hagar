import React from 'react';
import { useApp } from '../context/AppContext';
import { Instagram, Facebook, Phone, Mail, MapPin, MessageCircle, Heart, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, language, t, setCurrentRoute } = useApp();

  const whatsappLink = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\+/g, '').replace(/\s+/g, '')}`
    : '#';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800/80 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Col 1: Brand Info & Official Badge */}
          <div className="space-y-4">
            <button
              onClick={() => {
                setCurrentRoute('home');
                scrollToTop();
              }}
              className="flex items-center gap-3.5 text-start group cursor-pointer focus-visible:outline-none"
              title={t('Return to home page', 'العودة إلى الصفحة الرئيسية')}
              aria-label={t('Return to home page', 'العودة إلى الصفحة الرئيسية')}
            >
              <img
                src="/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png"
                alt="Artistic Touch #Hager"
                className="w-12 h-12 rounded-full border-2 border-[#C6A15B]/60 object-cover shadow-sm group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="font-serif text-xl font-bold tracking-tight text-white block group-hover:text-rose-400 transition-colors">
                  Artistic Touch
                </span>
                <span className="text-xs font-script font-semibold text-rose-400 block">
                  #Hager
                </span>
              </div>
            </button>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm font-light">
              {(language === 'ar' && settings?.brand_story_ar)
                ? settings.brand_story_ar
                : settings?.brand_story || 'Every creation has a story. Handcrafted botanical art, fine supplies, and timeless bespoke keepsakes made with love in Cairo.'}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-2">
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-rose-600 hover:text-white transition-all text-zinc-400"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-rose-600 hover:text-white transition-all text-zinc-400"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.whatsapp_number && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-[#25D366] hover:text-white transition-all text-zinc-400"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold tracking-wider uppercase text-[#C6A15B]">
              {t('Navigation', 'أقسام الموقع')}
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <button
                  onClick={() => {
                    setCurrentRoute('home');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('Home Page', 'الصفحة الرئيسية')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentRoute('shop');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('Shop All Collections', 'تسوق جميع المجموعات')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentRoute('categories');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('Art Categories', 'التصنيفات الفنية')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentRoute('journal');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('Atelier Journal & Care', 'يوميات المرسم والعناية')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentRoute('about');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('About the Artist (#Hager)', 'عن الفنانة (#هاجر)')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentRoute('contact');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('Contact & Bespoke Inquiries', 'التواصل والطلبات الخاصة')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Atelier Details */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold tracking-wider uppercase text-[#C6A15B]">
              {t('Studio & Inquiries', 'المرسم والتواصل')}
            </h4>
            <div className="space-y-3 text-xs text-zinc-400">
              {settings?.contact_phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-3.5 h-3.5 text-[#C6A15B] shrink-0" />
                  <span className="font-mono">{settings.contact_phone}</span>
                </div>
              )}
              {settings?.contact_email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-3.5 h-3.5 text-[#C6A15B] shrink-0" />
                  <span>{settings.contact_email}</span>
                </div>
              )}
              {settings?.contact_address && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C6A15B] shrink-0" />
                  <span>{settings.contact_address}</span>
                </div>
              )}
              {settings?.whatsapp_number && (
                <div className="pt-2">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#25D366] hover:underline"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t('Chat directly on WhatsApp', 'محادثة مباشرة عبر واتساب')}</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Col 4: Artisanal Commitment */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold tracking-wider uppercase text-[#C6A15B]">
              {t('Handmade Promise', 'وعد الحرفية اليدوية')}
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              {t(
                'Each piece from Artistic Touch is hand-poured, hand-bound, or carefully selected. No mass-produced imitations.',
                'كل قطعة فنية من آرتيستك تاتش تُصنع أو تُختار بعناية فائقة. لا نعتمد على المنتجات التجارية المكررة.'
              )}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-rose-400 font-medium">
              <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
              <span>{t('Handcrafted with care by #Hager', 'صُنع بحب وإتقان بأنامل #هاجر')}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © {new Date().getFullYear()} Artistic Touch #Hager. {t('All rights reserved.', 'جميع الحقوق محفوظة.')}
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setCurrentRoute('about');
                scrollToTop();
              }}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              {t('Craft Philosophy', 'فلسفة الصنع')}
            </button>
            <button
              onClick={() => {
                setCurrentRoute('contact');
                scrollToTop();
              }}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              {t('Custom Orders', 'طلبات خاصة')}
            </button>
            <button
              onClick={() => {
                setCurrentRoute('admin');
                scrollToTop();
              }}
              className="hover:text-[#C6A15B] transition-colors cursor-pointer"
            >
              {t('Admin Area', 'لوحة الإدارة')}
            </button>
            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Scroll to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
