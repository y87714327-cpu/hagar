import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { CommissionRequest } from '../types';
import { Sparkles, X, CheckCircle2, ArrowRight, ArrowLeft, MessageCircle, Heart, Palette, Layers, Brush } from 'lucide-react';

export const CommissionModal: React.FC = () => {
  const { isCommissionModalOpen, setIsCommissionModalOpen, language, t, settings } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mediumType, setMediumType] = useState<CommissionRequest['medium_type']>('resin_tray');
  const [colorPalette, setColorPalette] = useState('Blush Pink & Champagne Gold');
  const [personalizationText, setPersonalizationText] = useState('');
  const [notes, setNotes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCommission, setSubmittedCommission] = useState<CommissionRequest | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isCommissionModalOpen) return null;

  const mediums = [
    {
      id: 'resin_tray',
      title: t('Botanical Pressed Resin Tray', 'صينية ريزن بالزهور الطبيعية والذهب'),
      desc: t('Preserve bridal bouquets or custom flora in hand-poured crystal resin with gold leaf.', 'تخليد باقة الورد أو زهورك المفضلة داخل ريزن نقي بحواف مذهبة.'),
      icon: Sparkles,
    },
    {
      id: 'calligraphy_journal',
      title: t('Custom Gold-Embossed Journal', 'دفتر خط عربي قطني مذهب'),
      desc: t('Hand-bound deckled edge cotton papers with customized names and quotes.', 'دفتر مصنوع يدوياً بورق قطني خام وحواف مشرشفة مع نقش أسماء بالذهب.'),
      icon: Brush,
    },
    {
      id: 'pressed_flowers_frame',
      title: t('Framed Botanical Art & Floral Seal', 'إطار زهور طبيعية مجففة وموثقة'),
      desc: t('Double-glass floating frame immortalizing wedding blooms and milestones.', 'إطار زجاجي عائم لتخليد زهور المناسبات الخاصة وتاريخ عقد القران.'),
      icon: Layers,
    },
    {
      id: 'keepsake_gift_set',
      title: t('Bespoke Bridal / Heirloom Gift Set', 'طقم هدايا ملكي وتذكارات زفاف'),
      desc: t('Coordinated tray, coasters, jewelry dish, and personalized keepsake box.', 'صينية متكاملة مع كوستر وقاعدة مجوهرات وصندوق هدايا فاخر.'),
      icon: Heart,
    },
  ];

  const palettes = [
    t('Blush Pink & Champagne Gold', 'وردي ناعم مع ذهب الشمبانيا'),
    t('Botanical Sage & Pure Ivory', 'أخضر ميرمية هادئ وعاجي طبيعي'),
    t('Deep Mauve & Lavender Petals', 'موف داكن مع بتلات اللافندر'),
    t('Classic Monochrome & Gold Leaf', 'أبيض وأسود كلاسيكي مع ورق الذهب'),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg(t('Please enter your name.', 'يرجى إدخال اسمك.'));
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setErrorMsg(t('Please provide a valid phone or WhatsApp number.', 'يرجى كتابة رقم هاتف أو واتساب صالح.'));
      return;
    }

    setIsSubmitting(true);
    try {
      const comm = await api.submitCommission({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        medium_type: mediumType,
        color_palette: colorPalette,
        personalization_text: personalizationText,
        notes,
      });

      setSubmittedCommission(comm);

      // Open WhatsApp with prefilled custom commission specs
      const phone = settings?.whatsapp_number?.replace(/\+/g, '').replace(/\s+/g, '') || '201023456789';
      const msg = encodeURIComponent(
        `Hello Hager! 🌸 I submitted a Bespoke Commission Request #${comm.request_number} on Artistic Touch:\n\n` +
        `• Name: ${comm.customer_name}\n` +
        `• Medium: ${comm.medium_type.replace('_', ' ').toUpperCase()}\n` +
        `• Color Palette: ${comm.color_palette}\n` +
        `${comm.personalization_text ? `• Inscription/Names: "${comm.personalization_text}"\n` : ''}` +
        `${comm.notes ? `• Special Notes: ${comm.notes}\n` : ''}` +
        `Looking forward to crafting this beautiful piece with you!`
      );

      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    } catch (err: any) {
      setErrorMsg(err.message || t('Failed to submit commission request.', 'فشل في إرسال طلب التفصيل.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSubmittedCommission(null);
    setStep(1);
    setIsCommissionModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-12 flex items-center justify-center animate-in fade-in duration-200">
      <div
        onClick={resetAndClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="relative w-full max-w-xl bg-white border border-zinc-200 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#C6A15B]" />
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-zinc-950">
              {t('Atelier Bespoke Commission Studio', 'استوديو الطلبات الفنية الخاصة')}
            </h3>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-xl hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedCommission ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-2xl font-bold text-zinc-950">
              {t('Bespoke Request Received!', 'تم استلام طلبك الخاص بنجاح!')}
            </h4>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-md mx-auto font-light">
              {t(
                'Hager has received your custom commission specifications. Reference Number:',
                'وصلت تفاصيل طلبك إلى الفنانة هاجر مباشرة بالمرسم. رقم المرجع الخاص بك:'
              )}
            </p>
            <div className="py-2.5 px-4 bg-zinc-50 border border-zinc-200 rounded-xl inline-block font-mono font-bold text-zinc-900 text-base">
              {submittedCommission.request_number}
            </div>
            <p className="text-xs text-zinc-500">
              {t('We will chat with you on WhatsApp shortly to confirm flower selection and estimated crafting schedule.', 'سنتواصل معك عبر واتساب قريباً لتأكيد اختيار الزهور وموعد التسليم.')}
            </p>
            <div className="pt-4">
              <button
                onClick={resetAndClose}
                className="w-full py-3.5 bg-zinc-950 text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-black transition-colors cursor-pointer"
              >
                {t('Done', 'إغلاق ومواصلة التصفح')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step navigation dots */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs text-zinc-400 font-medium">
              <span className={`px-2.5 py-1 rounded-lg ${step === 1 ? 'bg-zinc-950 text-white font-bold' : 'bg-zinc-100 text-zinc-600'}`}>
                1. {t('Art Medium', 'نوع العمل')}
              </span>
              <span>→</span>
              <span className={`px-2.5 py-1 rounded-lg ${step === 2 ? 'bg-zinc-950 text-white font-bold' : 'bg-zinc-100 text-zinc-600'}`}>
                2. {t('Aesthetics & Names', 'التخصيص والألوان')}
              </span>
              <span>→</span>
              <span className={`px-2.5 py-1 rounded-lg ${step === 3 ? 'bg-zinc-950 text-white font-bold' : 'bg-zinc-100 text-zinc-600'}`}>
                3. {t('Your Contact', 'بيانات التواصل')}
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            {/* Step 1: Medium Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-600">
                  {t('Choose the handcrafted art medium you would like Hager to create for you:', 'اختر نوع القطعة الفنية التي تود أن تصنعها لك هاجر خصيصاً:')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mediums.map(med => {
                    const Icon = med.icon;
                    const isSelected = mediumType === med.id;
                    return (
                      <div
                        key={med.id}
                        onClick={() => setMediumType(med.id as any)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-rose-50/50 border-rose-500 shadow-xs ring-1 ring-rose-500/20'
                            : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-rose-600' : 'text-[#C6A15B]'}`} />
                          <h4 className="font-serif font-bold text-sm text-zinc-900">
                            {med.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-light">
                          {med.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="py-3 px-6 bg-zinc-950 text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{t('Next: Customize Details', 'التالي: خيارات التخصيص')}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Aesthetics, Colors & Personalization */}
            {step === 2 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-zinc-800 mb-1.5">
                    {t('Select Color Palette:', 'لوحة الألوان المفضلة:')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {palettes.map((pal, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setColorPalette(pal)}
                        className={`p-2.5 rounded-xl border text-left rtl:text-right text-xs transition-colors cursor-pointer ${
                          colorPalette === pal
                            ? 'bg-zinc-950 text-white font-semibold border-zinc-950'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        {pal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-800 mb-1">
                    {t('Names, Inscription, or Special Date to Emboss in Gold:', 'الاسم، العبارة، أو تاريخ المناسبة للكتابة المذهبة:')}
                  </label>
                  <input
                    type="text"
                    value={personalizationText}
                    onChange={e => setPersonalizationText(e.target.value)}
                    placeholder={t('e.g. Ahmed & Sarah · 24.08.2026', 'مثال: أحمد وسارة · ٢٤-٠٨-٢٠٢٦')}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:border-rose-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-800 mb-1">
                    {t('Special Dimensions or Specific Flower Notes:', 'ملاحظات إضافية حول المقاس أو نوع الزهور المرغوبة:')}
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder={t('Tell Hager about your vision, room decor, or if you will provide fresh wedding flowers...', 'حدثي هاجر عن تخيلك للقطعة، أو إذا كنتِ ستقومين بإرسال زهور زفافك الطبيعية لتجفيفها...')}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:border-rose-500 focus:outline-none resize-none transition-all"
                  />
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    onClick={() => setStep(1)}
                    className="py-2.5 px-4 border border-zinc-200 text-zinc-700 text-xs rounded-xl hover:bg-zinc-100 cursor-pointer flex items-center gap-1 font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                    <span>{t('Back', 'السابق')}</span>
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="py-3 px-6 bg-zinc-950 text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{t('Next: Your Contact Info', 'التالي: بيانات التواصل')}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Contact & Submit */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-zinc-800 mb-1">
                    {t('Your Full Name *', 'الاسم بالكامل *')}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    required
                    placeholder={t('Sarah Ahmed', 'سارة أحمد')}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:border-rose-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-800 mb-1">
                    {t('Phone / WhatsApp Number *', 'رقم الهاتف / الواتساب *')}
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    required
                    placeholder="010xxxxxxxx"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:border-rose-500 focus:outline-none font-mono transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-800 mb-1">
                    {t('Email Address (Optional)', 'البريد الإلكتروني (اختياري)')}
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:border-rose-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 text-[11px] text-zinc-600 space-y-1">
                  <div><strong>{t('Chosen Medium:', 'النوع المختار:')}</strong> {mediumType.replace('_', ' ')}</div>
                  <div><strong>{t('Palette:', 'الألوان:')}</strong> {colorPalette}</div>
                  {personalizationText && <div><strong>{t('Text:', 'الكتابة:')}</strong> "{personalizationText}"</div>}
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="py-2.5 px-4 border border-zinc-200 text-zinc-700 text-xs rounded-xl hover:bg-zinc-100 cursor-pointer flex items-center gap-1 font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                    <span>{t('Back', 'السابق')}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-3 px-6 bg-[#25D366] text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-[#20ba59] transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{isSubmitting ? t('Sending...', 'جاري الإرسال...') : t('Submit & Chat with Hager on WhatsApp', 'إرسال ومتابعة الطلب مع هاجر')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
