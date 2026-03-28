import { useState, useEffect, useContext } from 'react';
import { api, AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import socketService from '../utils/socket';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [analytics, setAnalytics] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [hotelsList, setHotelsList] = useState([]);
    const [bookingsList, setBookingsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('Overview');

    useEffect(() => {
        const path = location.pathname.split('/').pop();
        const mapping = {
            'dashboard': 'Dashboard',
            'approve-hotels': 'Approve Hotels',
            'hotels': 'Manage Hotels',
            'users': 'Users',
            'bookings': 'Bookings',
            'payments': 'Payments',
            'promotions': 'Promotions',
            'reviews': 'Reviews',
            'analytics': 'Analytics'
        };
        if (mapping[path]) {
            setActiveTab(mapping[path]);
        }
    }, [location]);
    const [feed, setFeed] = useState([]);
    const [liveAlert, setLiveAlert] = useState(null);
    
    // New Data States
    const [paymentsList, setPaymentsList] = useState([]);
    const [promotionsList, setPromotionsList] = useState([]);
    const [reviewsList, setReviewsList] = useState([]);
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [promoForm, setPromoForm] = useState({
        code: '', description: '', discount: 5, type: 'percentage',
        minBookingAmount: 0, expiryDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
        hotelId: ''
    });

    const fetchData = async () => {
        try {
            const [
                { data: anaData },
                { data: userData },
                { data: hotelData },
                { data: bookData },
                { data: payData },
                { data: promoData },
                { data: reviewData }
            ] = await Promise.all([
                api.get('/admin/analytics'),
                api.get('/admin/users'),
                api.get('/admin/hotels'),
                api.get('/admin/bookings'),
                api.get('/payments/all'),
                api.get('/promotions'),
                api.get('/reviews/all')
            ]);

            setAnalytics(anaData);
            setUsersList(userData);
            setHotelsList(hotelData);
            setBookingsList(bookData);
            setPaymentsList(payData);
            setPromotionsList(promoData);
            setReviewsList(reviewData);
        } catch (error) {
            console.error('Admin data fetch failure');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchData();

        const socket = socketService.getSocket();
        socket.emit('join_admin_room');

        socket.on('global_activity', (data) => {
            setFeed(prev => [{ ...data, id: Date.now(), time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
            fetchData();
            setLiveAlert(`Elite Transaction: ₹${data.amount} in ${data.location}!`);
            setTimeout(() => setLiveAlert(null), 4000);
        });

        socket.on('new_user_alert', (data) => {
            setFeed(prev => [{ type: 'user', name: data.name, role: data.role, id: Date.now(), time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
            fetchData();
            setLiveAlert(`New Patron: ${data.name} (${data.role})`);
            setTimeout(() => setLiveAlert(null), 4000);
        });

        return () => {
            socket.off('global_activity');
            socket.off('new_user_alert');
        };
    }, [user, navigate]);

    const handleApprove = async (id) => {
        try {
            await api.put(`/admin/hotels/${id}/approve`);
            alert('Property authorized successfully.');
            fetchData();
        } catch (error) {
            alert('Authorization failed');
        }
    };

    const handleDeleteHotel = async (id) => {
        if (!window.confirm("Permanently de-list this property?")) return;
        try {
            await api.delete(`/admin/hotels/${id}`);
            alert('Property removed.');
            fetchData();
        } catch (error) {
            alert('Operation failed');
        }
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm("Purge this reflection from the archives?")) return;
        try {
            await api.delete(`/reviews/${id}`);
            alert('Review removed');
            fetchData();
        } catch (error) {
            alert('Purge failed');
        }
    };

    const handleCreatePromo = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...promoForm };
            if (!payload.hotelId) delete payload.hotelId;
            await api.post('/promotions', payload);
            alert('Promotion authorized');
            setShowPromoModal(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Authorization failed');
        }
    };

    const handleTogglePromo = async (id, isActive) => {
        try {
            await api.put(`/promotions/${id}`, { isActive: !isActive });
            fetchData();
        } catch (error) {
            alert('Protocol update failed');
        }
    };

    const handleDeletePromo = async (id) => {
        if (!window.confirm("Remove this offer from circulation?")) return;
        try {
            await api.delete(`/promotions/${id}`);
            fetchData();
        } catch (error) {
            alert('Removal failed');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#EDF7BD]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-transparent border-solid"></div>
        </div>
    );

    const sidebarLinks = [
        { name: 'Dashboard', icon: '💎' },
        { name: 'Approve Hotels', icon: '⚖️' },
        { name: 'Manage Hotels', icon: '🏰' },
        { name: 'Users', icon: '👥' },
        { name: 'Bookings', icon: '📝' },
        { name: 'Payments', icon: '💰' },
        { name: 'Promotions', icon: '🏷️' },
        { name: 'Reviews', icon: '⭐' },
        { name: 'Analytics', icon: '📊' }
    ];

    const unapprovedHotels = hotelsList.filter(h => !h.isApproved);
    const approvedHotels = hotelsList.filter(h => h.isApproved);

    return (
        <div className="font-sans text-black">
            {/* LIVE ALERT */}
            {liveAlert && (
                <div className="fixed top-24 right-8 z-[100] bg-transparent text-black px-6 py-3 rounded-xl shadow-2xl animate-in slide-in-from-right-10 font-black text-xs flex items-center gap-3">
                    <span className="animate-pulse">📡</span> {liveAlert}
                </div>
            )}

            {/* MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-12 bg-[#EDF7BD]">
                <header className="mb-12">
                    <h1 className="text-3xl sm:text-4xl font-serif font-black text-black tracking-tighter uppercase italic pt-8">{activeTab}</h1>
                    <div className="h-1.5 w-24 bg-transparent mt-4 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]"></div>
                    <p className="text-[10px] font-black text-black uppercase tracking-[0.3em] mt-6">
                        Protocol established: Global oversight and administrative telemetry active.
                    </p>
                </header>

                {activeTab === 'Dashboard' && analytics && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {/* STATS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                            {[
                                { label: 'Revenue', value: `₹${analytics.totalRevenue.toLocaleString()}`, icon: '💰' },
                                { label: 'Bookings', value: analytics.totalBookings, icon: '🎫' },
                                { label: 'Users', value: analytics.totalUsers, icon: '👤' },
                                { label: 'Hotels', value: analytics.totalHotels, icon: '🏰' }
                            ].map((s, i) => (
                                <div key={i} className="bg-transparent p-6 sm:p-8 transition-all group">
                                    <div className="text-2xl sm:text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all">{s.icon}</div>
                                    <div className="text-2xl sm:text-3xl font-serif font-black text-black mb-1">{s.value}</div>
                                    <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-black">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* RECENT FEED */}
                            <div className="bg-transparent p-10">
                                <h3 className="text-lg font-serif font-black text-black mb-8 uppercase italic border-b border-gray-800 pb-4">Live Activity</h3>
                                <div className="space-y-4">
                                    {feed.map(item => (
                                        <div key={item.id} className="bg-[#EDF7BD]/50 p-6 rounded-3xl border border-gray-800/50 animate-in slide-in-from-top-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[9px] font-black text-black uppercase tracking-widest">{item.type === 'booking' ? 'Transaction' : 'New Patron'}</span>
                                                <span className="text-[9px] font-bold text-black">{item.time}</span>
                                            </div>
                                            <p className="text-sm font-bold text-black">
                                                {item.type === 'booking' ? `₹${item.amount} secured in ${item.location}` : `${item.name} joined as ${item.role}`}
                                            </p>
                                        </div>
                                    ))}
                                    {feed.length === 0 && <p className="text-center py-12 text-black font-bold uppercase tracking-widest text-xs italic">Awaiting Telemetry...</p>}
                                </div>
                            </div>

                            {/* HOTELS */}
                            <div className="bg-transparent p-10 rounded-[2.5rem] border border-gray-800/50">
                                <h3 className="text-lg font-serif font-black text-black mb-8 uppercase italic border-b border-gray-800 pb-4">Popular Sanctuaries</h3>
                                <div className="space-y-6">
                                    {analytics.mostBooked.map((hotel, i) => (
                                        <div key={i} className="flex items-center gap-6">
                                            <div className="text-2xl font-serif font-black text-black italic">0{i+1}</div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-black text-black uppercase">{hotel.hotelInfo.name}</span>
                                                    <span className="text-xs font-black text-black">{hotel.count}</span>
                                                </div>
                                                <div className="h-1.5 bg-[#EDF7BD] rounded-full overflow-hidden">
                                                    <div className="h-full bg-transparent shadow-[0_0_10px_rgba(212,175,55,0.5)]" style={{ width: `${(hotel.count / (analytics.totalBookings || 1)) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Approve Hotels' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                        {unapprovedHotels.length === 0 ? (
                            <div className="bg-transparent p-24 text-center">
                                <div className="text-6xl mb-6 grayscale opacity-30">⚖️</div>
                                <h3 className="text-2xl font-serif font-black text-black mb-2 italic">Lobby Empty</h3>
                                <p className="text-black font-bold uppercase tracking-widest text-[10px]">All pending property reviews are complete.</p>
                            </div>
                        ) : (
                            <div className="bg-transparent overflow-hidden">
                            <div className="bg-transparent overflow-x-auto custom-scrollbar border border-black/5 rounded-[2rem]">
                                <table className="w-full text-left min-w-[700px]">
                                    <thead className="bg-[#003049] text-white">
                                        <tr>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest">Sanctuary</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest">Curator</th>
                                            <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest">Protocol</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5">
                                        {unapprovedHotels.map(h => (
                                            <tr key={h._id} className="hover:bg-white/40 transition-colors">
                                                <td className="p-6">
                                                    <div className="text-base font-serif font-black text-[#003049] italic">{h.name}</div>
                                                    <div className="text-[9px] font-bold text-[#003049]/40 uppercase tracking-widest mt-1">📍 {h.city}</div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="text-xs font-bold text-[#003049]">{h.managerId?.name || 'External'}</div>
                                                    <div className="text-[9px] text-[#003049]/60 font-medium">{h.managerId?.email}</div>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button onClick={() => handleApprove(h._id)} className="bg-[#003049] text-[#EDF7BD] px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Approve</button>
                                                        <button onClick={() => handleDeleteHotel(h._id)} className="border border-rose-500/20 text-rose-500 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95">Decline</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Manage Hotels' && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="bg-transparent overflow-x-auto custom-scrollbar border border-black/5 rounded-[2rem]">
                            <table className="w-full text-left min-w-[700px]">
                                <thead className="bg-[#003049] text-white">
                                    <tr>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest">Verified Hotel</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest">Performance</th>
                                        <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest">Operation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {approvedHotels.map(h => (
                                        <tr key={h._id} className="hover:bg-white/40 transition-colors">
                                            <td className="p-6">
                                                <div className="text-base font-serif font-black text-[#003049] italic">{h.name}</div>
                                                <div className="text-[9px] font-bold text-[#003049]/40 uppercase tracking-widest mt-1">📍 {h.city}, {h.country}</div>
                                            </td>
                                            <td className="p-6">
                                                <span className="px-5 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest italic border border-emerald-500/20 shadow-inner">Authenticated</span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <button onClick={() => handleDeleteHotel(h._id)} className="text-rose-500 hover:text-rose-400 text-[9px] font-black uppercase tracking-widest transition-all italic border-b border-transparent hover:border-rose-500">Revoke License</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {approvedHotels.length === 0 && <tr><td colSpan="3" className="p-16 text-center text-[#003049]/40 font-bold uppercase tracking-widest text-xs italic">Archive Empty</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'Users' && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="bg-transparent overflow-x-auto custom-scrollbar border border-black/5 rounded-[2rem]">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead className="bg-[#003049] text-white">
                                    <tr>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest">Patron Identity</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest">Status Protocol</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest">Induction Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {usersList.map(u => (
                                        <tr key={u._id} className="hover:bg-white/40 transition-colors">
                                            <td className="p-6 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#003049] text-[#EDF7BD] flex items-center justify-center font-black text-xs shadow-xl uppercase">{u.name.charAt(0)}</div>
                                                <div>
                                                    <div className="text-sm font-black text-[#003049] italic">{u.name}</div>
                                                    <div className="text-[9px] font-medium text-[#003049]/60 lowercase">{u.email}</div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest italic border ${u.role === 'admin' ? 'bg-[#003049] text-[#EDF7BD] border-transparent' : u.role === 'manager' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-black/5 text-[#003049]/60 border-black/5'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="text-[10px] font-black text-[#003049]/60 uppercase tracking-widest">{new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'Bookings' && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="bg-transparent overflow-x-auto custom-scrollbar border border-black/5 rounded-[2rem]">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-[#003049] text-white">
                                    <tr>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest">Folio ID</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest">Patron & Estate</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest">Value</th>
                                        <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest">Standing</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {bookingsList.map(res => (
                                        <tr key={res._id} className="hover:bg-white/40 transition-colors">
                                            <td className="p-6">
                                                <div className="text-[10px] font-mono font-black text-[#003049]/40">#{res._id.slice(-8).toUpperCase()}</div>
                                                <div className="text-[9px] font-bold text-[#003049]/60 uppercase tracking-tighter mt-1">{new Date(res.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="text-sm font-black text-[#003049]">{res.userId?.name}</div>
                                                <div className="text-[9px] font-black text-[#003049]/40 italic uppercase mt-0.5">{res.hotelId?.name} — {res.roomId?.type}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="text-sm font-black text-[#003049] italic leading-none">₹{res.totalAmount.toLocaleString()}</div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border italic ${res.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : res.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                    {res.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {bookingsList.length === 0 && <tr><td colSpan="4" className="p-16 text-center text-[#003049]/40 font-bold uppercase tracking-widest text-xs italic">Registry Empty</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'Payments' && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="bg-transparent overflow-x-auto custom-scrollbar border border-black/5 rounded-[2rem]">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-[#1a1a1e]">
                                    <tr>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-black">Transaction ID</th>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-black">Patron</th>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-black">Hotel</th>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-black">Value</th>
                                        <th className="p-8 text-right text-[10px] font-black uppercase tracking-widest text-black">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {paymentsList.map(pay => (
                                        <tr key={pay._id} className="hover:bg-gray-800/20 transition-colors">
                                            <td className="p-8">
                                                <div className="text-xs font-mono text-black/70 uppercase">#{pay.razorpayPaymentId?.slice(-10)}</div>
                                            </td>
                                            <td className="p-8">
                                                <div className="text-sm font-black text-black italic">{pay.userId?.name}</div>
                                                <div className="text-[10px] text-black uppercase">{pay.userId?.email}</div>
                                            </td>
                                            <td className="p-8">
                                                <div className="text-xs font-bold text-black uppercase">{pay.hotelId?.name}</div>
                                            </td>
                                            <td className="p-8 font-serif font-black text-black italic">₹{pay.totalAmount.toLocaleString()}</td>
                                            <td className="p-8 text-right">
                                                <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border italic ${pay.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                                    {pay.paymentStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {paymentsList.length === 0 && <tr><td colSpan="5" className="p-16 text-center text-black font-bold uppercase tracking-widest text-xs italic">No transactions found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'Promotions' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-serif font-black text-black uppercase italic">Active Offers</h3>
                            <button onClick={() => setShowPromoModal(true)} className="bg-transparent text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-transparent/20 active:scale-95 transition-all">Authorize New Promo</button>
                        </div>
                        <div className="bg-transparent overflow-x-auto custom-scrollbar border border-black/5 rounded-[2rem]">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-[#1a1a1e]">
                                    <tr>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-black">Property</th>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-black">Code</th>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-black">Discount</th>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-black">Expiry</th>
                                        <th className="p-8 text-right text-[10px] font-black uppercase tracking-widest text-black">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {promotionsList.map(p => (
                                        <tr key={p._id} className="hover:bg-gray-800/20 transition-colors">
                                            <td className="p-8 text-xs font-bold text-black italic max-w-[150px] truncate" title={p.hotelId ? p.hotelId.name : 'Global Collection'}>
                                                {p.hotelId ? p.hotelId.name : 'Global Collection'}
                                            </td>
                                            <td className="p-8 font-mono text-black font-black">{p.code}</td>
                                            <td className="p-8 text-xs font-bold text-black italic">{p.discount}{p.type === 'percentage' ? '%' : ' INR'} OFF</td>
                                            <td className="p-8 text-[10px] text-black font-black uppercase">{new Date(p.expiryDate).toLocaleDateString()}</td>
                                            <td className="p-8 text-right">
                                                <div className="flex justify-end gap-6 items-center">
                                                    <button onClick={() => handleTogglePromo(p._id, p.isActive)} className={`text-[10px] font-black uppercase tracking-widest ${p.isActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {p.isActive ? 'Active' : 'Halt'}
                                                    </button>
                                                    <button onClick={() => handleDeletePromo(p._id)} className="text-black hover:text-black transition-colors">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {promotionsList.length === 0 && <tr><td colSpan="4" className="p-16 text-center text-black font-bold uppercase tracking-widest text-xs italic">No offers active</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'Reviews' && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="bg-transparent overflow-x-auto custom-scrollbar border border-black/5 rounded-[2rem]">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-[#1a1a1e]">
                                    <tr>
                                        <th className="p-10 text-[10px] font-black uppercase tracking-widest text-black">Patron & Hotel</th>
                                        <th className="p-10 text-[10px] font-black uppercase tracking-widest text-black">Reflection</th>
                                        <th className="p-10 text-right text-[10px] font-black uppercase tracking-widest text-black">Moderation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {reviewsList.map(r => (
                                        <tr key={r._id} className="hover:bg-gray-800/20 transition-colors">
                                            <td className="p-10 min-w-[300px]">
                                                <div className="text-lg font-serif font-black text-black italic">{r.userId?.name}</div>
                                                <div className="text-[10px] font-bold text-black uppercase tracking-widest mt-1">@ {r.hotelId?.name}</div>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex gap-1 mb-3">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < r.rating ? 'text-black' : 'text-black'}>★</span>
                                                    ))}
                                                </div>
                                                <p className="text-sm font-medium text-black leading-relaxed max-w-xl italic">"{r.comment}"</p>
                                            </td>
                                            <td className="p-10 text-right">
                                                <button onClick={() => handleDeleteReview(r._id)} className="text-rose-500 hover:text-black bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic">Purge</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {reviewsList.length === 0 && <tr><td colSpan="3" className="p-24 text-center text-black font-bold uppercase tracking-widest text-xs italic">Archive Empty</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'Analytics' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                            {/* REVENUE CHART */}
                            <div className="bg-transparent p-12">
                                <h3 className="text-lg font-serif font-black text-black mb-10 uppercase italic">Revenue Trajectory</h3>
                                <div className="h-[400px]">
                                    <Line 
                                        data={{
                                            labels: analytics.revenueTrends?.map(t => `Month ${t._id}`) || [],
                                            datasets: [{
                                                label: 'Revenue (INR)',
                                                data: analytics.revenueTrends?.map(t => t.total) || [],
                                                borderColor: '#d4af37',
                                                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                                fill: true,
                                                tension: 0.4,
                                                pointBackgroundColor: '#d4af37',
                                                pointRadius: 6
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false } },
                                                x: { grid: { display: false }, border: { display: false } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* USER GROWTH CHART */}
                            <div className="bg-transparent p-12 rounded-[3rem] border border-gray-800/50">
                                <h3 className="text-lg font-serif font-black text-black mb-10 uppercase italic">Patron Growth</h3>
                                <div className="h-[400px]">
                                    <Bar 
                                        data={{
                                            labels: analytics.growth?.map(g => `Month ${g._id}`) || [],
                                            datasets: [{
                                                label: 'New Users',
                                                data: analytics.growth?.map(g => g.count) || [],
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: 12,
                                                hoverBackgroundColor: '#d4af37',
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false } },
                                                x: { grid: { display: false }, border: { display: false } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM STATS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-transparent p-6 sm:p-10 text-center">
                                <div className="text-3xl sm:text-4xl font-serif font-black text-black mb-2 italic">₹{(analytics.totalRevenue / (analytics.totalBookings || 1)).toFixed(0)}</div>
                                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-black italic">Average Order Value</div>
                            </div>
                            <div className="bg-transparent p-6 sm:p-10 rounded-[2.5rem] border border-gray-800/50 text-center">
                                <div className="text-3xl sm:text-4xl font-serif font-black text-black mb-2 italic">{((analytics.totalBookings / (analytics.totalUsers || 1)) * 100).toFixed(1)}%</div>
                                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-black italic">Booking Conversion</div>
                            </div>
                            <div className="bg-transparent p-6 sm:p-10 rounded-[2.5rem] border border-gray-800/50 text-center">
                                <div className="text-3xl sm:text-4xl font-serif font-black text-emerald-500 mb-2 italic">{analytics.totalHotels}+</div>
                                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-black italic">Verified Inventory Units</div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* PROMOTION MODAL */}
            {showPromoModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#EDF7BD]/90 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-transparent w-full max-w-2xl rounded-[3rem] shadow-2xl relative border border-white/10 overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-16">
                            <header className="text-center mb-16">
                                <h3 className="text-[10px] font-black text-black uppercase tracking-[0.6em] mb-4 italic">Promotional Protocol</h3>
                                <h4 className="text-4xl font-serif font-black text-black uppercase tracking-tighter italic italic">Authorize New Offer</h4>
                                <div className="h-1 w-24 bg-transparent mx-auto mt-6 rounded-full"></div>
                            </header>

                            <form onSubmit={handleCreatePromo} className="space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-black uppercase tracking-widest ml-1">Elite Code</label>
                                        <input 
                                            type="text" required placeholder="EX: LUXURY25"
                                            className="w-full bg-[#EDF7BD]/40 border border-white/10 p-5 rounded-2xl text-black outline-none focus:border-transparent font-black tracking-widest uppercase transition-all"
                                            value={promoForm.code} onChange={e => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-black uppercase tracking-widest ml-1">Benefit Value</label>
                                        <input 
                                            type="number" required
                                            className="w-full bg-[#EDF7BD]/40 border border-white/10 p-5 rounded-2xl text-black outline-none focus:border-transparent font-black transition-all"
                                            value={promoForm.discount} onChange={e => setPromoForm({...promoForm, discount: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-black uppercase tracking-widest ml-1">Protocol Type</label>
                                        <select 
                                            className="w-full bg-[#EDF7BD]/40 border border-white/10 p-5 rounded-2xl text-black outline-none focus:border-transparent font-bold transition-all appearance-none"
                                            value={promoForm.type} onChange={e => setPromoForm({...promoForm, type: e.target.value})}
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed (INR)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-black uppercase tracking-widest ml-1">Applicable Property</label>
                                        <select 
                                            className="w-full bg-[#EDF7BD]/40 border border-white/10 p-5 rounded-2xl text-black outline-none focus:border-transparent font-bold transition-all appearance-none"
                                            value={promoForm.hotelId} onChange={e => setPromoForm({...promoForm, hotelId: e.target.value})}
                                        >
                                            <option value="">Global Protocol (All Properties)</option>
                                            {approvedHotels.map(h => (
                                                <option key={h._id} value={h._id}>{h.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-black uppercase tracking-widest ml-1">Termination Date</label>
                                        <input 
                                            type="date" required
                                            className="w-full bg-[#EDF7BD]/40 border border-white/10 p-5 rounded-2xl text-black outline-none focus:border-transparent font-bold transition-all color-scheme-dark"
                                            value={promoForm.expiryDate} onChange={e => setPromoForm({...promoForm, expiryDate: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-black uppercase tracking-widest ml-1">Description</label>
                                    <textarea 
                                        required rows="3" placeholder="Define the offer's impact..."
                                        className="w-full bg-[#EDF7BD]/40 border border-white/10 p-5 rounded-2xl text-black outline-none focus:border-transparent font-medium italic transition-all resize-none"
                                        value={promoForm.description} onChange={e => setPromoForm({...promoForm, description: e.target.value})}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button" onClick={() => setShowPromoModal(false)}
                                        className="flex-grow py-5 bg-[#EDF7BD]/5 text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-[#EDF7BD] hover:text-black transition-all"
                                    >
                                        Cancel Protocol
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-[2] py-5 bg-transparent text-black font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl hover:bg-[#EDF7BD] transition-all shadow-xl shadow-transparent/20 transform active:scale-95"
                                    >
                                        Confirm Authorization
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
