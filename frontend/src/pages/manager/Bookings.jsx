import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchManagerBookings } from '../../store/slices/managerSlice';
import { api } from '../../context/AuthContext';
import { 
  Search,
  Filter,
  Calendar,
  User,
  CreditCard,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Loader2,
  FileText,
  ClipboardList
} from 'lucide-react';

const Bookings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookings, loading } = useSelector((state) => state.manager);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    dispatch(fetchManagerBookings());
  }, [dispatch]);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.put(`/manager/bookings/${id}/status`, { status: newStatus });
      dispatch(fetchManagerBookings());
    } catch (error) {
      alert('Error updating booking status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRefund = async (id) => {
    if (!window.confirm("Initialize refund protocol for this settlement? Funds will be returned via the Navan Secure Gateway.")) return;
    setUpdatingId(id);
    try {
      await api.post(`/payments/refund/${id}`);
      dispatch(fetchManagerBookings());
      alert('Refund successfully authorized.');
    } catch (error) {
      alert(error.response?.data?.message || 'Refund authorization failed.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      (booking.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.hotelId?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };
// ... (rest of the code update truncated for brevity, but I will include the full replacement below)

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'text-emerald-600';
      case 'Refunded': return 'text-orange-600';
      default: return 'text-amber-600';
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 font-sans">
      <header className="mb-12">
        <h1 className="text-4xl font-serif font-black text-white tracking-tighter uppercase italic">Reservation Folio</h1>
        <div className="h-1.5 w-24 bg-gold-500 mt-4 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]"></div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-6">Registry audit: tracking active customer deployments and settlements.</p>
      </header>

      {/* Filters & Search */}
      <div className="bg-[#111114] p-6 rounded-3xl border border-gray-800/50 shadow-2xl flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-4 w-5 h-5 text-gray-500 group-hover:text-gold-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search by patron or estate legacy..."
            className="w-full pl-16 pr-6 py-4 bg-gray-950/50 border border-gray-800/80 rounded-2xl focus:border-gold-500/50 outline-none text-sm font-bold text-white transition-all shadow-inner placeholder:text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 bg-gray-950/50 border border-gray-800/80 rounded-2xl px-6 py-2 group hover:border-gold-500/30 transition-all">
          <Filter className="w-4 h-4 text-gray-500 group-hover:text-gold-500 transition-colors" />
          <select 
            className="bg-transparent border-none text-gray-300 text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Complete Archive</option>
            <option value="Pending">Pending Auth</option>
            <option value="Confirmed">Active Folio</option>
            <option value="Cancelled">Voided</option>
            <option value="Completed">Historical</option>
          </select>
        </div>
      </div>

      {loading && bookings.length === 0 ? (
        <div className="flex items-center justify-center py-32 bg-[#111114] rounded-[3rem] border border-gray-800/50 border-dashed">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gold-500"></div>
        </div>
      ) : (
        <div className="bg-[#111114] rounded-[2.5rem] border border-gray-800/50 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="bg-[#1c1c20]">
                <tr>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Patron & Estate Entity</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Deployment Window</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Capital Value</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Auth Standing</th>
                  <th className="px-10 py-8 text-center text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/30">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-900/50 transition-all group">
                    <td className="px-10 py-10">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-gray-950 border border-gray-800 flex items-center justify-center text-gold-500 group-hover:scale-110 transition-transform shadow-inner">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-serif font-black text-white text-lg italic tracking-tight uppercase group-hover:text-gold-500 transition-colors">{booking.userId?.name}</p>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1 italic">{booking.hotelId?.name} — {booking.roomId?.type} Vault</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-10">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-tighter">
                          <Calendar className="w-4 h-4 text-gold-500/70" />
                          <span>
                            {new Date(booking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            <span className="mx-3 text-gray-600 opacity-50">/</span>
                            {new Date(booking.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-950 border border-gray-800 rounded-lg text-[9px] font-black text-gray-600 uppercase tracking-widest">
                          <Clock className="w-3 h-3" />
                          {Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))} CYCLE TOTAL
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-10">
                      <div className="space-y-3">
                        <div className="text-xl font-serif font-black text-white italic leading-none">₹{booking.totalAmount.toLocaleString()}</div>
                        <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border w-fit ${
                            booking.paymentStatus === 'Paid' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : booking.paymentStatus === 'Refunded'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-gray-800 text-gray-500 border-gray-700'
                        }`}>
                          <CreditCard className="w-3 h-3" />
                          {booking.paymentStatus}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-10 text-center">
                      <span className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-2xl transition-all hover:scale-105 italic ${
                          booking.status === 'Confirmed' 
                          ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' 
                          : booking.status === 'Cancelled' 
                          ? 'bg-rose-500/20 text-rose-500 border-rose-500/30' 
                          : booking.status === 'Completed'
                          ? 'bg-gold-500/10 text-gold-500 border-gold-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-10 py-10">
                      <div className="flex items-center justify-center gap-3">
                        {updatingId === booking._id ? (
                          <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
                        ) : (
                          <>
                            {booking.status === 'Pending' && (
                              <button 
                                onClick={() => handleStatusUpdate(booking._id, 'Confirmed')}
                                className="p-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all border border-emerald-500/20 shadow-lg"
                                title="Authorize Deployment"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                            )}
                            {booking.status === 'Confirmed' && (
                              <button 
                                onClick={() => handleStatusUpdate(booking._id, 'Completed')}
                                className="p-3 bg-white/5 text-white hover:bg-gold-500 hover:text-black rounded-xl transition-all border border-white/10 shadow-lg"
                                title="Seal Historical"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                            )}
                            {['Pending', 'Confirmed'].includes(booking.status) && (
                              <button 
                                onClick={() => handleStatusUpdate(booking._id, 'Cancelled')}
                                className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 shadow-lg"
                                title="Void Protocol"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            )}
                             {booking.paymentStatus === 'Paid' && (
                              <button 
                                onClick={() => handleRefund(booking._id)}
                                className="p-3 bg-gold-500/10 text-gold-500 hover:bg-gold-500 hover:text-black rounded-xl transition-all border border-gold-500/20 shadow-lg"
                                title="Initialize Refund protocol"
                              >
                                <CreditCard className="w-5 h-5" />
                              </button>
                            )}
                            <button 
                              onClick={() => navigate(`/invoice/${booking._id}`)}
                              className="p-3 bg-gray-900 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-800 shadow-lg hover:border-gold-500/30 group/inv"
                              title="View Official Invoice"
                            >
                              <FileText className="w-5 h-5 group-hover/inv:text-gold-500 transition-colors" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredBookings.length === 0 && (
            <div className="text-center py-32 bg-gray-950/20 group">
              <ClipboardList className="w-16 h-16 text-gray-800 mx-auto mb-6 group-hover:text-gold-500/20 transition-colors animate-pulse" />
              <p className="text-gray-600 font-bold uppercase tracking-[0.3em] text-[10px] italic">Telemetry null: No records match current extraction criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Bookings;
