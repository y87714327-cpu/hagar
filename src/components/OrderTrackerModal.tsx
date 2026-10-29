import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';
import { Search, X, PackageCheck, Truck, Clock, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';

export const OrderTrackerModal: React.FC = () => {
  const { isOrderTrackerOpen, setIsOrderTrackerOpen, language, t, formatPrice, settings } = useApp();
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOrderTrackerOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const result = await api.trackOrder(query.trim());
      setOrder(result);
    } catch (err: any) {
      setError(err.message || t('No matching order found.', 'لم يتم العثور على طلب مطابق.'));
    } finally {
      setIsLoading(false);
    }
  };

  const getStepActiveIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const steps = [
    { label: t('Order Received', 'استلام الطلب'), desc: t('Pending confirmation', 'قيد المراجعة') },
    { label: t('Confirmed', 'تم التأكيد'), desc: t('Details verified', 'تم تأكيد البيانات') },
    { label: t('Atelier Crafting', 'التجهيز بالمرسم'), desc: t('Handmade packaging', 'التنسيق والتغليف') },
    { label: t('Out for Delivery', 'مع المندوب / الشحن'), desc: t('On the way', 'في طريقها إليك') },
    { label: t('Delivered', 'تم التسليم'), desc: t('Enjoy your artwork', 'وصلتك بحب') },
  ];

  const currentStep = order ? getStepActiveIndex(order.status) : 0;

  const handleWhatsAppHelp = () => {
    const phone = settings?.whatsapp_number?.replace(/\+/g, '').replace(/\s+/g, '') || '201023456789';
    const text = encodeURIComponent(
      `Hello Hager! 🌸 I would like to ask about the delivery timeline of my order #${order?.order_number || query}.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-12 flex items-center justify-center animate-in fade-in duration-200">
      <div
        onClick={() => setIsOrderTrackerOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <PackageCheck className="w-5 h-5 text-[#C6A15B]" />
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-zinc-950">
              {t('Track Your Order', 'تتبع حالة طلبك')}
            </h3>
          </div>
          <button
            onClick={() => setIsOrderTrackerOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-xl hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input form */}
        <form onSubmit={handleTrack} className="space-y-3">
          <label className="block text-xs font-semibold text-zinc-700">
            {t('Enter your Order Number or Phone Number:', 'أدخل رقم الطلب أو رقم الهاتف المسجل به:')}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="AT-104291 or 010xxxxxxxx"
                className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-900 focus:bg-white focus:border-rose-500 focus:outline-none font-mono transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="cursor-pointer px-5 py-2.5 bg-zinc-950 text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-rose-600 transition-all disabled:opacity-50 shrink-0 shadow-xs"
            >
              {isLoading ? t('Searching...', 'جاري البحث...') : t('Track', 'تتبع')}
            </button>
          </div>
        </form>

        {/* Error notification */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Details and Visual Timeline */}
        {order && (
          <div className="space-y-6 pt-2 border-t border-zinc-100">
            {/* Summary strip */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase text-zinc-400 block font-medium">
                  {t('Order Reference', 'رقم الطلب')}
                </span>
                <span className="font-mono font-bold text-sm text-zinc-900">
                  #{order.order_number}
                </span>
                <span className="text-[11px] text-zinc-500 block mt-0.5">
                  {t('Recipient:', 'المستلم:')} {order.customer_name}
                </span>
              </div>
              <div className="text-right rtl:text-left">
                <span className="font-mono font-bold text-sm text-zinc-900 block">
                  {formatPrice(order.total_amount)}
                </span>
                <span className="text-[10px] text-zinc-400 block">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                {t('Fulfillment Progress', 'مراحل تجهيز وتوصيل الطلب')}
              </h4>

              <div className="relative pl-6 rtl:pl-0 rtl:pr-6 border-l-2 rtl:border-l-0 rtl:border-r-2 border-zinc-200 space-y-6">
                {steps.map((st, idx) => {
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <div key={idx} className="relative">
                      {/* Step Indicator Dot */}
                      <div
                        className={`absolute -left-[31px] rtl:-left-auto rtl:-right-[31px] top-0.5 w-4 h-4 rounded-full border-2 transition-all ${
                          isDone
                            ? 'bg-rose-600 border-rose-600'
                            : 'bg-white border-zinc-300'
                        }`}
                      />
                      <div>
                        <span
                          className={`text-xs font-semibold block ${
                            isCurrent ? 'text-rose-600 font-bold' : isDone ? 'text-zinc-900' : 'text-zinc-400'
                          }`}
                        >
                          {st.label}
                        </span>
                        <span className="text-[11px] text-zinc-500 block mt-0.5 font-light">
                          {st.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items summary */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <span className="text-xs font-bold text-zinc-900">
                {t('Ordered Artworks:', 'القطع المطلوبة:')}
              </span>
              <div className="space-y-1.5 text-xs text-zinc-600">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-1">
                    <span>• {it.product_name} (x{it.quantity})</span>
                    <span className="font-mono font-medium text-zinc-900">{formatPrice(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp Assistance */}
            <button
              onClick={handleWhatsAppHelp}
              className="w-full py-3 px-4 bg-[#25D366] text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-[#20ba59] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t('Inquire about this order on WhatsApp', 'استفسار عن هذا الطلب عبر واتساب')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
