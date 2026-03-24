import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, AuthContext } from '../context/AuthContext';
import socketService from '../utils/socket';
import { getHotelImage, DEFAULT_PLACEHOLDER } from '../utils/imageHelper';
import { MapPin, Star, Wifi, Coffee, Wind, Tv, Shield, Users, Calendar, Award, Box, Sparkles, ChevronRight, Zap } from 'lucide-react';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [mainImage, setMainImage] = useState('');
  const [availability, setAvailability] = useState(null); // { available: boolean, remainingCount: number }
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        const [{ data: hotelData }, { data: reviewData }, { data: promoData }] = await Promise.all([
          api.get(`/hotels/${id}`),
          api.get(`/reviews/hotel/${id}`),
          api.get('/promotions/public')
        ]);

        if (hotelData.hotel) {
          setHotel(hotelData.hotel);
          // Use the first real DB image if it exists, otherwise fall back to the hash-based gallery image
          const firstImage = hotelData.hotel.images?.[0] || getHotelImage(hotelData.hotel);
          setMainImage(firstImage);
        }

        if (hotelData.rooms && hotelData.rooms.length > 0) {
          setRooms(hotelData.rooms);
          setSelectedRoomId(hotelData.rooms[0]._id);
        }
        
        if (reviewData) {
          setReviews(reviewData);
        }
        
        if (promoData) {
          const hotelPromos = promoData.filter(promo => !promo.hotelId || promo.hotelId._id === id);
          setPromotions(hotelPromos);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();

    const socket = socketService.getSocket();
    socket.emit('join_hotel_room', id);
    socket.on('booking_confirmed', fetchHotelData);
    socket.on('room_added', fetchHotelData);
    socket.on('availability_changed', fetchHotelData);

    return () => {
        socket.off('booking_confirmed');
    };
  }, [id]);

  useEffect(() => {
    const checkRoomAvailability = async () => {
      if (!checkIn || !checkOut || !selectedRoomId || !user) {
        setAvailability(null);
        return;
      }

      if (new Date(checkIn) >= new Date(checkOut)) {
        setAvailability(null);
        return;
      }

      try {
        setCheckingAvailability(true);
        const { data } = await api.post('/bookings/check-availability', {
          roomId: selectedRoomId,
          checkIn,
          checkOut
        });
        setAvailability(data);
      } catch (error) {
        console.error('Availability check failed:', error);
        setAvailability(null);
      } finally {
        setCheckingAvailability(false);
      }
    };

    const timeoutId = setTimeout(checkRoomAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [checkIn, checkOut, selectedRoomId, user]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!user) {
      navigate('/login');
      return;
    }

    if (!checkIn || !checkOut || !selectedRoomId) {
      setBookingError('Kindly select your desired window and chamber tier.');
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      setBookingError('The departure must follow the arrival.');
      return;
    }

    try {
      setBookingLoading(true);
      const { data } = await api.post('/bookings', {
        hotelId: id,
        roomId: selectedRoomId,
        checkIn,
        checkOut,
        guests: parseInt(adults) + parseInt(children),
        adults: parseInt(adults),
        children: parseInt(children)
      });
      navigate(`/payment/${data._id}`);
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Protocol failure. Check availability.');
    } finally {
      setBookingLoading(false);
    }
  };

  const getAmenityIcon = (name) => {
    const icons = {
      'WiFi': <Wifi size={18} />,
      'Breakfast': <Coffee size={18} />,
      'AC': <Wind size={18} />,
      'TV': <Tv size={18} />,
      'Spa': <Sparkles size={18} />,
      'Gym': <Zap size={18} />,
      'Pool': <Box size={18} />,
      'Parking': <MapPin size={18} />
    };
    return icons[name] || <Shield size={18} />;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-gold-500 mb-8"></div>
        <p className="text-gold-500 font-black uppercase tracking-[0.4em] animate-pulse text-xs">Awaiting Perfection</p>
      </div>
    </div>
  );

  if (!hotel) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] text-white">
      <div className="text-center p-12 border border-white/5 rounded-[3rem]">
        <h2 className="text-4xl font-serif font-black mb-4 italic">Sanctuary Undiscovered</h2>
        <button onClick={() => navigate('/hotels')} className="text-gold-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">Return to Collections</button>
      </div>
    </div>
  );

  const selectedRoom = rooms.find(r => r._id === selectedRoomId);

  return (
    <div className="bg-[#0a0a0b] min-h-screen text-white pt-20 overflow-x-hidden">
      
      {/* Cinematic Hero */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 flex transition-transform duration-1000 ease-in-out" 
          style={{ 
            transform: `translateX(-${(() => {
              const gallery = (hotel.images?.length > 0 ? hotel.images : [getHotelImage(hotel)]);
              const index = gallery.indexOf(mainImage);
              return index === -1 ? 0 : index * 100;
            })()}%)` 
          }}
        >
            {(hotel.images?.length > 0 ? hotel.images : [getHotelImage(hotel)]).map((img, i) => (
                <img 
                  key={i} 
                  src={img} 
                  className="w-full h-full object-cover flex-shrink-0" 
                  alt={hotel.name} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_PLACEHOLDER;
                  }}
                />
            ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/40 to-transparent"></div>
        
        <div className="absolute bottom-12 left-0 w-full p-4 md:p-16 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12 z-10">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom duration-1000">
            <div className="flex items-center gap-4 mb-8">
              <span className="w-8 h-[1px] bg-gold-500"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-500">Navan Certified Hotel</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif font-black mb-8 uppercase tracking-tighter leading-[0.85] italic">{hotel.name}</h1>
            <div className="flex flex-wrap items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              <span className="flex items-center gap-2"><MapPin size={14} className="text-gold-500" /> {hotel.city}, {hotel.country}</span>
              <span className="flex items-center gap-2 font-serif italic text-gold-500 tracking-normal text-base"><Star size={14} className="fill-gold-500" /> {hotel.rating?.toFixed(1) || 'NEW'} Elite Score</span>
            </div>
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap gap-4 p-4 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] animate-in fade-in slide-in-from-right duration-1000">
            {(hotel.images?.length > 0 ? hotel.images : [getHotelImage(hotel)]).slice(0, 4).map((img, i) => (
              <button 
                key={i} 
                onClick={() => setMainImage(img)}
                className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-500 flex-shrink-0 ${mainImage === img ? 'border-gold-500 scale-110 shadow-2xl shadow-gold-500/20' : 'border-white/5 opacity-40 hover:opacity-100'}`}
              >
                <img 
                  src={img} 
                  className="w-full h-full object-cover" 
                  alt="thumbnail" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_PLACEHOLDER;
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-16 py-32 grid grid-cols-1 lg:grid-cols-12 gap-24">
        
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-32">
          
          {/* Narrative */}
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gold-500 mb-12 flex items-center gap-4">
              <span className="w-4 h-4 rounded-full border border-gold-500/30 flex items-center justify-center"><span className="w-1 h-1 bg-gold-500 rounded-full"></span></span>
              The Narrative
            </h2>
            <div className="text-xl md:text-2xl font-serif text-gray-400 leading-relaxed italic border-l-2 border-gold-500/20 pl-12">
              {hotel.description.split('\n').map((para, i) => <p key={i} className="mb-6">{para}</p>)}
            </div>
          </section>

          {/* Promotional Offers */}
          {promotions.length > 0 && (
            <section>
               <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gold-500 mb-12 flex items-center gap-4">
                 <span className="w-4 h-4 rounded-full border border-gold-500/30 flex items-center justify-center"><span className="w-1 h-1 bg-gold-500 rounded-full"></span></span>
                 Active Protocols
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {promotions.map((promo) => (
                   <div key={promo._id} className="p-8 bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/30 rounded-[2rem] relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-bl-full group-hover:scale-125 transition-transform duration-700"></div>
                     <div className="flex justify-between items-start mb-4 relative z-10">
                       <span className="text-3xl font-serif font-black text-white italic tracking-tighter">
                         {promo.discount}{promo.type === 'percentage' ? '%' : ' INR'} <span className="text-gold-500 text-xl">OFF</span>
                       </span>
                       <span className="bg-gold-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-gold-500 shadow-xl shadow-gold-500/20">
                         {promo.code}
                       </span>
                     </div>
                     <p className="text-sm font-medium text-gray-400 font-serif italic mb-6 relative z-10">"{promo.description}"</p>
                     
                     <div className="flex justify-between items-center relative z-10 border-t border-gold-500/20 pt-4 mt-auto">
                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                          Valid Until
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gold-500">
                          {new Date(promo.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
            </section>
          )}

          {/* Amenities Grid */}
          <section>
             <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gold-500 mb-12">Curated Provisions</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {(hotel.amenities || []).map(amenity => (
                 <div key={amenity} className="group p-8 bg-[#111113] border border-white/5 rounded-[2rem] hover:border-gold-500/30 transition-all flex flex-col items-center text-center gap-5">
                   <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-gold-500 group-hover:scale-110 transition-transform">
                     {getAmenityIcon(amenity)}
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gold-500 transition-colors">{amenity}</span>
                 </div>
               ))}
             </div>
          </section>

          {/* Chamber Tiers */}
          <section>
             <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gold-500 mb-12">Chamber Tiers</h2>
             <div className="space-y-8">
               {rooms.length === 0 ? (
                 <div className="p-20 bg-[#111113] rounded-[3rem] border border-white/5 text-center">
                   <p className="text-gray-500 font-serif italic text-xl">No chambers currently available for reservation.</p>
                 </div>
               ) : (
                 rooms.map(room => (
                    <div 
                      key={room._id} 
                      onClick={() => !room.isMaintenance && setSelectedRoomId(room._id)}
                      className={`group flex flex-col md:flex-row gap-8 p-8 rounded-[3rem] border transition-all duration-700 ${
                        room.isMaintenance 
                          ? 'opacity-40 cursor-not-allowed border-white/5 bg-transparent' 
                          : selectedRoomId === room._id 
                            ? 'bg-gold-500 border-gold-500 text-black shadow-2xl shadow-gold-500/20 translate-x-4' 
                            : 'bg-[#111113] border-white/5 hover:border-gold-500/30 cursor-pointer'
                      }`}
                    >
                      <div className="w-full md:w-80 h-60 rounded-[2rem] overflow-hidden relative group-hover:shadow-2xl transition-all">
                        <img 
                          src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                          alt={room.type}
                        />
                        {room.isMaintenance && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white border border-white/20 px-4 py-2 rounded-full italic">Refining</span>
                            </div>
                        )}
                      </div>
                      
                      <div className="flex-grow flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                             <h3 className={`text-3xl font-serif font-black uppercase tracking-tight italic mb-2 ${selectedRoomId === room._id ? 'text-black' : 'text-white'}`}>{room.type} Suite</h3>
                             <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${selectedRoomId === room._id ? 'text-black/60' : 'text-gray-500'}`}>Capacity: {room.adults || 1} ADULTS, {room.children || 0} KIDS</p>
                          </div>
                          {!room.isMaintenance && (
                             <div className="text-right">
                                <span className="text-4xl font-serif font-black tracking-tighter italic block leading-none">₹{room.pricePerNight}</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${selectedRoomId === room._id ? 'text-black/50' : 'text-gray-600'}`}>per night</span>
                             </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mt-auto">
                           {selectedRoomId === room._id && !room.isMaintenance && (
                             <span className="text-[9px] font-black uppercase tracking-widest bg-black text-white px-4 py-2 rounded-full border border-black/10">Active Choice</span>
                           )}
                           <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${
                             room.isMaintenance 
                               ? 'border-white/10 text-gray-500' 
                               : selectedRoomId === room._id 
                                 ? 'border-black/20 text-black font-black' 
                                 : 'border-white/10 text-gold-500'
                           }`}>
                             {room.isMaintenance ? 'Unavailable' : room.count > 0 ? 'Protocol Ready' : 'Fully Committed'}
                           </span>
                        </div>
                      </div>
                    </div>
                 ))
               )}
             </div>
          </section>

          {/* Testimonials */}
          <section className="bg-[#111113] p-16 rounded-[4rem] border border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[120px] pointer-events-none"></div>
             
             <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-10">
                <div className="animate-in fade-in slide-in-from-left duration-1000">
                   <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gold-500 mb-4">Customer Reflections</h2>
                   <p className="text-5xl font-serif font-black italic tracking-tighter">Voices of the Journey</p>
                </div>
                <div className="text-right">
                   <div className="text-7xl font-serif font-black text-gold-500 leading-none mb-2">{hotel.rating?.toFixed(1) || 'NEW'}</div>
                   <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Global Luxury Score</div>
                </div>
             </div>

             {reviews.length === 0 ? (
               <p className="text-gray-500 italic font-serif text-2xl border-l-[3px] border-gold-500/30 pl-10 py-4">Be the first to script your narrative in this refined sanctuary.</p>
             ) : (
               <div className="space-y-10">
                 {reviews.map(rev => (
                   <div key={rev._id} className="p-12 bg-black/40 rounded-[3rem] border border-white/5 hover:border-gold-500/20 transition-all group">
                     <div className="flex items-center gap-8 mb-10">
                        <div className="w-16 h-16 rounded-full bg-gold-500 text-black flex items-center justify-center font-black text-2xl shadow-xl shadow-gold-500/20">
                          {rev.userId?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                           <div className="font-black uppercase tracking-[0.3em] text-sm text-white mb-2">{rev.userId?.name}</div>
                           <div className="flex text-gold-500 gap-1">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} size={14} className={i < rev.rating ? 'fill-gold-500 text-gold-500' : 'text-gray-700'} />
                             ))}
                           </div>
                        </div>
                        <div className="ml-auto hidden md:block">
                           <span className="text-[8px] font-black uppercase tracking-[0.4em] bg-white/5 border border-white/10 px-6 py-3 rounded-full text-gray-500">Verified Experience</span>
                        </div>
                     </div>
                     
                     <p className="text-gray-400 italic font-serif text-xl leading-relaxed mb-10 pl-10 border-l border-gold-500/20">
                        "{rev.comment}"
                     </p>

                     {rev.managerResponse && (
                        <div className="mt-10 bg-gold-500/5 p-10 rounded-[2.5rem] border border-gold-500/10">
                           <div className="flex items-center gap-4 mb-6">
                              <Award size={18} className="text-gold-500" />
                              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gold-500">Curator Response</span>
                           </div>
                           <p className="text-base text-gold-100 font-serif leading-relaxed italic opacity-80">
                              "{rev.managerResponse}"
                           </p>
                        </div>
                     )}
                   </div>
                 ))}
               </div>
             )}
          </section>

        </div>

        {/* Sidebar Booking */}
        <aside className="lg:col-span-4">
          <div className="sticky top-32 bg-[#111113] border border-white/5 rounded-[4rem] p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50"></div>
             
             <h3 className="text-2xl font-serif font-black text-center uppercase tracking-tight italic mb-2">Reserve Stay</h3>
             <p className="text-[10px] font-black text-gray-500 text-center uppercase tracking-[0.5em] mb-12">Elite Protocol</p>

             <form onSubmit={handleBooking} className="space-y-10">
                <div className="space-y-4">
                   <label className="text-[9px] font-black uppercase tracking-[0.4em] text-gold-500 pl-4 font-serif italic">Check-In Arrival</label>
                   <div className="relative group">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-gold-500 transition-transform group-focus-within:scale-110" size={16} />
                      <input 
                        type="date" required min={new Date().toISOString().split('T')[0]}
                        value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 pl-16 text-sm font-black color-scheme-dark outline-none focus:border-gold-500 transition-all"
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[9px] font-black uppercase tracking-[0.4em] text-gold-500 pl-4 font-serif italic">Check-Out Departure</label>
                   <div className="relative group">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-gold-500 transition-transform group-focus-within:scale-110" size={16} />
                      <input 
                        type="date" required min={checkIn || new Date().toISOString().split('T')[0]}
                        value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 pl-16 text-sm font-black color-scheme-dark outline-none focus:border-gold-500 transition-all"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                     <label className="text-[9px] font-black uppercase tracking-[0.4em] text-gold-500 pl-4 font-serif italic">Adults</label>
                     <div className="relative group">
                        <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-gold-500 transition-transform group-focus-within:scale-110" size={16} />
                        <input 
                          type="number" min="1" required 
                          value={adults} onChange={(e) => setAdults(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 pl-16 text-sm font-black outline-none focus:border-gold-500 transition-all"
                        />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[9px] font-black uppercase tracking-[0.4em] text-gold-500 pl-4 font-serif italic">Children</label>
                     <div className="relative group">
                        <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-gold-500 transition-transform group-focus-within:scale-110" size={16} />
                        <input 
                          type="number" min="0" required 
                          value={children} onChange={(e) => setChildren(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 pl-16 text-sm font-black outline-none focus:border-gold-500 transition-all"
                        />
                     </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[9px] font-black uppercase tracking-[0.4em] text-gold-500 pl-4 font-serif italic">Tier Selection</label>
                   <div className="relative group">
                      <Box className="absolute left-6 top-1/2 -translate-y-1/2 text-gold-500 transition-transform group-focus-within:scale-110" size={16} />
                      <select 
                        value={selectedRoomId} 
                        onChange={(e) => setSelectedRoomId(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 pl-16 text-sm font-black outline-none focus:border-gold-500 transition-all appearance-none cursor-pointer"
                        required
                      >
                        <option value="" disabled className="bg-[#0a0a0b]">Select Tier</option>
                        {rooms.map(r => (
                          <option key={r._id} value={r._id} className="bg-[#111113] text-white">
                            {r.type} — ₹{r.pricePerNight}
                          </option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 rotate-90" size={16} />
                   </div>
                </div>

                {checkingAvailability && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/10 animate-pulse">
                    <div className="w-2 h-2 bg-gold-500 rounded-full animate-ping"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Scanning Availability Hub...</span>
                  </div>
                )}

                {availability !== null && !checkingAvailability && (
                  <div className={`p-5 rounded-2xl border flex flex-col gap-1 ${
                    availability.available 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${availability.available ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                        {availability.available ? 'Sanctuary Available' : 'Chamber Fully Committed'}
                      </span>
                    </div>
                    <p className="text-[9px] opacity-60 uppercase tracking-widest font-serif italic">
                      {availability.available 
                        ? `${availability.remainingCount} of ${availability.totalCount} tiers remaining for these dates`
                        : 'No availability remains for the selected window'}
                    </p>
                  </div>
                )}

                {bookingError && <div className="p-5 bg-red-500/10 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 animate-pulse">{bookingError}</div>}

                <div className="pt-8 border-t border-white/5">
                   <div className="flex justify-between items-center mb-10">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-serif italic">Est. Journey Value</span>
                      <div className="text-right">
                         <div className="text-4xl font-serif font-black text-gold-500 italic leading-none">
                            ₹{(selectedRoom?.pricePerNight || 0) * (checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))) : 1)}
                         </div>
                      </div>
                   </div>

                   <button 
                     type="submit" 
                     disabled={bookingLoading || !selectedRoomId || (availability && !availability.available) || checkingAvailability}
                     className="w-full py-6 bg-gold-500 text-black font-black uppercase tracking-[0.5em] rounded-2xl hover:bg-white hover:shadow-2xl hover:shadow-gold-500/30 transition-all transform active:scale-95 disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500 text-[10px]"
                   >
                     {bookingLoading ? 'Authorizing...' : checkingAvailability ? 'Synchronizing...' : (availability && !availability.available) ? 'No Space' : 'Book Protocol'}
                   </button>
                </div>
             </form>
          </div>
          
          <div className="mt-12 p-10 bg-gradient-to-br from-gold-500/5 to-transparent border border-white/5 rounded-[3rem] text-center">
             <Award size={32} className="text-gold-500 mx-auto mb-6" />
             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 leading-relaxed italic">
               Best Rate Pursuit • Member Access • Digital Concierge Ready
             </p>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default HotelDetails;
