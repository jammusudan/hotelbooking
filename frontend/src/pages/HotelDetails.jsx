import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, AuthContext } from '../context/AuthContext';
import socketService from '../utils/socket';
import { getHotelImage, DEFAULT_PLACEHOLDER } from '../utils/imageHelper';
import { MapPin, Star, Wifi, Coffee, Wind, Tv, Shield, Users, Calendar, Award, Box, Sparkles, ChevronRight, Zap, X } from 'lucide-react';

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

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to submit a review.');
      return;
    }
    try {
      setReviewLoading(true);
      await api.post(`/reviews/hotel/${id}`, reviewForm);
      alert('Your review has been recorded. Thank you for your feedback.');
      setIsReviewModalOpen(false);
      setReviewForm({ rating: 5, comment: '' });
      const { data } = await api.get(`/reviews/hotel/${id}`);
      setReviews(data);
    } catch (error) {
      alert(error.response?.data?.message || 'Submission failed');
    } finally {
      setReviewLoading(false);
    }
  };

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
    <div className="min-h-screen flex items-center justify-center bg-[#EDF7BD]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-transparent mb-8"></div>
        <p className="text-black font-black uppercase tracking-[0.4em] animate-pulse text-xs">Awaiting Perfection</p>
      </div>
    </div>
  );

  if (!hotel) return (
    <div className="min-h-screen flex items-center justify-center bg-[#EDF7BD] text-black">
      <div className="text-center p-12 border border-white/5 rounded-[3rem]">
        <h2 className="text-4xl font-serif font-black mb-4 italic">Sanctuary Undiscovered</h2>
        <button onClick={() => navigate('/hotels')} className="text-black font-black uppercase tracking-widest text-[10px] hover:text-black transition-colors">Return to Collections</button>
      </div>
    </div>
  );

  const selectedRoom = rooms.find(r => r._id === selectedRoomId);

  return (
    <div className="bg-[#EDF7BD] min-h-screen text-black pt-16 md:pt-20 overflow-x-hidden">
      
      {/* Cinematic Hero */}
      <div className="relative h-[60vh] md:h-[85vh] w-full overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#EDF7BD] via-[#EDF7BD]/40 to-transparent"></div>
        
        <div className="absolute bottom-6 md:bottom-12 left-0 w-full p-6 md:p-16 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12 z-10">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom duration-1000">
            <div className="flex items-center gap-4 mb-4 md:mb-8">
              <span className="w-6 md:w-8 h-[1px] bg-black/30"></span>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-black/60">Navan Certified Hotel</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-serif font-black mb-6 md:mb-8 uppercase tracking-tighter leading-tight md:leading-[0.85] italic text-[#003049]">{hotel.name}</h1>
            <div className="flex flex-wrap items-center gap-6 md:gap-10 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-black/80">
              <span className="flex items-center gap-2"><MapPin size={14} className="text-[#003049]" /> {hotel.city}, {hotel.country}</span>
              <span className="flex items-center gap-2 font-serif italic text-black tracking-normal text-sm md:text-base"><Star size={14} className="text-[#003049] fill-[#003049]" /> {hotel.rating?.toFixed(1) || 'NEW'} Elite Score</span>
            </div>
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap gap-3 md:gap-4 p-3 md:p-4 bg-white/40 backdrop-blur-3xl border border-black/5 rounded-[2rem] md:rounded-[2.5rem] animate-in fade-in slide-in-from-right duration-1000">
            {(hotel.images?.length > 0 ? hotel.images : [getHotelImage(hotel)]).slice(0, 4).map((img, i) => (
              <button 
                key={i} 
                onClick={() => setMainImage(img)}
                className={`w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all duration-500 flex-shrink-0 ${mainImage === img ? 'border-[#003049] scale-110 shadow-2xl' : 'border-transparent opacity-40 hover:opacity-100'}`}
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

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-16 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-24 md:space-y-32">
          
          {/* Narrative */}
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/40 mb-10 md:mb-12 flex items-center gap-4">
              <span className="w-4 h-4 rounded-full border border-black/20 flex items-center justify-center"><span className="w-1 h-1 bg-black/60 rounded-full"></span></span>
              The Narrative
            </h2>
            <div className="text-lg md:text-2xl font-serif text-[#003049] leading-relaxed italic border-l-2 border-[#003049]/10 pl-8 md:pl-12">
              {hotel.description.split('\n').map((para, i) => <p key={i} className="mb-6 leading-relaxed">"{para}"</p>)}
            </div>
          </section>

          {/* Promotional Offers */}
          {promotions.length > 0 && (
            <section>
               <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/40 mb-10 md:mb-12 flex items-center gap-4">
              <span className="w-4 h-4 rounded-full border border-black/20 flex items-center justify-center"><span className="w-1 h-1 bg-black/60 rounded-full"></span></span>
                 Active Protocols
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {promotions.map((promo) => (
                   <div key={promo._id} className="p-8 bg-[#003049] border border-white/5 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full group-hover:scale-125 transition-transform duration-700"></div>
                     <div className="flex justify-between items-start mb-6 relative z-10">
                       <span className="text-3xl font-serif font-black text-[#EDF7BD] italic tracking-tighter">
                         {promo.discount}{promo.type === 'percentage' ? '%' : ' INR'} <span className="text-[#EDF7BD]/60 text-xl">OFF</span>
                       </span>
                       <span className="bg-transparent text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-white/10 shadow-xl">
                         {promo.code}
                       </span>
                     </div>
                     <p className="text-sm font-medium text-white/70 font-serif italic mb-8 relative z-10 leading-relaxed">"{promo.description}"</p>
                     
                     <div className="flex justify-between items-center relative z-10 border-t border-white/5 pt-6 mt-auto">
                        <div className="text-[9px] font-black uppercase tracking-widest text-[#EDF7BD]/40">
                          Valid Until
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">
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
             <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#003049]/40 mb-10 md:mb-12">Curated Provisions</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
               {(hotel.amenities || []).map(amenity => (
                 <div key={amenity} className="group p-6 md:p-8 bg-white/40 border border-black/5 rounded-[2rem] hover:bg-[#003049] hover:border-transparent transition-all flex flex-col items-center text-center gap-4 md:gap-5 shadow-sm hover:shadow-2xl">
                   <div className="w-12 h-12 md:w-14 md:h-14 bg-[#003049]/5 rounded-2xl flex items-center justify-center text-[#003049] group-hover:bg-white/10 group-hover:text-[#EDF7BD] group-hover:scale-110 transition-all">
                     {getAmenityIcon(amenity)}
                   </div>
                   <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#003049] group-hover:text-[#EDF7BD] transition-colors">{amenity}</span>
                 </div>
               ))}
             </div>
          </section>

          {/* Chamber Tiers */}
          <section id="chamber-section">
             <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#003049]/40 mb-10 md:mb-12">Chamber Tiers</h2>
             <div className="space-y-6 md:space-y-8">
               {rooms.length === 0 ? (
                 <div className="p-20 bg-white/40 rounded-[3rem] border border-black/5 text-center shadow-sm">
                   <p className="text-[#003049]/60 font-serif italic text-xl">No chambers currently available for reservation.</p>
                 </div>
               ) : (
                 rooms.map(room => (
                    <div 
                      key={room._id} 
                      onClick={() => !room.isMaintenance && setSelectedRoomId(room._id)}
                      className={`group flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border transition-all duration-700 ${room.isMaintenance ? 'opacity-40 cursor-not-allowed border-black/5 bg-transparent' : selectedRoomId === room._id ? 'bg-[#003049] border-white/20 text-white shadow-3xl scale-[1.02]' : 'bg-white/60 border-black/5 shadow-sm cursor-pointer hover:bg-white/80'}`}
                    >
                      <div className="w-full md:w-72 h-48 md:h-60 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden relative group-hover:shadow-2xl transition-all">
                        <img 
                          src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                          alt={room.type}
                        />
                        {room.isMaintenance && (
                            <div className="absolute inset-0 bg-[#EDF7BD]/90 flex items-center justify-center backdrop-blur-sm">
                                <span className="text-[8px] font-black uppercase tracking-widest text-[#003049] border border-[#003049]/20 px-4 py-2 rounded-full italic">Refining</span>
                            </div>
                        )}
                      </div>
                      
                      <div className="flex-grow flex flex-col justify-center">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                          <div>
                             <h3 className={`text-2xl md:text-3xl font-serif font-black uppercase tracking-tight italic mb-2 ${selectedRoomId === room._id ? 'text-[#EDF7BD]' : 'text-[#003049]'}`}>{room.type} Suite</h3>
                             <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] ${selectedRoomId === room._id ? 'text-white/60' : 'text-[#003049]/40'}`}>Capacity: {room.adults || 1} ADULTS, {room.children || 0} KIDS</p>
                          </div>
                          {!room.isMaintenance && (
                             <div className="text-left sm:text-right">
                                <span className={`text-3xl md:text-4xl font-serif font-black tracking-tighter italic block leading-none ${selectedRoomId === room._id ? 'text-white' : 'text-[#003049]'}`}>₹{room.pricePerNight}</span>
                                <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${selectedRoomId === room._id ? 'text-[#EDF7BD]/40' : 'text-[#003049]/30'}`}>per night</span>
                             </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-3 mt-auto">
                           {selectedRoomId === room._id && !room.isMaintenance && (
                             <span className="text-[8px] font-black uppercase tracking-widest bg-[#EDF7BD] text-[#003049] px-4 py-2 rounded-full border border-black/10">Active Choice</span>
                           )}
                           <span className={`text-[8px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${
                             room.isMaintenance 
                               ? 'border-black/5 text-[#003049]/20' 
                               : selectedRoomId === room._id 
                                 ? 'border-[#EDF7BD]/20 text-[#EDF7BD] font-black' 
                                 : 'border-[#003049]/10 text-[#003049]/60'
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
          <section className="bg-[#003049] p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] border border-white/10 relative overflow-hidden shadow-3xl">
             <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[120px] pointer-events-none"></div>
             
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-8 md:gap-10">
                <div className="animate-in fade-in slide-in-from-left duration-1000">
                   <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#EDF7BD]/40 mb-4">Customer Reflections</h2>
                   <p className="text-4xl md:text-5xl font-serif font-black italic tracking-tighter text-white">Voices of the Journey</p>
                </div>
                <div className="flex items-center gap-8 md:gap-10 w-full md:w-auto">
                   <button onClick={() => setIsReviewModalOpen(true)} className="flex-grow md:flex-none bg-[#EDF7BD] text-[#003049] px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-white transition-all shadow-xl active:scale-95">Script Narrative</button>
                   <div className="text-right">
                      <div className="text-5xl md:text-7xl font-serif font-black text-[#EDF7BD] leading-none mb-2">{hotel.rating?.toFixed(1) || 'NEW'}</div>
                      <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[#EDF7BD]/40">Luxury Score</div>
                   </div>
                </div>
             </div>

             {reviews.length === 0 ? (
               <p className="text-white/60 italic font-serif text-xl border-l-[3px] border-white/10 pl-10 py-4 leading-relaxed">Be the first to script your narrative in this refined sanctuary.</p>
             ) : (
               <div className="space-y-8 md:space-y-10">
                 {reviews.map(rev => (
                   <div key={rev._id} className="p-8 md:p-12 bg-white/5 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 hover:border-white/10 transition-all group">
                     <div className="flex items-center gap-6 md:gap-8 mb-8 md:mb-10">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#EDF7BD] text-[#003049] flex items-center justify-center font-black text-xl md:text-2xl shadow-xl">
                          {rev.userId?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                           <div className="font-black uppercase tracking-[0.3em] text-[11px] md:text-sm text-white mb-2">{rev.userId?.name}</div>
                           <div className="flex text-[#EDF7BD] gap-1">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} size={14} className={i < rev.rating ? 'fill-[#EDF7BD]' : 'opacity-20'} />
                             ))}
                           </div>
                        </div>
                        <div className="ml-auto hidden sm:block">
                           <span className="text-[8px] font-black uppercase tracking-[0.4em] bg-white/5 border border-white/10 px-6 py-3 rounded-full text-[#EDF7BD]/60">Verified Experience</span>
                        </div>
                     </div>
                     
                     <p className="text-white/80 italic font-serif text-lg md:text-xl leading-relaxed mb-8 md:mb-10 pl-8 md:pl-10 border-l border-white/10">
                        "{rev.comment}"
                     </p>

                     {rev.managerResponse && (
                        <div className="mt-8 md:mt-10 bg-white/5 p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/5">
                           <div className="flex items-center gap-4 mb-6">
                              <Award size={18} className="text-[#EDF7BD]" />
                              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#EDF7BD]/60">Curator Response</span>
                           </div>
                           <p className="text-base text-white/70 font-serif leading-relaxed italic">
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
        <aside className="lg:col-span-4" id="booking-section">
          <div className="sticky top-28 bg-[#003049] border border-white/10 rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 shadow-3xl overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#EDF7BD]/20 to-transparent"></div>
             
             <h3 className="text-2xl font-serif font-black text-center uppercase tracking-tight italic mb-3 text-white">Reserve Stay</h3>
             <p className="text-[10px] font-black text-[#EDF7BD]/40 text-center uppercase tracking-[0.5em] mb-10 md:mb-12">Elite Protocol</p>

             <form onSubmit={handleBooking} className="space-y-8 md:space-y-10">
                <div className="space-y-4">
                   <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#EDF7BD]/60 pl-4 font-serif italic">Check-In Arrival</label>
                   <div className="relative group">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-[#EDF7BD]/40 transition-transform group-focus-within:scale-110" size={16} />
                      <input 
                        type="date" required min={new Date().toISOString().split('T')[0]}
                        value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pl-16 text-[12px] font-black text-white color-scheme-dark outline-none focus:border-[#EDF7BD]/50 transition-all font-sans"
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#EDF7BD]/60 pl-4 font-serif italic">Check-Out Departure</label>
                   <div className="relative group">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-[#EDF7BD]/40 transition-transform group-focus-within:scale-110" size={16} />
                      <input 
                        type="date" required min={checkIn || new Date().toISOString().split('T')[0]}
                        value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pl-16 text-[12px] font-black text-white color-scheme-dark outline-none focus:border-[#EDF7BD]/50 transition-all font-sans"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                     <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#EDF7BD]/60 pl-4 font-serif italic">Adults</label>
                     <div className="relative group">
                        <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-[#EDF7BD]/40 transition-transform group-focus-within:scale-110" size={16} />
                        <input 
                          type="number" min="1" required 
                          value={adults} onChange={(e) => setAdults(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-14 text-[12px] font-black text-white outline-none focus:border-[#EDF7BD]/50 transition-all font-sans"
                        />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#EDF7BD]/60 pl-4 font-serif italic">Kids</label>
                     <div className="relative group">
                        <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-[#EDF7BD]/40 transition-transform group-focus-within:scale-110" size={16} />
                        <input 
                          type="number" min="0" required 
                          value={children} onChange={(e) => setChildren(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-14 text-[12px] font-black text-white outline-none focus:border-[#EDF7BD]/50 transition-all font-sans"
                        />
                     </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[9px] font-black uppercase tracking-[0.4em] text-[#EDF7BD]/60 pl-4 font-serif italic">Tier Selection</label>
                   <div className="relative group">
                      <Box className="absolute left-6 top-1/2 -translate-y-1/2 text-[#EDF7BD]/40 transition-transform group-focus-within:scale-110" size={16} />
                      <select 
                        value={selectedRoomId} 
                        onChange={(e) => setSelectedRoomId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pl-16 text-[11px] font-black text-white outline-none focus:border-[#EDF7BD]/50 transition-all appearance-none cursor-pointer font-sans"
                        required
                      >
                        <option value="" disabled className="bg-[#003049]">Select Tier</option>
                        {rooms.map(r => (
                          <option key={r._id} value={r._id} className="bg-[#003049] text-white">
                            {r.type} — ₹{r.pricePerNight}
                          </option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[#EDF7BD] rotate-90" size={16} />
                   </div>
                </div>

                {checkingAvailability && (
                  <div className="flex items-center gap-3 px-4 py-4 bg-white/5 rounded-2xl border border-white/5 animate-pulse">
                    <div className="w-2 h-2 bg-[#EDF7BD] rounded-full animate-ping"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#EDF7BD]">Scanning Availability Hub...</span>
                  </div>
                )}

                {availability !== null && !checkingAvailability && (
                  <div className={`p-6 rounded-2xl border flex flex-col gap-2 ${
                    availability.available 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${availability.available ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                         {availability.available ? 'Sanctuary Available' : 'Chamber Fully Committed'}
                       </span>
                    </div>
                    <p className="text-[9px] opacity-70 uppercase tracking-widest font-serif italic">
                      {availability.available 
                        ? `${availability.remainingCount} tiers remaining for these dates`
                        : 'No availability remains for the selected window'}
                    </p>
                  </div>
                )}

                {bookingError && <div className="p-6 bg-rose-500/10 text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20 animate-pulse">{bookingError}</div>}

                <div className="pt-8 border-t border-white/10">
                   <div className="flex justify-between items-center mb-10 px-2">
                      <span className="text-[10px] font-black text-[#EDF7BD]/40 uppercase tracking-widest font-serif italic">Est. Journey Value</span>
                      <div className="text-right">
                         <div className="text-4xl font-serif font-black text-[#EDF7BD] italic leading-none">
                            ₹{(selectedRoom?.pricePerNight || 0) * (checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))) : 1)}
                         </div>
                      </div>
                   </div>

                   <button 
                     type="submit" 
                     disabled={bookingLoading || !selectedRoomId || (availability && !availability.available) || checkingAvailability}
                     className="w-full py-6 bg-[#EDF7BD] text-[#003049] font-black uppercase tracking-[0.5em] rounded-2xl hover:bg-white hover:shadow-3xl transition-all transform active:scale-95 disabled:opacity-30 disabled:grayscale text-[11px] shadow-2xl"
                   >
                     {bookingLoading ? 'Authorizing...' : checkingAvailability ? 'Synchronizing...' : (availability && !availability.available) ? 'No Space' : 'Book Protocol'}
                   </button>
                </div>
             </form>
          </div>
          
          <div className="mt-12 p-10 bg-white/40 border border-black/5 rounded-[3rem] text-center shadow-sm">
             <Award size={32} className="text-[#003049] mx-auto mb-6 opacity-30" />
             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#003049]/60 leading-relaxed italic">
               Best Rate Pursuit • Member Access • Digital Concierge Ready
             </p>
          </div>
        </aside>

      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-6 left-0 w-full px-6 z-40 animate-in slide-in-from-bottom-10 duration-1000">
          <button 
             onClick={() => document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' })}
             className="w-full py-6 bg-[#003049] text-[#EDF7BD] font-black uppercase tracking-[0.4em] rounded-[2rem] shadow-3xl border border-white/20 flex items-center justify-center gap-4 text-[11px] active:scale-95 transition-all"
          >
             <Calendar size={18} /> Reserve Your Sanctuary
          </button>
      </div>

      {isReviewModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#EDF7BD]/80 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="bg-[#003049] w-full max-w-xl rounded-[3rem] shadow-2xl relative border border-white/10 overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="absolute top-0 left-0 w-full h-2 bg-transparent"></div>
                        <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-10 right-10 text-white hover:text-white transition-colors outline-none z-10">
                            <X size={24} />
                        </button>
                        
                        <div className="p-16">
                            <div className="text-center mb-12">
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.5em] mb-4 block">Hotel Review</span>
                                <h3 className="text-4xl font-serif font-black text-white uppercase tracking-tight italic leading-none">Review Your Stay</h3>
                            </div>

                            <form onSubmit={submitReview} className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-white uppercase tracking-widest flex justify-center">Rating</label>
                                    <div className="flex justify-center gap-6 py-8 bg-[#EDF7BD]/40 rounded-[2.5rem] border border-white/5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button 
                                                key={star} type="button" 
                                                onClick={() => setReviewForm({...reviewForm, rating: star})}
                                                className={`text-5xl transition-all duration-500 ${reviewForm.rating >= star ? 'text-white scale-125 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-white grayscale opacity-20'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-white uppercase tracking-widest pl-2">Your Comments</label>
                                    <textarea 
                                        required rows="4"
                                        placeholder="Tell us about your stay..."
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                        className="w-full bg-[#EDF7BD]/40 border border-white/10 rounded-[2rem] p-8 text-white focus:border-transparent outline-none text-sm font-medium transition-all resize-none placeholder:text-white italic"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={reviewLoading}
                                    className="w-full bg-[#EDF7BD] text-[#003049] font-black uppercase tracking-[0.4em] py-6 rounded-2xl hover:bg-white transition-all transform active:scale-95 disabled:opacity-50 shadow-2xl text-[10px]"
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

export default HotelDetails;
