import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, X, ChevronRight } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { settings, language, t, setCurrentRoute } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!settings || !settings.announcement_bar_enabled || isDismissed) {
    return null;
  }

  const text = language === 'ar' && settings.announcement_bar_text_ar
    ? settings.announcement_bar_text_ar
    : settings.announcement_bar_text;

  if (!text) return null;

  return (
    <aside
      aria-label="Announcement"
      className="bg-zinc-950 text-zinc-200 text-xs py-2.5 px-4 border-b border-zinc-800/80 transition-all select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="w-6 shrink-0 hidden sm:block" /> {/* Spacer */}
        <div className="flex-1 flex items-center justify-center gap-2 text-center font-normal tracking-wide text-xs">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#C6A15B]/20 text-[#C6A15B] shrink-0">
            <Sparkles className="w-3 h-3" />
          </span>
          <span className="text-zinc-200/95 font-medium">{text}</span>
          <button
            onClick={() => setCurrentRoute('shop')}
            className="cursor-pointer hidden md:inline-flex items-center gap-1 text-[#C6A15B] hover:text-white underline underline-offset-4 text-[11px] font-semibold transition-colors"
          >
            <span>{t('Explore Boutique', 'تصفح المتجر')}</span>
            <ChevronRight className="w-3 h-3 rtl:rotate-180" />
          </button>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="cursor-pointer text-zinc-400 hover:text-white transition-colors p-1 rounded-md hover:bg-zinc-800 shrink-0"
          aria-label={t('Dismiss announcement', 'إغلاق الإعلان')}
          title={t('Dismiss announcement', 'إغلاق')}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
