import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getHotelImage } from '../utils/imageHelper';
import { Calendar, MapPin, Receipt, MessageCircle, Edit3, Trash2, ChevronRight, X, Star, CreditCard, ShieldCheck } from 'lucide-react';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modification State
    const [editingBooking, setEditingBooking] = useState(null);
    const [editForm, setEditForm] = useState({ checkIn: '', checkOut: '', guests: 1 });
    const [updateLoading, setUpdateLoading] = useState(false);
    const [error, setError] = useState('');

    // Invoice State
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [invoiceLoading, setInvoiceLoading] = useState(false);

    // Review State
    const [reviewingBooking, setReviewingBooking] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [reviewLoading, setReviewLoading] = useState(false);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/mybookings');
            setBookings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (bookingId) => {
        if (!window.confirm("Cancel this booking? This action is irreversible.")) return;
        try {
            await api.put(`/bookings/${bookingId}/cancel`);
            fetchBookings();
            alert('Booking cancelled. We hope to host you again soon.');
        } catch (error) {
            alert(error.response?.data?.message || 'Cancellation failed');
        }
    };

    const handleRefund = async (bookingId) => {
        if (!window.confirm("Request a refund for this payment?")) return;
        try {
            await api.post(`/payments/refund/${bookingId}`);
            fetchBookings();
            alert('Refund process started. Funds will return to the original source.');
        } catch (error) {
            alert(error.response?.data?.message || 'Refund failed');
        }
    };

    const fetchInvoice = async (bookingId) => {
        try {
            setInvoiceLoading(true);
            const { data } = await api.get(`/payments/invoice/${bookingId}`);
            setSelectedInvoice(data);
        } catch (error) {
            alert('Failed to retrieve digital invoice.');
        } finally {
            setInvoiceLoading(false);
        }
    };

    const startEdit = (booking) => {
        setEditingBooking(booking);
        setEditForm({
            checkIn: booking.checkIn.split('T')[0],
            checkOut: booking.checkOut.split('T')[0],
            guests: booking.guests
        });
        setError('');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        
        if (new Date(editForm.checkIn) >= new Date(editForm.checkOut)) {
            setError('Check-out must be after check-in.');
            return;
        }

        try {
            setUpdateLoading(true);
            await api.put(`/bookings/${editingBooking._id}`, editForm);
            setEditingBooking(null);
            fetchBookings();
            alert('Reservation details updated successfully.');
        } catch (error) {
            setError(error.response?.data?.message || 'Update failed. Check availability.');
        } finally {
            setUpdateLoading(false);
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        try {
            setReviewLoading(true);
            await api.post(`/reviews/hotel/${reviewingBooking.hotelId._id}`, reviewForm);
            alert('Your review has been recorded. Thank you for your feedback.');
            setReviewingBooking(null);
            setReviewForm({ rating: 5, comment: '' });
        } catch (error) {
            alert(error.response?.data?.message || 'Submission failed');
        } finally {
            setReviewLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#EDF7BD]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-transparent"></div>
        </div>
    );

    return (
        <div className="bg-[#EDF7BD] min-h-screen pt-32 pb-24 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-transparent/5 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-transparent/5 blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Header Section */}
                <div className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-10">
                    <div>
                        <h1 className="text-xs font-black uppercase tracking-[0.6em] text-black mb-6 flex items-center gap-2">
                             Your History
                        </h1>
                        <h2 className="text-5xl md:text-7xl font-serif font-black text-black uppercase tracking-tighter leading-none italic">
                            My <span className="text-black">Bookings</span>
                        </h2>
                        <p className="text-black mt-4 font-medium tracking-wide italic">History of your stays with Navan.</p>
                    </div>
                </div>

                {bookings.length === 0 ? (
                    <div className="text-center py-32 bg-[#EDF7BD] rounded-[3rem] border border-dashed border-white/10 border-2">
                        <div className="text-6xl mb-8 opacity-20 grayscale">🧳</div>
                        <p className="text-2xl font-serif font-black text-black uppercase tracking-widest mb-10 italic">No bookings found</p>
                        <Link to="/hotels" className="inline-block bg-transparent text-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#EDF7BD] transition-all transform active:scale-95 shadow-2xl shadow-transparent/10">Find Hotels</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-12">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="group bg-[#EDF7BD] rounded-[3rem] border border-white/5 shadow-2xl hover:border-transparent/30 transition-all duration-700 overflow-hidden flex flex-col lg:flex-row shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
                                
                                {/* Image Section */}
                                <div className="lg:w-1/3 min-h-[300px] overflow-hidden relative">
                                    <Link to={`/hotels/${booking.hotelId?._id}`} className="block w-full h-full">
                                        <img 
                                            src={getHotelImage(booking.hotelId)} 
                                            onError={(e) => {
                                                e.target.onerror = null; 
                                                e.target.src = 'https://images.unsplash.com/photo-1542314831-c6a4d27ce66f?auto=format&fit=crop&w=1200&q=80';
                                            }}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                            alt={booking.hotelId?.name || "Hotel"} 
                                        />
                                    </Link>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent opacity-60"></div>
                                    <div className="absolute top-8 left-8">
                                        <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md border border-white/10 ${
                                            booking.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' :
                                            booking.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-transparent/20 text-black'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-grow p-12 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <h3 className="text-3xl font-serif font-black text-black hover:text-black transition-colors uppercase tracking-tight italic mb-2">
                                                    <Link to={`/hotels/${booking.hotelId?._id}`}>{booking.hotelId?.name}</Link>
                                                </h3>
                                                <p className="text-[10px] font-black text-black uppercase tracking-[0.3em] flex items-center gap-2">
                                                    <MapPin size={10} className="text-black" /> {booking.hotelId?.city}, {booking.hotelId?.country}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-serif font-black text-black leading-none">₹{booking.totalAmount}</div>
                                                <div className="text-[9px] font-black text-black uppercase mt-2 tracking-widest">Total Amount</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 p-10 bg-[#EDF7BD]/40 rounded-[2.5rem] border border-white/5">
                                            <div className="space-y-2">
                                                <span className="text-[9px] font-black text-black uppercase tracking-[0.2em] block">Arrival</span>
                                                <strong className="text-xs font-black text-black uppercase tracking-widest">{new Date(booking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[9px] font-black text-black uppercase tracking-[0.2em] block">Departure</span>
                                                <strong className="text-xs font-black text-black uppercase tracking-widest">{new Date(booking.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[9px] font-black text-black uppercase tracking-[0.2em] block">Room</span>
                                                <strong className="text-xs font-black text-black uppercase tracking-widest">{booking.roomId?.type}</strong>
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[9px] font-black text-black uppercase tracking-[0.2em] block">Guests</span>
                                                <strong className="text-xs font-black text-black uppercase tracking-widest">{booking.guests} Guests</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12 flex flex-wrap gap-4">
                                        {booking.status === 'Pending' && (
                                            <Link to={`/payment/${booking._id}`} className="bg-transparent text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#EDF7BD] transition-all shadow-xl shadow-transparent/10 flex items-center gap-2">
                                                <CreditCard size={14} /> Finalize Payment
                                            </Link>
                                        )}
                                        {booking.status === 'Confirmed' && (
                                            <Link 
                                                to={`/invoice/${booking._id}`}
                                                className="bg-[#EDF7BD]/5 text-black border border-white/10 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#EDF7BD] hover:text-black transition-all flex items-center gap-2"
                                            >
                                                <Receipt size={14} /> Digtal Invoice
                                            </Link>
                                        )}
                                        {booking.status === 'Confirmed' && (
                                            <button 
                                                onClick={() => setReviewingBooking(booking)}
                                                className="bg-transparent text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#EDF7BD] transition-all shadow-xl shadow-transparent/10 flex items-center gap-2"
                                            >
                                                <MessageCircle size={14} /> Write a Review
                                            </button>
                                        )}
                                        {booking.paymentStatus === 'Paid' && booking.status === 'Cancelled' && (
                                            <button 
                                                onClick={() => handleRefund(booking._id)}
                                                className="bg-transparent/10 text-black border border-transparent/20 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-transparent hover:text-black transition-all"
                                            >
                                                Request Refund
                                            </button>
                                        )}
                                        {booking.paymentStatus === 'Refunded' && (
                                            <span className="bg-[#EDF7BD]/5 text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 flex items-center gap-2">
                                                <ShieldCheck size={14} /> Refunded to Source
                                            </span>
                                        )}
                                        {(booking.status === 'Confirmed' || booking.status === 'Pending') && new Date(booking.checkIn) > new Date() && (
                                            <>
                                                <button 
                                                    onClick={() => startEdit(booking)} 
                                                    className="bg-[#EDF7BD]/5 text-black border border-white/10 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-transparent hover:text-black transition-all flex items-center gap-2"
                                                >
                                                    <Edit3 size={14} /> Edit Dates
                                                </button>
                                                <button 
                                                    onClick={() => handleCancel(booking._id)} 
                                                    className="bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                                >
                                                    <Trash2 size={14} /> Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODIFICATION MODAL */}
            {editingBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#EDF7BD]/80 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="bg-[#EDF7BD] w-full max-w-xl rounded-[3rem] shadow-2xl relative border border-white/10 overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="absolute top-0 left-0 w-full h-2 bg-transparent"></div>
                        <button onClick={() => setEditingBooking(null)} className="absolute top-10 right-10 text-black hover:text-black transition-colors outline-none z-10">
                            <X size={24} />
                        </button>
                        
                        <div className="p-16">
                            <div className="text-center mb-12">
                                <h3 className="text-[10px] font-black text-black uppercase tracking-[0.5em] mb-4">Booking Details</h3>
                                <h4 className="text-4xl font-serif font-black text-black uppercase tracking-tight italic leading-none">Edit Booking</h4>
                            </div>
                            
                            <form onSubmit={handleUpdate} className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-black uppercase tracking-widest pl-2">Revised Arrival</label>
                                        <input 
                                            type="date" required 
                                            value={editForm.checkIn}
                                            onChange={(e) => setEditForm({...editForm, checkIn: e.target.value})}
                                            className="w-full bg-[#EDF7BD]/40 border border-white/10 rounded-2xl p-4 text-sm text-black focus:border-transparent outline-none transition-all font-bold color-scheme-dark"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-black uppercase tracking-widest pl-2">Revised Departure</label>
                                        <input 
                                            type="date" required 
                                            value={editForm.checkOut}
                                            onChange={(e) => setEditForm({...editForm, checkOut: e.target.value})}
                                            className="w-full bg-[#EDF7BD]/40 border border-white/10 rounded-2xl p-4 text-sm text-black focus:border-transparent outline-none transition-all font-bold color-scheme-dark"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black uppercase tracking-widest pl-2">Accompanying Guests</label>
                                    <input 
                                        type="number" min="1" required 
                                        value={editForm.guests}
                                        onChange={(e) => setEditForm({...editForm, guests: parseInt(e.target.value)})}
                                        className="w-full bg-[#EDF7BD]/40 border border-white/10 rounded-2xl p-4 text-sm text-black focus:border-transparent outline-none transition-all font-bold"
                                    />
                                </div>

                                {error && (
                                    <div className="p-5 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 text-xs font-black uppercase tracking-widest leading-relaxed">
                                        {error}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={updateLoading}
                                    className="w-full bg-transparent text-black font-black uppercase tracking-[0.4em] py-6 rounded-2xl hover:bg-[#EDF7BD] transition-all transform active:scale-95 disabled:opacity-50 shadow-2xl shadow-transparent/10 text-[10px]"
                                >
                                    {updateLoading ? 'Saving Changes...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* REVIEW MODAL */}
            {reviewingBooking && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#EDF7BD]/80 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="bg-[#EDF7BD] w-full max-w-xl rounded-[3rem] shadow-2xl relative border border-white/10 overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="absolute top-0 left-0 w-full h-2 bg-transparent"></div>
                        <button onClick={() => setReviewingBooking(null)} className="absolute top-10 right-10 text-black hover:text-black transition-colors outline-none z-10">
                            <X size={24} />
                        </button>
                        
                        <div className="p-16">
                            <div className="text-center mb-12">
                                <span className="text-[10px] font-black text-black uppercase tracking-[0.5em] mb-4 block">Hotel Review</span>
                                <h3 className="text-4xl font-serif font-black text-black uppercase tracking-tight italic leading-none">Review Your Stay</h3>
                            </div>

                            <form onSubmit={submitReview} className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-black uppercase tracking-widest flex justify-center">Rating</label>
                                    <div className="flex justify-center gap-6 py-8 bg-[#EDF7BD]/40 rounded-[2.5rem] border border-white/5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button 
                                                key={star} type="button" 
                                                onClick={() => setReviewForm({...reviewForm, rating: star})}
                                                className={`text-5xl transition-all duration-500 ${reviewForm.rating >= star ? 'text-black scale-125 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-black grayscale opacity-20'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-black uppercase tracking-widest pl-2">Your Comments</label>
                                    <textarea 
                                        required rows="4"
                                        placeholder="Tell us about your stay..."
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                        className="w-full bg-[#EDF7BD]/40 border border-white/10 rounded-[2rem] p-8 text-black focus:border-transparent outline-none text-sm font-medium transition-all resize-none placeholder:text-black italic"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={reviewLoading}
                                    className="w-full bg-transparent text-black font-black uppercase tracking-[0.4em] py-6 rounded-2xl hover:bg-[#EDF7BD] transition-all transform active:scale-95 disabled:opacity-50 shadow-2xl shadow-transparent/10 text-[10px]"
                                >
                                    {reviewLoading ? 'Submitting Review...' : 'Submit Review'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
