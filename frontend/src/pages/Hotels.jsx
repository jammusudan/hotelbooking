import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { getHotelImage } from '../utils/imageHelper';
import { Search, MapPin, Star, Filter, X, ChevronRight, SlidersHorizontal, Sparkles } from 'lucide-react';

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('0');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [suggestions, setSuggestions] = useState({ hotels: [], cities: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeInput, setActiveInput] = useState(''); // 'keyword' or 'city'

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const amenitiesOptions = ['WiFi', 'Pool', 'Gym', 'Spa', 'Parking', 'Breakfast', 'AC'];

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (city) params.append('city', city);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minRating > 0) params.append('minRating', minRating);
      if (checkIn) params.append('checkIn', checkIn);
      if (checkOut) params.append('checkOut', checkOut);
      if (selectedAmenities.length > 0) params.append('amenities', selectedAmenities.join(','));

      const { data } = await api.get(`/hotels?${params.toString()}`);
      setHotels(data.hotels || []);
      setIsFilterOpen(false); // Close filter on apply (mobile)
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
    const fetchPromos = async () => {
      try {
        const { data } = await api.get('/promotions/public');
        setPromotions(data);
      } catch (error) {
        console.error('Failed to fetch promotions');
      }
    };
    fetchPromos();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const query = activeInput === 'keyword' ? keyword : city;
      if (!query || query.length < 2) {
        setSuggestions({ hotels: [], cities: [] });
        return;
      }
      try {
        const { data } = await api.get(`/hotels/suggestions?query=${query}`);
        setSuggestions(data);
      } catch (error) {
        console.error('Suggestion fetch error');
      }
    };
    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [keyword, city, activeInput]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHotels();
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setKeyword('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('0');
    setCheckIn('');
    setCheckOut('');
    setSelectedAmenities([]);
    setTimeout(fetchHotels, 50);
  };

  const selectSuggestion = (value, field) => {
    if (field === 'keyword') setKeyword(value);
    else if (field === 'city') setCity(value);
    setShowSuggestions(false);
    setTimeout(fetchHotels, 100);
  };

  return (
    <div className="bg-[#EDF7BD] min-h-screen pt-24 md:pt-32 pb-24 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-black/5 blur-[80px] md:blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-black/5 blur-[80px] md:blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Page Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 border-b border-black/5 pb-10">
          <div>
            <h1 className="text-[10px] font-black uppercase tracking-[0.6em] text-black/60 mb-4 flex items-center gap-2">
              <Sparkles size={14} className="text-black" /> Hotel Collection
            </h1>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black text-[#003049] uppercase tracking-tighter leading-tight italic">
              Luxury <span className="text-[#003049]/40">Collections</span>
            </h2>
            <p className="text-black/70 mt-4 font-medium tracking-wide max-w-lg leading-relaxed">Curated stays representing the pinnacle of international hospitality.</p>
          </div>
          <div className="flex items-center gap-4 bg-white/40 border border-black/5 px-6 py-4 rounded-[2rem] backdrop-blur-md shadow-sm">
            <span className="text-3xl font-serif font-black text-[#003049] italic">{hotels.length}</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-[#003049] uppercase tracking-[0.2em]">Verified</span>
              <span className="text-[10px] font-black text-[#003049]/40 uppercase tracking-[0.2em]">Properties</span>
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="lg:hidden flex items-center justify-center gap-3 bg-[#003049] text-white px-8 py-5 rounded-[2rem] w-full mb-10 font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl active:scale-95 transition-all border border-white/10"
        >
          <SlidersHorizontal size={16} /> Refine Your Search
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT: FILTER SIDEBAR (Responsive Drawer) */}
          <>
            {/* Mobile Backdrop */}
            <div 
              className={`lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-[100] transition-opacity duration-500 ${isFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => setIsFilterOpen(false)}
            />
            
            <aside className={`lg:w-1/4 fixed lg:relative inset-y-0 right-0 w-[85%] max-w-sm lg:max-w-none bg-[#003049] lg:bg-[#003049] z-[101] lg:z-10 transition-transform duration-500 transform ${isFilterOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
              <div className="h-full lg:h-auto overflow-y-auto lg:overflow-visible p-8 lg:p-10 lg:rounded-[3rem] border-l lg:border border-white/10 shadow-3xl sticky top-28 group">
                
                {/* Mobile Drawer Header */}
                <div className="lg:hidden flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                  <h2 className="text-xs font-black text-white uppercase tracking-[0.5em]">Filter Desk</h2>
                  <button onClick={() => setIsFilterOpen(false)} className="bg-white/10 p-2 rounded-xl text-white hover:bg-white/20 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex justify-between items-center mb-10 relative z-10">
                  <h2 className="text-[10px] font-black text-white uppercase tracking-[0.34em] flex items-center gap-2">
                    <Filter size={14} className="text-[#EDF7BD]" /> Refine Search
                  </h2>
                  <button onClick={clearFilters} className="text-[8px] font-black text-[#EDF7BD] uppercase tracking-widest hover:text-white transition-colors border-b border-[#EDF7BD]/30">Reset All</button>
                </div>

                {/* Price Range */}
                <div className="mb-12 relative z-10">
                  <label className="block text-[9px] font-black text-white/50 uppercase tracking-[0.3em] mb-4 pl-1">Monetary Reach (₹)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input 
                        type="number" placeholder="Min" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] text-white focus:border-[#EDF7BD]/50 focus:bg-white/10 outline-none transition-all font-bold placeholder:text-white/20"
                        value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <input 
                        type="number" placeholder="Max" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] text-white focus:border-[#EDF7BD]/50 focus:bg-white/10 outline-none transition-all font-bold placeholder:text-white/20"
                        value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="mb-12 relative z-10">
                  <label className="block text-[9px] font-black text-white/50 uppercase tracking-[0.3em] mb-4 pl-1">Scheduled Timeline</label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input 
                        type="date" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] text-white focus:border-[#EDF7BD]/50 outline-none transition-all font-bold color-scheme-dark"
                        value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <input 
                        type="date" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] text-white focus:border-[#EDF7BD]/50 outline-none transition-all font-bold color-scheme-dark"
                        value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Min Rating */}
                <div className="mb-12 relative z-10">
                  <label className="block text-[9px] font-black text-white/50 uppercase tracking-[0.3em] mb-4 pl-1">Experience Rating</label>
                  <div className="flex items-center gap-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star}
                        onClick={() => setMinRating(star.toString())}
                        className={`text-xl transition-all hover:scale-125 ${Number(minRating) >= star ? 'text-[#EDF7BD]' : 'text-white/20'}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-auto text-[9px] font-black text-[#EDF7BD] uppercase tracking-widest">{minRating}+</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-12 relative z-10">
                  <label className="block text-[9px] font-black text-white/50 uppercase tracking-[0.3em] mb-4 pl-1">Key Provisions</label>
                  <div className="grid grid-cols-2 gap-4">
                    {amenitiesOptions.map(amenity => (
                      <label key={amenity} className="flex items-center text-[10px] font-bold text-white/70 cursor-pointer group/item">
                        <input 
                          type="checkbox" 
                          checked={selectedAmenities.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                          className="w-4 h-4 rounded-lg bg-white/10 border-white/20 text-[#EDF7BD] mr-3 focus:ring-0 transition-all checked:bg-[#EDF7BD] cursor-pointer"
                        />
                        <span className="group-hover/item:text-white transition-colors">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={fetchHotels}
                  className="w-full py-5 bg-[#EDF7BD] text-[#003049] font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-white transition-all transform active:scale-95 shadow-2xl shadow-black/20 relative z-10"
                >
                  Execute Refinement
                </button>
              </div>
            </aside>
          </>

          {/* RIGHT: CONTENT */}
          <main className="lg:w-3/4 space-y-10 md:space-y-12">
            
            {/* Search Consol */}
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row w-full bg-[#003049] border border-white/10 rounded-3xl md:rounded-[3rem] shadow-2xl relative group overflow-hidden">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              
              <div className="flex-grow relative border-b md:border-b-0 md:border-r border-white/10">
                <input 
                  type="text" 
                  placeholder="Estate name or curator..."
                  className="w-full px-8 py-6 md:py-8 focus:outline-none text-white bg-transparent text-sm font-bold uppercase tracking-wide placeholder:text-white/30"
                  value={keyword}
                  onChange={(e) => { setKeyword(e.target.value); setActiveInput('keyword'); setShowSuggestions(true); }}
                  onFocus={() => { setActiveInput('keyword'); setShowSuggestions(true); }}
                />
                <Search className="absolute right-8 top-1/2 -translate-y-1/2 text-[#EDF7BD]/40 pointer-events-none" size={18} />
                
                {showSuggestions && activeInput === 'keyword' && (suggestions.hotels.length > 0) && (
                  <div className="absolute top-[105%] left-0 w-full bg-[#002538] z-[60] border border-white/10 rounded-2xl shadow-3xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                     {suggestions.hotels.map(h => (
                       <div key={h._id} onClick={() => selectSuggestion(h.name, 'keyword')} className="px-8 py-5 hover:bg-white/5 cursor-pointer flex justify-between items-center group/opt border-b border-white/5 last:border-0">
                          <div>
                             <div className="text-xs font-black text-white group-hover/opt:text-[#EDF7BD] transition-colors uppercase tracking-widest">{h.name}</div>
                             <div className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">{h.city}</div>
                          </div>
                          <ChevronRight size={14} className="text-white/20 group-hover/opt:text-[#EDF7BD] group-hover/opt:translate-x-1 transition-all" />
                       </div>
                     ))}
                  </div>
                )}
              </div>

              <div className="md:w-1/3 relative border-b md:border-b-0 md:border-r border-white/10">
                <input 
                  type="text" 
                  placeholder="Global city..."
                  className="w-full px-8 py-6 md:py-8 focus:outline-none text-white bg-transparent text-sm font-bold uppercase tracking-wide placeholder:text-white/30"
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setActiveInput('city'); setShowSuggestions(true); }}
                  onFocus={() => { setActiveInput('city'); setShowSuggestions(true); }}
                />
                <MapPin className="absolute right-8 top-1/2 -translate-y-1/2 text-[#EDF7BD]/40 pointer-events-none" size={18} />
                
                {showSuggestions && activeInput === 'city' && suggestions.cities.length > 0 && (
                  <div className="absolute top-[105%] left-0 w-full bg-[#002538] z-[60] border border-white/10 rounded-2xl shadow-3xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                     {suggestions.cities.map(c => (
                       <div key={c} onClick={() => selectSuggestion(c, 'city')} className="px-8 py-5 hover:bg-white/5 cursor-pointer flex justify-between items-center group/opt border-b border-white/5 last:border-0">
                          <span className="text-xs font-black text-white group-hover/opt:text-[#EDF7BD] transition-colors uppercase tracking-widest">{c}</span>
                          <ChevronRight size={14} className="text-white/20 group-hover/opt:text-[#EDF7BD] group-hover/opt:translate-x-1 transition-all" />
                       </div>
                     ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="bg-[#EDF7BD] hover:bg-white text-[#003049] md:bg-transparent md:hover:bg-white/10 md:text-white px-12 py-6 md:py-0 font-black uppercase tracking-[0.4em] text-[10px] transition-all transform active:scale-95"
              >
                Go
              </button>
            </form>

            {/* Hotel Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-[400px] md:h-[500px] bg-[#003049] rounded-[3rem] border border-white/10 animate-pulse"></div>
                ))}
              </div>
            ) : hotels.length === 0 ? (
              <div className="text-center py-20 md:py-32 bg-[#003049] rounded-[3rem] border border-dashed border-white/10 border-2 shadow-2xl">
                <div className="text-6xl mb-8 opacity-20 transition-all group-hover:scale-110 duration-700">🏨</div>
                <h3 className="text-3xl font-serif font-black text-white mb-4 italic uppercase">Zero Matches</h3>
                <p className="text-white/60 mb-12 max-w-sm mx-auto font-medium tracking-wide leading-relaxed px-6">The current collection parameters yielded no active results. Please refine your refinement.</p>
                <button onClick={clearFilters} className="bg-[#EDF7BD] hover:bg-white text-[#003049] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl active:scale-95">Reset Search Protocol</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                {hotels.map((hotel) => {
                  const hotelPromo = promotions.find(p => !p.hotelId || (p.hotelId && p.hotelId._id === hotel._id));
                  return (
                  <Link key={hotel._id} to={`/hotels/${hotel._id}`} className="group h-full">
                    <div className="bg-[#003049] border border-white/10 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden flex flex-col h-full transition-all duration-700 hover:border-[#EDF7BD]/30 hover:shadow-[0_40px_80px_-20px_rgba(212,175,55,0.1)] group-hover:-translate-y-3 shadow-2xl">
                      
                      {/* Estate Image */}
                      <div className="relative h-[250px] md:h-[300px] overflow-hidden">
                        <img 
                          src={getHotelImage(hotel)} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1542314831-c6a4d27ce66f?auto=format&fit=crop&w=1200&q=80';
                          }}
                          alt={hotel.name} 
                          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#003049] via-transparent to-transparent opacity-60"></div>
                        
                        {/* Rating Component */}
                        <div className="absolute top-4 md:top-6 right-4 md:right-6 bg-[#003049]/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2 shadow-2xl z-20">
                          <Star size={12} className="text-[#EDF7BD] fill-[#EDF7BD]" />
                          <span className="text-xs font-black text-white">{hotel.rating ? hotel.rating.toFixed(1) : "NEW"}</span>
                        </div>

                        {/* Promo Badge */}
                        {hotelPromo && (
                           <div className="absolute top-4 md:top-6 left-4 md:left-6 bg-[#EDF7BD] text-[#003049] px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2 shadow-2xl z-20">
                             <Sparkles size={12} className="text-[#003049]" />
                             <span className="text-[10px] font-black uppercase font-sans tracking-widest">{hotelPromo.discount}{hotelPromo.type === 'percentage' ? '%' : ' INR'} OFF</span>
                           </div>
                        )}

                        {/* Starting Price Plate */}
                        <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6">
                           <div className="bg-[#003049] text-white px-5 md:px-6 py-2 md:py-3 rounded-2xl font-serif font-black shadow-2xl border border-white/20 group-hover:bg-[#003049] transition-colors">
                             <span className="text-[10px] opacity-60 tracking-tighter mr-1 uppercase font-sans font-black">from</span>
                             <span className="text-lg md:text-xl italic text-[#EDF7BD]">₹{hotel.startingPrice || 0}</span>
                             <span className="text-[8px] opacity-60 tracking-widest ml-1 uppercase font-sans font-black">/ night</span>
                           </div>
                        </div>
                      </div>

                      {/* Estate Details */}
                      <div className="p-8 md:p-10 flex flex-col flex-grow">
                        <div className="mb-6">
                          <h3 className="text-2xl md:text-3xl font-serif font-black text-white mb-2 uppercase tracking-tight italic group-hover:text-[#EDF7BD] transition-colors">
                            {hotel.name}
                          </h3>
                          <p className="flex items-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">
                            <MapPin size={10} className="text-[#EDF7BD]" /> {hotel.city}, {hotel.country}
                          </p>
                        </div>

                        <p className="text-white/70 text-sm mb-8 line-clamp-2 leading-relaxed font-medium font-serif italic">
                          "{hotel.description}"
                        </p>
                        
                        {/* Amenities Preview */}
                        <div className="flex flex-wrap gap-2 mt-auto pt-8 border-t border-white/5">
                          {(hotel.amenities || []).slice(0, 3).map(a => (
                            <span key={a} className="bg-white/5 text-[9px] uppercase font-black tracking-widest text-[#EDF7BD] px-4 py-2 rounded-full border border-white/10 group-hover:border-[#EDF7BD]/30 transition-all duration-500">
                              {a}
                            </span>
                          ))}
                          {(hotel.amenities || []).length > 3 && (
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest self-center ml-2">+{hotel.amenities.length - 3}</span>
                          )}
                        </div>
                      </div>

                    </div>
                  </Link>
                )})}
              </div>
            )}
          </main>

        </div>
      </div>
      
      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div className="fixed inset-0 z-50 bg-transparent" onClick={() => setShowSuggestions(false)} />
      )}
    </div>
  );
};

export default Hotels;
