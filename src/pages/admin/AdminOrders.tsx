import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { ShoppingBag, MessageCircle, Phone, MapPin, Calendar, Clock, CheckCircle2, ChevronDown, Filter } from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    if (!token) return;
    try {
      const data = await api.getAdminOrders(token);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    if (!token) return;
    try {
      const updated = await api.updateAdminOrderStatus(token, orderId, status);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const openCustomerWhatsApp = (order: Order) => {
    const phone = order.customer_phone.replace(/\+/g, '').replace(/\s+/g, '');
    const text = encodeURIComponent(
      `Hello ${order.customer_name}! 🌸 This is Hager from Artistic Touch regarding your order #${order.order_number}.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#302A2D]">
            Customer Orders & Dispatch
          </h2>
          <p className="text-xs text-[#302A2D]/60 mt-0.5">
            Review real customer orders, verify delivery details, and update tracking status.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#302A2D]/60" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-[#EBDCCF] rounded-lg py-1.5 px-3 text-xs text-[#302A2D] focus:border-[#C6A15B] focus:outline-none cursor-pointer"
          >
            <option value="all">All Orders ({orders.length})</option>
            <option value="pending">Pending Review</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing / In Atelier</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-xs text-[#302A2D]/60">
          Loading customer orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#FFFDF9] border border-dashed border-[#EBDCCF] rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-[#302A2D]">
            No Orders Yet
          </h3>
          <p className="text-xs text-[#302A2D]/60 leading-relaxed">
            When visitors complete checkout or submit orders via WhatsApp, their order records, delivery address, and requested items will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Orders List (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            {filteredOrders.map(ord => {
              const isSelected = selectedOrder?.id === ord.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`bg-[#FFFDF9] border rounded-xl p-4 transition-all cursor-pointer shadow-xs ${
                    isSelected ? 'border-[#E85D8A] ring-1 ring-[#E85D8A]' : 'border-[#EBDCCF] hover:border-[#C6A15B]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#302A2D]">
                          {ord.order_number}
                        </span>
                        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${getStatusBadge(ord.status)}`}>
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-[#302A2D] mt-1">
                        {ord.customer_name}
                      </div>
                      <div className="text-[11px] text-[#302A2D]/60 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{ord.customer_phone}</span>
                        <span>·</span>
                        <span>{ord.items.length} items</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-[#302A2D] block">
                        {ord.total_amount.toLocaleString()} {ord.currency}
                      </span>
                      <span className="text-[10px] text-[#302A2D]/50 block mt-0.5">
                        {new Date(ord.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Order Details (5 Cols) */}
          <div className="lg:col-span-5 bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl p-6 shadow-xs space-y-6 sticky top-24">
            {selectedOrder ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-[#EBDCCF]">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#302A2D]">
                      Order #{selectedOrder.order_number}
                    </h3>
                    <span className="text-[11px] text-[#302A2D]/50 font-mono">
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => openCustomerWhatsApp(selectedOrder)}
                    className="py-1.5 px-3 bg-[#25D366] text-white text-xs font-semibold rounded-lg hover:bg-[#20ba59] transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>

                {/* Status Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#302A2D]/80 mb-1">
                    Update Order Status:
                  </label>
                  <select
                    value={selectedOrder.status}
                    onChange={e => updateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                    className="w-full bg-white border border-[#EBDCCF] rounded-lg py-2 px-3 text-xs text-[#302A2D] font-medium focus:border-[#C6A15B] focus:outline-none cursor-pointer"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing in Atelier</option>
                    <option value="shipped">Shipped with Courier</option>
                    <option value="delivered">Delivered Successfully</option>
                    <option value="cancelled">Cancelled (Restore Stock)</option>
                  </select>
                </div>

                {/* Customer Details */}
                <div className="space-y-2 text-xs bg-[#FFF9F0] p-3.5 rounded-xl border border-[#EBDCCF]/70">
                  <div className="font-semibold text-[#302A2D] mb-1">Customer & Delivery:</div>
                  <div className="text-[#302A2D]/80">
                    <span className="font-medium text-[#302A2D]">Name:</span> {selectedOrder.customer_name}
                  </div>
                  <div className="text-[#302A2D]/80">
                    <span className="font-medium text-[#302A2D]">Phone:</span>{' '}
                    <a href={`tel:${selectedOrder.customer_phone}`} className="font-mono text-[#E85D8A] underline">
                      {selectedOrder.customer_phone}
                    </a>
                  </div>
                  {selectedOrder.customer_email && (
                    <div className="text-[#302A2D]/80">
                      <span className="font-medium text-[#302A2D]">Email:</span> {selectedOrder.customer_email}
                    </div>
                  )}
                  <div className="text-[#302A2D]/80">
                    <span className="font-medium text-[#302A2D]">Address:</span> {selectedOrder.customer_address}
                  </div>
                  {selectedOrder.notes && (
                    <div className="text-[#302A2D]/80 pt-1 border-t border-[#EBDCCF]/60">
                      <span className="font-medium text-[#302A2D]">Notes:</span> {selectedOrder.notes}
                    </div>
                  )}
                </div>

                {/* Items Purchased */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#302A2D]">Purchased Items:</div>
                  <div className="divide-y divide-[#EBDCCF]/60 max-h-48 overflow-y-auto">
                    {selectedOrder.items.map((it, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={it.image || '/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png'}
                            alt=""
                            className="w-8 h-8 rounded object-cover border border-[#EBDCCF]"
                          />
                          <div>
                            <span className="font-medium text-[#302A2D] block line-clamp-1">{it.product_name}</span>
                            <span className="text-[11px] text-[#302A2D]/60 font-mono">Qty: {it.quantity}</span>
                          </div>
                        </div>
                        <span className="font-mono font-semibold text-[#302A2D]">
                          {(it.price * it.quantity).toLocaleString()} {selectedOrder.currency}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#EBDCCF] flex justify-between items-baseline">
                    <span className="text-xs font-bold text-[#302A2D]">Total:</span>
                    <span className="text-base font-bold font-mono text-[#302A2D]">
                      {selectedOrder.total_amount.toLocaleString()} {selectedOrder.currency}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-xs text-[#302A2D]/50">
                Select an order from the list to view customer information and update tracking status.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
