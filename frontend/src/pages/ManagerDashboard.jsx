import { useState, useEffect, useContext } from 'react';
import { api, AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import socketService from '../utils/socket';
import { getHotelImage } from '../utils/imageHelper';
import RefundButton from '../components/RefundButton';

const ManagerDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [myHotels, setMyHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('hotels');
    const [isCreating, setIsCreating] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    // Feedback Response State
    const [respondingTo, setRespondingTo] = useState(null);
    const [managerResponse, setManagerResponse] = useState('');
    const [responseLoading, setResponseLoading] = useState(false);
    
    // Real-time notifications
    const [notification, setNotification] = useState(null);

    // Forms
    const [hotelFormData, setHotelFormData] = useState({
        name: '', description: '', address: '', city: '', country: '', amenities: '', images: []
    });
    const [roomFormData, setRoomFormData] = useState({
        type: 'Single', pricePerNight: '', capacity: 1, count: 1, amenities: '', images: [], id: null, isMaintenance: false
    });

    const [showRoomForm, setShowRoomForm] = useState(false);
    const [showHotelEdit, setShowHotelEdit] = useState(false);

    const fetchData = async () => {
        try {
            const { data } = await api.get('/hotels/myhotels');
            setMyHotels(data);
            
            // If we have hotels but none selected, select the first one
            if (data.length > 0 && !selectedHotel) {
                const firstHotel = data[0];
                setSelectedHotel(firstHotel);
                fetchHotelDetails(firstHotel._id);
                setActiveTab('overview');
            } else if (selectedHotel) {
                // Refresh current hotel details if already selected
                fetchHotelDetails(selectedHotel._id);
            }
        } catch (error) {
            console.error('Data fetch error');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async (hotelId = null) => {
        try {
            setAnalyticsLoading(true);
            const url = hotelId ? `/analytics/manager?hotelId=${hotelId}` : '/analytics/manager';
            const { data } = await api.get(url);
            setAnalytics(data);
        } catch (err) {
            console.error('Analytics fetch error');
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const fetchHotelDetails = async (hotelId) => {
        try {
            const { data } = await api.get(`/hotels/${hotelId}`);
            setRooms(data.rooms || []);
            
            // Pass hotelId to API for specific retrieval
            const resData = await api.get(`/bookings/hotel-bookings?hotelId=${hotelId}`);
            setReservations(resData.data);

            const revData = await api.get(`/reviews/hotel/${hotelId}`);
            setReviews(revData.data);
        } catch (error) {
            console.error('Hotel details fetch error');
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'manager') {
            navigate('/');
            return;
        }
        fetchData();

        // Socket Integration
        const socket = socketService.getSocket();
        
        socket.emit('join_manager_room', user._id);
        
        socket.on('new_reservation_alert', (data) => {
            setNotification(`New booking from ${data.guest} for ${data.hotelName}! Total: ₹${data.amount}`);
            fetchData();
            setTimeout(() => setNotification(null), 5000);
        });

        socket.on('availability_changed', () => {
            fetchData();
        });

        return () => {
            socket.off('new_reservation_alert');
            socket.off('room_status_changed');
        };
    }, [user, navigate]);

    const handleCreateHotel = async (e) => {
        e.preventDefault();
        try {
            const arrAmenities = hotelFormData.amenities.split(',').map(i => i.trim());
            await api.post('/hotels', { ...hotelFormData, amenities: arrAmenities });
            alert('Property registered successfully! Awaiting elite approval.');
            setIsCreating(false);
            setHotelFormData({ name: '', description: '', address: '', city: '', country: '', amenities: '', images: [] });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error registering property');
        }
    };

    const handleRoomAction = async (e) => {
        e.preventDefault();
        try {
            const arrAmenities = roomFormData.amenities.split(',').map(i => i.trim());
            if (roomFormData.id) {
                // Update
                await api.put(`/hotels/${selectedHotel._id}/rooms/${roomFormData.id}`, { ...roomFormData, amenities: arrAmenities });
                alert('Room updated successfully!');
            } else {
                // Add
                await api.post(`/hotels/${selectedHotel._id}/rooms`, { ...roomFormData, amenities: arrAmenities });
                alert('New room tier added!');
            }
            setShowRoomForm(false);
            setRoomFormData({ type: 'Single', pricePerNight: '', capacity: 1, count: 1, amenities: '', images: [], id: null, isMaintenance: false });
            fetchData();
        } catch (err) {
            alert('Error processing room listing');
        }
    };

    const editRoom = (room) => {
        setRoomFormData({
            type: room.type,
            pricePerNight: room.pricePerNight,
            capacity: room.capacity,
            count: room.count,
            amenities: room.amenities.join(', '),
            images: room.images || [],
            id: room._id,
            isMaintenance: room.isMaintenance || false
        });
        setShowRoomForm(true);
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm('De-list this room category?')) return;
        try {
            await api.delete(`/hotels/${selectedHotel._id}/rooms/${roomId}`);
            fetchData();
        } catch (err) {
            alert('Error removing room');
        }
    };

    const handleUpdateHotel = async (e) => {
        e.preventDefault();
        try {
            const arrAmenities = hotelFormData.amenities.split(',').map(i => i.trim());
            await api.put(`/hotels/${selectedHotel._id}`, { ...hotelFormData, amenities: arrAmenities });
            alert('Property details updated!');
            setShowHotelEdit(false);
            const { data } = await api.get(`/hotels/${selectedHotel._id}`);
            setSelectedHotel(data.hotel);
            fetchData();
        } catch (err) {
            alert('Error updating property');
        }
    };

    const startEditHotel = () => {
        setHotelFormData({
            name: selectedHotel.name,
            description: selectedHotel.description,
            address: selectedHotel.address,
            city: selectedHotel.city,
            country: selectedHotel.country,
            amenities: selectedHotel.amenities.join(', '),
            images: selectedHotel.images || []
        });
        setShowHotelEdit(true);
    };

    const submitResponse = async (reviewId) => {
        if (!managerResponse.trim()) return;
        try {
            setResponseLoading(true);
            await api.put(`/reviews/${reviewId}/response`, { managerResponse });
            alert('Your concierge response has been published.');
            setRespondingTo(null);
            setManagerResponse('');
            fetchData();
        } catch (err) {
            alert('Failed to publish response.');
        } finally {
            setResponseLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0AC4E0]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B2D72]"></div>
        </div>
    );

    return (
        <div className="bg-[#0AC4E0] min-h-screen flex font-sans text-white pt-20">
            {/* LIVE ALERT / NOTIFICATION */}
            {(notification || notification) && (
                <div className="fixed top-24 right-8 z-[100] bg-[#0B2D72] text-white px-6 py-3 rounded-xl shadow-2xl animate-in slide-in-from-right-10 font-black text-xs flex items-center gap-3">
                    <span className="animate-pulse">📡</span> {notification}
                </div>
            )}

            {/* SIDEBAR */}
            <aside className="w-72 bg-[#111114] border-r border-gray-800/50 flex flex-col sticky top-20 h-[calc(100vh-5rem)]">
                <div className="p-8 pb-12">
                    <h2 className="text-xl font-serif font-black text-white tracking-tighter uppercase italic">Manager Portal</h2>
                    <p className="text-[10px] font-bold text-white tracking-[0.3em] mt-2">PROPERTY PROTOCOL</p>
                </div>
                
                <nav className="flex-grow px-4 space-y-2">
                    <button 
                        onClick={() => { setActiveTab('hotels'); setIsCreating(false); }}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                            activeTab === 'hotels' 
                            ? 'bg-[#0B2D72] text-white shadow-lg shadow-[#0B2D72]/20' 
                            : 'text-white hover:bg-gray-800 hover:text-white'
                        }`}
                    >
                        <span className="text-lg">🏨</span>
                        My Properties
                    </button>

                    {selectedHotel && (
                        <>
                            <div className="pt-4 pb-2 px-6">
                                <p className="text-[10px] font-bold text-white tracking-[0.3em] uppercase">Managing: {selectedHotel.name}</p>
                            </div>
                            {[
                                { name: 'overview', label: 'Overview', icon: '💎' },
                                { name: 'analytics', label: 'Financials', icon: '📊' },
                                { name: 'rooms', label: 'Inventory', icon: '🏰' },
                                { name: 'reservations', label: 'Reservations', icon: '📝' },
                                { name: 'feedback', label: 'Feedback', icon: '💬' }
                            ].map(link => (
                                <button 
                                    key={link.name}
                                    onClick={() => {
                                        setActiveTab(link.name);
                                        if (link.name === 'analytics') fetchAnalytics(selectedHotel?._id);
                                    }}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                                        activeTab === link.name 
                                        ? 'bg-[#0B2D72] text-white shadow-lg shadow-[#0B2D72]/20' 
                                        : 'text-white hover:bg-gray-800 hover:text-white'
                                    }`}
                                >
                                    <span className="text-lg">{link.icon}</span>
                                    {link.label}
                                </button>
                            ))}
                        </>
                    )}
                </nav>

                <div className="p-8 border-t border-gray-800/50 space-y-4">
                    <button 
                        onClick={() => { setIsCreating(true); setActiveTab('hotels'); setSelectedHotel(null); }}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                    >
                        <span>➕</span> Add New Property
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0B2D72] to-[#0B2D72] flex items-center justify-center text-black font-black">
                            {user?.name?.charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs font-black text-white">{user?.name}</p>
                            <p className="text-[9px] font-bold text-white uppercase tracking-widest">{myHotels.length > 0 ? 'Hotel Manager' : 'New Associate'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-grow p-12 overflow-y-auto">
                {isCreating || (myHotels.length === 0 && !loading) ? (
                    <div className="max-w-3xl mx-auto bg-[#111114] p-12 rounded-[3rem] border border-gray-800/50 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="absolute top-0 right-12 bottom-0 left-0 pointer-events-none opacity-10">
                             <div className="text-[20rem] font-black italic">NEW</div>
                        </div>
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0B2D72]"></div>
                        <div className="flex justify-between items-start mb-8">
                             <h2 className="text-3xl font-serif font-black text-white uppercase tracking-tight italic">Onboard Your Sanctuary</h2>
                             {myHotels.length > 0 && <button onClick={() => setIsCreating(false)} className="text-white hover:text-white transition-colors">✕</button>}
                        </div>
                        <form onSubmit={handleCreateHotel} className="space-y-6">
                            <input required className="w-full p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white transition-all" placeholder="Property Name (e.g. Royal Windsor)" value={hotelFormData.name} onChange={e=>setHotelFormData({...hotelFormData, name: e.target.value})} />
                            <textarea required rows="4" className="w-full p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white transition-all" placeholder="Property Epic/Description" value={hotelFormData.description} onChange={e=>setHotelFormData({...hotelFormData, description: e.target.value})} />
                            <input required className="w-full p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white transition-all" placeholder="Full Address" value={hotelFormData.address} onChange={e=>setHotelFormData({...hotelFormData, address: e.target.value})} />
                            <div className="grid grid-cols-2 gap-6">
                                <input required className="w-full p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white transition-all" placeholder="City" value={hotelFormData.city} onChange={e=>setHotelFormData({...hotelFormData, city: e.target.value})} />
                                <input required className="w-full p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white transition-all" placeholder="Country" value={hotelFormData.country} onChange={e=>setHotelFormData({...hotelFormData, country: e.target.value})} />
                            </div>
                            <input className="w-full p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white transition-all" placeholder="Amenities (WiFi, Spa, Pool...)" value={hotelFormData.amenities} onChange={e=>setHotelFormData({...hotelFormData, amenities: e.target.value})} />
                            
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-white uppercase tracking-widest pl-2">Property Gallery (URLs)</label>
                                {hotelFormData.images.map((img, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input className="flex-grow p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white transition-all" value={img} onChange={e => {
                                            const newImg = [...hotelFormData.images];
                                            newImg[idx] = e.target.value;
                                            setHotelFormData({...hotelFormData, images: newImg});
                                        }} />
                                        <button type="button" onClick={() => {
                                            const newImg = hotelFormData.images.filter((_, i) => i !== idx);
                                            setHotelFormData({...hotelFormData, images: newImg});
                                        }} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">✕</button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setHotelFormData({...hotelFormData, images: [...hotelFormData.images, '']})} className="text-[10px] font-black text-white uppercase tracking-widest hover:text-white transition-colors">＋ Add Image URL</button>
                            </div>

                            <button type="submit" className="w-full bg-[#0B2D72] text-white py-5 rounded-2xl shadow-xl shadow-[#0B2D72]/10 font-black uppercase tracking-[0.2em] mt-4 hover:bg-[#0B2D72] active:scale-[0.98] transition-all">Initiate Registration</button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-12">
                        <header className="mb-12 flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl font-serif font-black text-white tracking-tighter uppercase italic">{activeTab}</h1>
                                <div className="h-1.5 w-24 bg-[#0B2D72] mt-4 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]"></div>
                            </div>
                            {selectedHotel && activeTab !== 'hotels' && (
                                <div className="text-right">
                                     <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Active Property</p>
                                     <p className="text-lg font-serif font-black text-white uppercase italic">{selectedHotel.name}</p>
                                </div>
                            )}
                        </header>
                        
                        {/* TAB: HOTELS LIST */}
                        {activeTab === 'hotels' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {myHotels.map(hotel => (
                                        <div 
                                            key={hotel._id} 
                                            onClick={() => { setSelectedHotel(hotel); fetchHotelDetails(hotel._id); setActiveTab('overview'); }}
                                            className={`group relative bg-[#111114] p-8 rounded-[2.5rem] border transition-all cursor-pointer overflow-hidden ${selectedHotel?._id === hotel._id ? 'border-[#0B2D72] shadow-2xl shadow-[#0B2D72]/10' : 'border-gray-800/50 hover:border-[#0B2D72]/30'}`}
                                        >
                                            <div className="absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg bg-[#0B2D72] text-white">
                                                {hotel.isApproved ? 'Active' : 'Pending'}
                                            </div>
                                            <div className="h-40 bg-[#0AC4E0] rounded-3xl mb-6 overflow-hidden">
                                                <img 
                                                    src={getHotelImage(hotel)} 
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://images.unsplash.com/photo-1542314831-c6a4d27ce66f?auto=format&fit=crop&w=1200&q=80';
                                                    }}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                                />
                                            </div>
                                            <h3 className="text-2xl font-serif font-black text-white uppercase tracking-tighter italic mb-2">{hotel.name}</h3>
                                            <p className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">📍 {hotel.city}</p>
                                            
                                            <div className="mt-8 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Manage Sanctuary →</span>
                                                 <div className="flex gap-2">
                                                      <span className="text-lg grayscale group-hover:grayscale-0">💎</span>
                                                      <span className="text-lg grayscale group-hover:grayscale-0">🏰</span>
                                                 </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div 
                                        onClick={() => { setIsCreating(true); setSelectedHotel(null); }}
                                        className="group bg-[#111114]/50 border-2 border-dashed border-gray-800 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#0B2D72]/50 hover:bg-[#0B2D72]/5 transition-all min-h-[300px]"
                                    >
                                        <div className="w-20 h-20 bg-[#0AC4E0] rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">➕</div>
                                        <p className="text-lg font-serif font-black text-white uppercase italic mb-2 group-hover:text-white">Onboard New Property</p>
                                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Expand your elite collection</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: OVERVIEW */}
                        {activeTab === 'overview' && selectedHotel && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="bg-[#111114] p-10 rounded-[2.5rem] border border-gray-800/50 relative overflow-hidden group">
                                        <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${selectedHotel.isApproved ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-[#0B2D72] text-white shadow-[#0B2D72]/20'}`}>
                                            {selectedHotel.isApproved ? 'Active Sanctuary' : 'Awaiting Approval'}
                                        </div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-4xl font-serif font-black text-white uppercase tracking-tighter italic">{selectedHotel.name}</h3>
                                            <button onClick={startEditHotel} className="text-white font-black text-[10px] uppercase tracking-widest border-b border-transparent hover:border-[#0B2D72] transition-all italic">Edit Property</button>
                                        </div>
                                        <p className="text-white font-bold text-xs uppercase tracking-widest mb-8">📍 {selectedHotel.city}, {selectedHotel.country}</p>
                                        <p className="text-white font-medium leading-relaxed italic border-l-2 border-[#0B2D72] pl-6">"{selectedHotel.description}"</p>
                                    </div>

                                    {showHotelEdit && (
                                        <div className="bg-[#111114] p-10 rounded-[2.5rem] border border-[#0B2D72]/50 shadow-2xl animate-in fade-in zoom-in-95">
                                            <div className="flex justify-between items-center mb-8">
                                                <h4 className="text-xl font-black uppercase tracking-widest text-white italic">Refine Property Details</h4>
                                                <button onClick={() => setShowHotelEdit(false)} className="text-white hover:text-white transition-colors">✕</button>
                                            </div>
                                            <form onSubmit={handleUpdateHotel} className="space-y-6">
                                                <input required className="w-full p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white transition-all" placeholder="Property Name" value={hotelFormData.name} onChange={e=>setHotelFormData({...hotelFormData, name: e.target.value})} />
                                                <textarea required rows="4" className="w-full p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white transition-all" placeholder="Property Epic" value={hotelFormData.description} onChange={e=>setHotelFormData({...hotelFormData, description: e.target.value})} />
                                                <div className="grid grid-cols-2 gap-6">
                                                    <input required className="w-full p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white transition-all" placeholder="City" value={hotelFormData.city} onChange={e=>setHotelFormData({...hotelFormData, city: e.target.value})} />
                                                    <input required className="w-full p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white transition-all" placeholder="Country" value={hotelFormData.country} onChange={e=>setHotelFormData({...hotelFormData, country: e.target.value})} />
                                                </div>
                                                <input className="w-full p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white transition-all" placeholder="Main Property Image URL" value={hotelFormData.images[0] || ''} onChange={e=>{
                                                    const newImgs = [...hotelFormData.images];
                                                    newImgs[0] = e.target.value;
                                                    setHotelFormData({...hotelFormData, images: newImgs});
                                                 }} />
                                                
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black text-white uppercase tracking-widest pl-2">Property Gallery (URLs)</label>
                                                    {hotelFormData.images.map((img, idx) => (
                                                        <div key={idx} className="flex gap-2">
                                                            <input className="flex-grow p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white transition-all" value={img} onChange={e => {
                                                                const newImg = [...hotelFormData.images];
                                                                newImg[idx] = e.target.value;
                                                                setHotelFormData({...hotelFormData, images: newImg});
                                                            }} />
                                                            <button type="button" onClick={() => {
                                                                const newImg = hotelFormData.images.filter((_, i) => i !== idx);
                                                                setHotelFormData({...hotelFormData, images: newImg});
                                                            }} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl transition-all">✕</button>
                                                        </div>
                                                    ))}
                                                    <button type="button" onClick={() => setHotelFormData({...hotelFormData, images: [...hotelFormData.images, '']})} className="text-[10px] font-black text-white uppercase tracking-widest hover:text-white transition-colors">＋ Add Image URL</button>
                                                </div>

                                                <button type="submit" className="w-full bg-[#0B2D72] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-[#0B2D72] transition-all">Authorize Global Updates</button>
                                            </form>
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        <div className="bg-[#111114] border border-gray-800/50 p-8 rounded-[2rem] hover:border-[#0B2D72]/30 transition-all group">
                                            <div className="text-3xl font-serif font-black text-white mb-1">{reservations.length}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-white">Total Reservations</div>
                                        </div>
                                        <div className="bg-[#111114] border border-gray-800/50 p-8 rounded-[2rem] hover:border-[#0B2D72]/30 transition-all group">
                                            <div className="text-3xl font-serif font-black text-white mb-1">{rooms.length}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-white">Active Room Tiers</div>
                                        </div>
                                        <div className="bg-[#111114] border border-gray-800/50 p-8 rounded-[2rem] hover:border-[#0B2D72]/30 transition-all group">
                                            <div className="text-3xl font-serif font-black text-white mb-1">{reviews.length}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-white">Guest Reflections</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#111114] p-8 rounded-[2.5rem] border border-gray-800/50 shadow-sm flex flex-col items-center justify-center text-center">
                                     <div className="w-full h-48 bg-[#0AC4E0] rounded-3xl overflow-hidden mb-6 border border-gray-800">
                                         <img src={getHotelImage(selectedHotel)} className="w-full h-full object-cover" alt="Hotel" />
                                     </div>
                                     <h4 className="font-black uppercase tracking-widest text-[10px] text-white mb-2">Concierge Status</h4>
                                     <p className="text-sm font-bold text-white leading-relaxed italic">{selectedHotel.isApproved ? 'All systems are active. Your sanctuary is discoverable by global travelers.' : 'Our elite curators are reviewing your property. Estimated window: 24-48 hours.'}</p>
                                </div>
                            </div>
                        )}

                        {/* TAB: ANALYTICS */}
                        {activeTab === 'analytics' && selectedHotel && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                                {analyticsLoading ? (
                                    <div className="flex justify-center py-20">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B2D72]"></div>
                                    </div>
                                ) : analytics ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="bg-[#111114] p-8 rounded-[2rem] border border-gray-800/50">
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Total Revenue (Elite)</p>
                                            <div className="text-3xl font-serif font-black text-white italic">₹{analytics.totalRevenue.toLocaleString()}</div>
                                        </div>
                                        <div className="bg-[#111114] p-8 rounded-[2rem] border border-gray-800/50">
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Occupancy Rate</p>
                                            <div className="text-3xl font-serif font-black text-white italic">{analytics.occupancyRate}%</div>
                                        </div>
                                        <div className="bg-[#111114] p-8 rounded-[2rem] border border-gray-800/50">
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Confirmed Bookings</p>
                                            <div className="text-3xl font-serif font-black text-white italic">{analytics.stats.total}</div>
                                        </div>
                                        <div className="bg-[#111114] p-8 rounded-[2rem] border border-gray-800/50">
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Pending Inquiries</p>
                                            <div className="text-3xl font-serif font-black text-rose-500 italic">{analytics.stats.pending}</div>
                                        </div>
                                        
                                        <div className="lg:col-span-4 bg-[#111114] p-10 rounded-[2.5rem] border border-gray-800/50">
                                            <h3 className="text-xl font-black uppercase tracking-widest text-white italic mb-8">Revenue Momentum</h3>
                                            <div className="flex items-end gap-2 h-48">
                                                {analytics.monthlyRevenue.map((m, idx) => {
                                                    const maxRevenue = Math.max(...analytics.monthlyRevenue.map(mr => mr.revenue)) || 1;
                                                    const height = (m.revenue / maxRevenue) * 100;
                                                    return (
                                                        <div key={idx} className="flex-grow flex flex-col items-center gap-4">
                                                            <div className="w-full bg-[#0B2D72]/10 rounded-t-xl relative group transition-all" style={{ height: `${height}%` }}>
                                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] font-black text-white">₹{m.revenue.toLocaleString()}</div>
                                                                <div className="absolute inset-0 bg-[#0B2D72] opacity-20 group-hover:opacity-40 transition-opacity rounded-t-xl"></div>
                                                            </div>
                                                            <span className="text-[10px] font-black text-white uppercase tracking-tighter">{m.month}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-20 text-white italic">No financial intelligence available for this property.</div>
                                )}
                            </div>
                        )}

                        {/* TAB: ROOMS */}
                        {activeTab === 'rooms' && selectedHotel && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                                <div className="flex justify-between items-center bg-[#111114] p-8 rounded-[2rem] border border-gray-800/50">
                                    <h3 className="text-2xl font-serif font-black text-white uppercase tracking-tighter italic">Inventory Management</h3>
                                    <button 
                                        onClick={() => { setShowRoomForm(!showRoomForm); setRoomFormData({ type: 'Single', pricePerNight: '', capacity: 1, count: 1, amenities: '', id: null }); }}
                                        className="bg-[#0B2D72] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0B2D72] transition-all"
                                    >
                                        {showRoomForm ? 'Cancel Operation' : 'Add New Tier'}
                                    </button>
                                </div>

                                {showRoomForm && (
                                    <div className="bg-[#111114] p-10 rounded-[2.5rem] border border-[#0B2D72]/50 shadow-2xl animate-in fade-in zoom-in-95">
                                        <h4 className="text-xl font-black uppercase tracking-widest mb-8 text-white italic">{roomFormData.id ? 'Edit Chamber Tier' : 'New Chamber Category'}</h4>
                                        <form onSubmit={handleRoomAction} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-white pl-2">Suite Type</label>
                                                <select className="w-full p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white text-sm" value={roomFormData.type} onChange={e=>setRoomFormData({...roomFormData, type: e.target.value})}>
                                                    <option value="Single">Single</option>
                                                    <option value="Double">Double</option>
                                                    <option value="Suite">Suite</option>
                                                    <option value="Deluxe">Deluxe</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-white pl-2">Nightly Rate (₹)</label>
                                                <input type="number" required className="w-full p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white text-sm" value={roomFormData.pricePerNight} onChange={e=>setRoomFormData({...roomFormData, pricePerNight: e.target.value})} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-white pl-2">Max Capacity</label>
                                                <input type="number" required className="w-full p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white text-sm" value={roomFormData.capacity} onChange={e=>setRoomFormData({...roomFormData, capacity: e.target.value})} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-white pl-2">Inventory Count</label>
                                                <input type="number" required className="w-full p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white text-sm" value={roomFormData.count} onChange={e=>setRoomFormData({...roomFormData, count: e.target.value})} />
                                            </div>
                                            <div className="md:col-span-2 lg:col-span-4 space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-white pl-2">Amenities</label>
                                                <input className="w-full p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white text-sm" placeholder="WiFi, AC, Mini-bar, Pool View..." value={roomFormData.amenities} onChange={e=>setRoomFormData({...roomFormData, amenities: e.target.value})} />
                                            </div>

                                            {/* ROOM IMAGES */}
                                            <div className="md:col-span-2 lg:col-span-4 space-y-4">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-white pl-2">Room Gallery (URLs)</label>
                                                {roomFormData.images.map((img, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <input className="flex-grow p-4 bg-[#0AC4E0]/50 border border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-bold text-white text-sm" value={img} onChange={e => {
                                                            const newImg = [...roomFormData.images];
                                                            newImg[idx] = e.target.value;
                                                            setRoomFormData({...roomFormData, images: newImg});
                                                        }} />
                                                        <button type="button" onClick={() => {
                                                            const newImg = roomFormData.images.filter((_, i) => i !== idx);
                                                            setRoomFormData({...roomFormData, images: newImg});
                                                        }} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl transition-all">✕</button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => setRoomFormData({...roomFormData, images: [...roomFormData.images, '']})} className="text-[10px] font-black text-white uppercase tracking-widest hover:text-white transition-colors">＋ Add Room Image</button>
                                            </div>

                                            <div className="md:col-span-2 lg:col-span-4 flex items-center gap-4 bg-[#0AC4E0]/50 p-4 rounded-2xl border border-gray-800/50">
                                                <input type="checkbox" id="maintenance" className="w-5 h-5 rounded accent-[#0B2D72]" checked={roomFormData.isMaintenance} onChange={e => setRoomFormData({...roomFormData, isMaintenance: e.target.checked})} />
                                                <label htmlFor="maintenance" className="text-xs font-bold text-white uppercase tracking-widest cursor-pointer">Mark for Maintenance (Blackout Dates)</label>
                                            </div>

                                            <button type="submit" className="md:col-span-2 lg:col-span-4 bg-[#0B2D72] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-[#0B2D72] transition-all">{roomFormData.id ? 'Authorize Updates' : 'Add to Inventory'}</button>
                                        </form>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {rooms.map(room => (
                                        <div key={room._id} className="bg-[#111114] p-8 rounded-[2.5rem] border border-gray-800/50 shadow-lg flex flex-col group transition-all hover:border-[#0B2D72]/30">
                                            <div className="flex justify-between items-start mb-6">
                                                <h4 className="text-2xl font-serif font-black text-white uppercase tracking-tighter italic">{room.type} Suite</h4>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => editRoom(room)} className="p-3 bg-[#0AC4E0] text-white hover:text-white rounded-xl transition-all">✎</button>
                                                    <button onClick={() => handleDeleteRoom(room._id)} className="p-3 bg-[#0AC4E0] text-white hover:text-red-500 rounded-xl transition-all">✕</button>
                                                </div>
                                            </div>
                                            <div className="flex items-end gap-1 mb-6">
                                                <span className="text-4xl font-serif font-black text-white leading-none italic">₹{room.pricePerNight}</span>
                                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest pb-1">/Night</span>
                                            </div>
                                            <div className="space-y-4 text-[10px] font-bold text-white mb-8 flex-grow">
                                                <div className="flex items-center gap-3 bg-[#0AC4E0]/50 p-3 rounded-2xl border border-gray-800/50 italic"><span className="text-lg grayscale group-hover:grayscale-0">👤</span> {room.capacity} GUESTS CAPACITY</div>
                                                <div className="flex items-center gap-3 bg-[#0AC4E0]/50 p-3 rounded-2xl border border-gray-800/50 italic"><span className="text-lg grayscale group-hover:grayscale-0">🏨</span> {room.count} UNITS AVAILABLE</div>
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {room.amenities.map(a => <span key={a} className="bg-[#0B2D72]/10 text-white border border-[#0B2D72]/20 px-3 py-1 rounded-full text-[9px] uppercase font-black italic">{a}</span>)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB: RESERVATIONS */}
                        {activeTab === 'reservations' && selectedHotel && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                                <div className="bg-[#111114] p-10 rounded-[2.5rem] border border-gray-800/50">
                                    <h3 className="text-2xl font-serif font-black text-white uppercase tracking-tighter italic mb-8">Reservation Folio</h3>
                                    {reservations.length === 0 ? (
                                        <div className="text-center py-24 bg-[#0AC4E0]/30 rounded-[2rem] border border-dashed border-gray-800">
                                            <span className="text-6xl mb-6 block grayscale opacity-20">🎫</span>
                                            <p className="font-serif font-black text-gray-600 uppercase tracking-widest italic">No active reservations secured</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-gray-800 pb-4">
                                                        <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-white">Patron</th>
                                                        <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-white">Chamber</th>
                                                        <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-white">Window</th>
                                                        <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-white">Value</th>
                                                        <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-white">Standing</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-800/50">
                                                    {reservations.map(res => (
                                                        <tr key={res._id} className="hover:bg-gray-800/10 transition-colors group">
                                                            <td className="py-8">
                                                                <div className="font-black text-white uppercase tracking-tight italic">{res.userId?.name}</div>
                                                                <div className="text-[9px] font-bold text-gray-600">{res.userId?.email}</div>
                                                            </td>
                                                            <td className="py-8">
                                                                <span className="bg-[#0AC4E0] border border-gray-800 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-white italic">{res.roomId?.type} Suite</span>
                                                            </td>
                                                            <td className="py-8">
                                                                <div className="text-xs font-bold text-white italic">
                                                                    {new Date(res.checkIn).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'2-digit'})} 
                                                                    <span className="mx-2 text-gray-700">—</span> 
                                                                    {new Date(res.checkOut).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'2-digit'})}
                                                                </div>
                                                            </td>
                                                            <td className="py-8">
                                                                <div className="text-sm font-black text-white italic">₹{res.totalAmount.toLocaleString()}</div>
                                                            </td>
                                                            <td className="py-8">
                                                                <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border italic ${
                                                                    res.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                                                    res.status === 'Pending' ? 'bg-[#0B2D72]/10 text-white border-[#0B2D72]/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                                }`}>
                                                                    {res.status}
                                                                </span>
                                                                {res.status === 'Confirmed' && res.paymentStatus === 'Paid' && (
                                                                    <div className="mt-2">
                                                                        <RefundButton 
                                                                            bookingId={res._id} 
                                                                            onRefundSuccess={() => fetchData()} 
                                                                        />
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB: FEEDBACK */}
                        {activeTab === 'feedback' && selectedHotel && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                                <div className="bg-[#111114] p-10 rounded-[2.5rem] border border-gray-800/50">
                                    <h3 className="text-2xl font-serif font-black text-white uppercase tracking-tighter italic mb-8">Guest Reflections</h3>
                                    
                                    {reviews.length === 0 ? (
                                        <div className="text-center py-24 bg-[#0AC4E0]/30 rounded-[2rem] border border-dashed border-gray-800">
                                            <span className="text-6xl mb-6 block grayscale opacity-20">💬</span>
                                            <p className="font-serif font-black text-gray-600 uppercase tracking-widest italic">No guest reflections recorded yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {reviews.map(review => (
                                                <div key={review._id} className="p-10 bg-[#0AC4E0]/40 border border-gray-800/50 rounded-[2.5rem] hover:border-[#0B2D72]/20 transition-all">
                                                    <div className="flex justify-between items-start mb-8">
                                                        <div>
                                                            <div className="text-white text-2xl mb-2 italic">
                                                                {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                                                            </div>
                                                            <h4 className="font-black text-white uppercase tracking-tight text-xl italic">{review.userId?.name}</h4>
                                                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString(undefined, {month:'long', day:'numeric', year:'numeric'})}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-full italic">Elite Guest</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <p className="text-white font-medium italic mb-10 border-l-2 border-gray-800 pl-8 leading-relaxed text-lg">"{review.comment}"</p>

                                                    {review.managerResponse ? (
                                                        <div className="bg-[#0B2D72]/5 p-8 rounded-[2rem] border border-[#0B2D72]/20">
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <span className="text-lg grayscale">🤵</span>
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">Concierge Response</span>
                                                            </div>
                                                            <p className="text-base font-bold text-white leading-relaxed italic">"{review.managerResponse}"</p>
                                                        </div>
                                                    ) : (
                                                        respondingTo === review._id ? (
                                                            <div className="bg-[#0AC4E0] border border-[#0B2D72]/30 p-8 rounded-[2.5rem] animate-in slide-in-from-top-4">
                                                                <textarea 
                                                                    className="w-full p-6 bg-[#0AC4E0]/40 border-2 border-gray-800 rounded-2xl focus:border-[#0B2D72] outline-none font-medium text-white italic mb-6 resize-none transition-all"
                                                                    placeholder="Compose your elegant concierge response..."
                                                                    rows="4"
                                                                    value={managerResponse}
                                                                    onChange={(e) => setManagerResponse(e.target.value)}
                                                                />
                                                                <div className="flex gap-4">
                                                                    <button 
                                                                        onClick={() => submitResponse(review._id)}
                                                                        disabled={responseLoading}
                                                                        className="bg-[#0B2D72] text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0B2D72] transition-all active:scale-95 disabled:opacity-50"
                                                                    >
                                                                        {responseLoading ? 'Publishing...' : 'Publish Response'}
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => setRespondingTo(null)}
                                                                        className="text-white hover:text-white text-[10px] font-black uppercase tracking-widest px-8 transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={() => setRespondingTo(review._id)}
                                                                className="text-white font-black text-[10px] uppercase tracking-widest border-b border-transparent hover:border-[#0B2D72] transition-all outline-none italic"
                                                            >
                                                                Provide Concierge Response
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </main>
        </div>
    );
};

export default ManagerDashboard;
