import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { language, t, settings } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg(t('Please enter your name', 'يرجى إدخال الاسم'));
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg(t('Please provide a valid email address', 'يرجى إدخال بريد إلكتروني صحيح'));
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setErrorMsg(t('Please enter a message with at least 10 characters', 'يرجى كتابة رسالة توضيحية من 10 أحرف على الأقل'));
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await api.sendContactMessage({
        name,
        email,
        phone,
        message,
      });
      setSuccessMsg(resp);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || t('Failed to send your inquiry. Please try again.', 'حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappLink = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\+/g, '').replace(/\s+/g, '')}?text=${encodeURIComponent(
        t('Hello Hager! I am reaching out through the Artistic Touch website.', 'مرحباً هاجر، أتواصل معكِ من خلال موقع آرتيستك تاتش.')
      )}`
    : '#';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600">
          {t('Get in Touch', 'تواصل معنا')}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-950 tracking-tight">
          {t('Connect with the Atelier', 'تواصل مع مرسم هاجر')}
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-light">
          {t(
            'Whether inquiring about our current collection or discussing a commissioned masterpiece, we would love to hear from you.',
            'سواء كان استفساراً عن المجموعات المتاحة أو طلباً مخصصاً لقطعة فنية، نسعد بتواصلكم معنا.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Contact Info & WhatsApp (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <h3 className="font-serif text-xl font-bold text-zinc-950">
              {t('Studio Details', 'بيانات التواصل المباشر')}
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-700">
              {settings?.contact_phone && (
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 text-[#C6A15B]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] text-zinc-400 uppercase tracking-wide font-medium">
                      {t('Phone', 'الهاتف')}
                    </span>
                    <a href={`tel:${settings.contact_phone}`} className="font-mono font-semibold hover:text-rose-600 transition-colors">
                      {settings.contact_phone}
                    </a>
                  </div>
                </div>
              )}

              {settings?.contact_email && (
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 text-[#C6A15B]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] text-zinc-400 uppercase tracking-wide font-medium">
                      {t('Email', 'البريد الإلكتروني')}
                    </span>
                    <a href={`mailto:${settings.contact_email}`} className="font-medium hover:text-rose-600 transition-colors">
                      {settings.contact_email}
                    </a>
                  </div>
                </div>
              )}

              {settings?.contact_address && (
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 text-[#C6A15B]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] text-zinc-400 uppercase tracking-wide font-medium">
                      {t('Location', 'المقر')}
                    </span>
                    <span className="font-medium text-zinc-800">{settings.contact_address}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Direct WhatsApp Callout */}
            {settings?.whatsapp_number && (
              <div className="pt-4 border-t border-zinc-100">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-[#25D366] text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-[#20ba59] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('Chat Directly via WhatsApp', 'محادثة فورية عبر واتساب')}</span>
                </a>
                <p className="text-[11px] text-zinc-500 text-center mt-2.5">
                  {t('Fastest response for inquiries & custom gifts', 'أسرع طريقة للتواصل والاستفسار عن الهدايا الخاصة')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Contact Form (7 Cols) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-10 space-y-5 shadow-xs"
          >
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-zinc-950">
              {t('Send an Inquiry', 'أرسل استفسارك أو طلبك')}
            </h3>

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700">
                  {t('Your Name *', 'الاسم بالكامل *')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('Sarah Ahmed', 'سارة أحمد')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-900 focus:bg-white focus:border-rose-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700">
                  {t('Email Address *', 'البريد الإلكتروني *')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-900 focus:bg-white focus:border-rose-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700">
                {t('Phone or WhatsApp Number (Optional)', 'رقم الهاتف أو الواتساب (اختياري)')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="010xxxxxxxx"
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-900 focus:bg-white focus:border-rose-500 focus:outline-none transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700">
                {t('Your Message or Request Details *', 'تفاصيل الاستفسار أو الطلب *')}
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={t(
                  'Tell us about the piece you want, preferred colors, floral choices, or delivery timing...',
                  'حدثينا عن القطعة المطلوبة، الألوان المفضلة، نوع الزهور أو موعد المناسبة...'
                )}
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-900 focus:bg-white focus:border-rose-500 focus:outline-none resize-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer w-full py-3.5 px-6 bg-zinc-950 text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-rose-500/20 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? t('Sending Message...', 'جاري الإرسال...') : t('Send Inquiry', 'إرسال الاستفسار')}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
