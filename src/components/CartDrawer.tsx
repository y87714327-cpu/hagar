import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, Plus, Minus, ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartTotal,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    language,
    t,
    settings,
    formatPrice,
  } = useApp();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  if (!isCartOpen) return null;

  const handleCheckout = async (paymentMethod: 'cod' | 'whatsapp') => {
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage(t('Please enter your full name', 'يرجى إدخال الاسم بالكامل'));
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setErrorMessage(t('Please provide a valid phone number', 'يرجى كتابة رقم هاتف صالح'));
      return;
    }
    if (!customerAddress.trim()) {
      setErrorMessage(t('Please provide your delivery address', 'يرجى كتابة عنوان التوصيل'));
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await api.createOrder({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        customer_address: customerAddress,
        notes: customerNotes,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      });

      setCompletedOrder(order);
      clearCart();

      // If user chose WhatsApp checkout, open direct WhatsApp chat with details
      if (paymentMethod === 'whatsapp') {
        const phone = settings?.whatsapp_number?.replace(/\+/g, '').replace(/\s+/g, '') || '201023456789';
        const itemsList = cart.map(i => `• ${i.product_name} x${i.quantity} (${i.price * i.quantity} EGP)`).join('\n');
        const text = encodeURIComponent(
          `Hello Hager! 🌸 New Order Ref: ${order.order_number}\nName: ${customerName}\nPhone: ${customerPhone}\nAddress: ${customerAddress}\n\nItems:\n${itemsList}\n\nTotal: ${cartTotal} EGP`
        );
        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setCompletedOrder(null);
    setErrorMessage(null);
    setIsCartOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={resetAndClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 rtl:right-auto rtl:left-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white border-l rtl:border-l-0 rtl:border-r border-zinc-200 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <h2 className="font-serif text-xl font-bold text-zinc-950">
                {t('Shopping Bag', 'حقيبة التسوق')}
              </h2>
              <span className="text-xs text-zinc-400 font-mono font-medium">
                ({cart.length} {t('items', 'عناصر')})
              </span>
            </div>
            <button
              onClick={resetAndClose}
              className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors rounded-xl hover:bg-zinc-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {completedOrder ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-zinc-950">
                  {t('Order Confirmed!', 'تم استلام طلبك بنجاح!')}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-light">
                  {t('Thank you for supporting handcrafted art. Your order number is:', 'شكراً لدعمك الفن المصنوع يدوياً. رقم طلبك:')}
                </p>
                <div className="py-2 px-4 bg-zinc-50 border border-zinc-200 rounded-xl inline-block font-mono font-bold text-zinc-900 text-lg">
                  {completedOrder.order_number}
                </div>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  {t('We will contact you shortly to confirm packaging and dispatch dates.', 'سنتواصل معك قريباً لتأكيد تفاصيل التغليف وموعد الشحن.')}
                </p>

                <div className="pt-4">
                  <button
                    onClick={resetAndClose}
                    className="w-full py-3.5 px-4 bg-zinc-950 text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-black transition-colors"
                  >
                    {t('Continue Exploring', 'مواصلة التصفح')}
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-sm text-zinc-500">
                  {t('Your shopping bag is currently empty.', 'حقيبة التسوق فارغة حالياً.')}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  {t('Browse our collection →', 'تصفح منتجاتنا المميزة ←')}
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="divide-y divide-zinc-100">
                  {cart.map(item => (
                    <div key={item.product_id} className="py-3.5 flex gap-3.5 items-center">
                      <img
                        src={item.image || '/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png'}
                        alt={item.product_name}
                        className="w-16 h-16 rounded-xl object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-zinc-900 truncate">
                          {item.product_name}
                        </h4>
                        <div className="text-xs text-zinc-500 font-mono tabular-nums mt-0.5">
                          {formatPrice(item.price)}
                        </div>
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50">
                            <button
                              onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                              className="p-1 text-zinc-500 hover:text-zinc-900 transition-colors"
                              aria-label="Decrease"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-mono font-bold text-zinc-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                              className="p-1 text-zinc-500 hover:text-zinc-900 transition-colors"
                              aria-label="Increase"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="p-1 text-zinc-400 hover:text-rose-600 transition-colors ml-auto rtl:ml-0 rtl:mr-auto cursor-pointer"
                            title={t('Remove item', 'حذف العنصر')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Checkout Form */}
                <div className="pt-4 border-t border-zinc-100 space-y-3.5">
                  <h3 className="font-serif text-base font-bold text-zinc-950">
                    {t('Delivery Information', 'بيانات التوصيل والاستلام')}
                  </h3>

                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">
                        {t('Full Name *', 'الاسم بالكامل *')}
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder={t('e.g. Sarah Ahmed', 'مثال: سارة أحمد')}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-rose-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">
                        {t('Phone / WhatsApp *', 'رقم الهاتف / واتساب *')}
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder={t('010xxxxxxxx', '010xxxxxxxx')}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-rose-500 focus:outline-none font-mono transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">
                        {t('Delivery Address *', 'عنوان التوصيل بالتفصيل *')}
                      </label>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={e => setCustomerAddress(e.target.value)}
                        placeholder={t('City, Street, Building, Apartment', 'المدينة، المنطقة، اسم الشارع، رقم العمارة')}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-rose-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">
                        {t('Special Notes or Customization (Optional)', 'ملاحظات خاصة أو تخصيص (اختياري)')}
                      </label>
                      <textarea
                        rows={2}
                        value={customerNotes}
                        onChange={e => setCustomerNotes(e.target.value)}
                        placeholder={t('Gift wrapping notes, special instructions...', 'تغليف هدية، بطاقة إهداء، تعليمات تسليم...')}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-rose-500 focus:outline-none resize-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Subtotal & Action */}
          {!completedOrder && cart.length > 0 && (
            <div className="p-5 border-t border-zinc-100 bg-white space-y-3">
              <div className="flex justify-between items-baseline text-sm">
                <span className="text-zinc-500 font-medium">{t('Subtotal', 'المجموع الفرعي')}</span>
                <span className="font-bold text-zinc-950 text-lg font-mono tabular-nums">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight font-light">
                {t('Shipping fees calculated upon delivery confirmation.', 'يتم تحديد مصاريف الشحن بناءً على المحافظة عند التأكيد.')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Standard COD Order */}
                <button
                  onClick={() => handleCheckout('cod')}
                  disabled={isSubmitting}
                  className="w-full py-3 px-3 bg-zinc-950 text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <span>{isSubmitting ? t('Processing...', 'جاري الطلب...') : t('Cash on Delivery', 'الدفع عند الاستلام')}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>

                {/* Direct WhatsApp Order */}
                <button
                  onClick={() => handleCheckout('whatsapp')}
                  disabled={isSubmitting}
                  className="w-full py-3 px-3 bg-[#25D366] text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-[#20ba59] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('Order on WhatsApp', 'طلب عبر واتساب')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
