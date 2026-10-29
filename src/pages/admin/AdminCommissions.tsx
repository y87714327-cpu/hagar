import React, { useState, useEffect } from 'react';
import { CommissionRequest } from '../../types';
import { api } from '../../services/api';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  Sparkles,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Palette,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export const AdminCommissions: React.FC = () => {
  const { token } = useAdminAuth();
  const [commissions, setCommissions] = useState<CommissionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCommissions = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAdminCommissions(token);
      setCommissions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load commissions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, [token]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!token) return;
    setUpdatingId(id);
    try {
      const updated = await api.updateAdminCommissionStatus(token, id, newStatus);
      setCommissions(prev => prev.map(c => (c.id === id ? updated : c)));
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: CommissionRequest['status']) => {
    switch (status) {
      case 'new':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md">
            New Inquiry
          </span>
        );
      case 'contacted':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200/60 rounded-md">
            Client Contacted
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-1 bg-[#E85D8A]/10 text-[#E85D8A] border border-[#E85D8A]/20 rounded-md">
            In Crafting
          </span>
        );
      case 'completed':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md">
            Completed & Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200/60 rounded-md">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-md">
            {status}
          </span>
        );
    }
  };

  const filtered = commissions.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customer_phone.includes(searchQuery) ||
      c.medium_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.color_palette.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const newCount = commissions.filter(c => c.status === 'new').length;
  const inProgressCount = commissions.filter(c => c.status === 'in_progress').length;
  const completedCount = commissions.filter(c => c.status === 'completed').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#EBDCCF]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#302A2D]">
              Bespoke Atelier Commissions
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 bg-[#E85D8A]/10 text-[#E85D8A] rounded-full font-bold">
              {commissions.length}
            </span>
          </div>
          <p className="text-xs text-[#302A2D]/60 mt-1">
            Custom artwork, wedding flower preservation, and calligraphy inquiries submitted by clients.
          </p>
        </div>

        <button
          onClick={fetchCommissions}
          disabled={isLoading}
          className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium border border-[#EBDCCF] rounded-lg hover:bg-[#FFFDF9] text-[#302A2D]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#FFFDF9] border border-[#EBDCCF] rounded-xl">
          <span className="text-[11px] font-semibold text-[#302A2D]/60 block uppercase tracking-wider">
            Total Requests
          </span>
          <span className="text-2xl font-bold font-mono text-[#302A2D] mt-1 block">
            {commissions.length}
          </span>
        </div>
        <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-xl">
          <span className="text-[11px] font-semibold text-amber-700 block uppercase tracking-wider">
            New Inquiries
          </span>
          <span className="text-2xl font-bold font-mono text-amber-800 mt-1 block">
            {newCount}
          </span>
        </div>
        <div className="p-4 bg-[#E85D8A]/5 border border-[#E85D8A]/20 rounded-xl">
          <span className="text-[11px] font-semibold text-[#E85D8A] block uppercase tracking-wider">
            In Crafting
          </span>
          <span className="text-2xl font-bold font-mono text-[#E85D8A] mt-1 block">
            {inProgressCount}
          </span>
        </div>
        <div className="p-4 bg-emerald-50/50 border border-emerald-200/60 rounded-xl">
          <span className="text-[11px] font-semibold text-emerald-700 block uppercase tracking-wider">
            Completed
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-800 mt-1 block">
            {completedCount}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#302A2D]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, medium, or palette..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#FFFDF9] border border-[#EBDCCF] rounded-lg focus:outline-none focus:border-[#E85D8A]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'new', label: 'New' },
            { id: 'contacted', label: 'Contacted' },
            { id: 'in_progress', label: 'In Crafting' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`cursor-pointer px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === filter.id
                  ? 'bg-[#302A2D] text-[#FFF9F0]'
                  : 'bg-[#FFFDF9] text-[#302A2D]/70 border border-[#EBDCCF] hover:bg-black/5'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Commissions List */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-[#302A2D]/60 bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl">
          Loading atelier commissions...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl space-y-3">
          <Sparkles className="w-10 h-10 text-[#C6A15B] mx-auto opacity-70" />
          <h3 className="font-serif text-lg font-bold text-[#302A2D]">
            No Commission Requests Found
          </h3>
          <p className="text-xs text-[#302A2D]/60 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'No requests match your current filters.'
              : 'Clients can submit bespoke requests from the "Bespoke Commissions" button on the storefront.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(c => {
            const cleanPhone = c.customer_phone.replace(/\D/g, '');
            const whatsappMsg = encodeURIComponent(
              `Hello ${c.customer_name}! 🌸 This is Hager from Artistic Touch #Hager. I received your bespoke request for "${c.medium_type}" (Palette: ${c.color_palette}). Let's discuss your custom piece!`
            );
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMsg}`;

            return (
              <div
                key={c.id}
                className="bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#C6A15B] transition-colors space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EBDCCF]/70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF9F0] border border-[#C6A15B]/40 flex items-center justify-center font-serif text-base font-bold text-[#A85A83]">
                      {c.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-[#302A2D]">
                        {c.customer_name}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-[#302A2D]/60 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(c.created_at).toLocaleDateString()} at{' '}
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[#A85A83]">ID: {c.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(c.status)}

                    <select
                      value={c.status}
                      disabled={updatingId === c.id}
                      onChange={e => handleStatusChange(c.id, e.target.value)}
                      className="cursor-pointer text-xs bg-white border border-[#EBDCCF] rounded-lg px-2.5 py-1 text-[#302A2D] font-medium focus:outline-none focus:border-[#E85D8A]"
                    >
                      <option value="new">New Inquiry</option>
                      <option value="contacted">Contacted</option>
                      <option value="in_progress">In Crafting</option>
                      <option value="completed">Completed & Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-[#FFF9F0] rounded-xl border border-[#EBDCCF]/60">
                    <span className="text-[11px] text-[#302A2D]/60 block font-medium uppercase tracking-wider">
                      Medium & Technique
                    </span>
                    <span className="font-semibold text-[#302A2D] mt-1 block">
                      {c.medium_type}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FFF9F0] rounded-xl border border-[#EBDCCF]/60">
                    <span className="text-[11px] text-[#302A2D]/60 block font-medium uppercase tracking-wider">
                      Color Palette & Aesthetic
                    </span>
                    <span className="font-semibold text-[#302A2D] mt-1 block">
                      {c.color_palette}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FFF9F0] rounded-xl border border-[#EBDCCF]/60">
                    <span className="text-[11px] text-[#302A2D]/60 block font-medium uppercase tracking-wider">
                      Personalization / Calligraphy
                    </span>
                    <span className="font-semibold text-[#302A2D] mt-1 block">
                      {c.personalization_text || '—'}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FFF9F0] rounded-xl border border-[#EBDCCF]/60">
                    <span className="text-[11px] text-[#302A2D]/60 block font-medium uppercase tracking-wider">
                      Customer Contact
                    </span>
                    <div className="mt-1 space-y-0.5">
                      <div className="font-mono font-medium text-[#302A2D]">
                        {c.customer_phone}
                      </div>
                      {c.customer_email && (
                        <div className="text-[11px] text-[#302A2D]/70 truncate">
                          {c.customer_email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                {c.notes && (
                  <div className="p-3 bg-neutral-50 rounded-xl border border-[#EBDCCF]/50 text-xs text-[#302A2D]/80">
                    <span className="font-medium text-[#302A2D] block mb-1">
                      Client Description / Vision:
                    </span>
                    <p className="italic leading-relaxed">"{c.notes}"</p>
                  </div>
                )}

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <a
                    href={`tel:${c.customer_phone}`}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#EBDCCF] text-[#302A2D] rounded-lg hover:bg-black/5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Client</span>
                  </a>

                  {c.customer_email && (
                    <a
                      href={`mailto:${c.customer_email}?subject=Artistic Touch Commission Inquiry (${c.id})`}
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#EBDCCF] text-[#302A2D] rounded-lg hover:bg-black/5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Client</span>
                    </a>
                  )}

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-[#25D366] text-white rounded-lg hover:bg-[#20ba59] shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Client</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
