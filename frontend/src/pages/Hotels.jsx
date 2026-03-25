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
    <div className="bg-[#EDF7BD] min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-transparent/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-transparent/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Page Header */}
        <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-10">
          <div>
            <h1 className="text-xs font-black uppercase tracking-[0.6em] text-black mb-6 flex items-center gap-2">
              <Sparkles size={14} /> Hotel Collection
            </h1>
            <h2 className="text-5xl md:text-7xl font-serif font-black text-black uppercase tracking-tighter leading-none italic">
              Luxury <span className="text-black">Collections</span>
            </h2>
            <p className="text-black mt-4 font-medium tracking-wide">Curated stays for the discerning traveler.</p>
          </div>
          <div className="flex items-center gap-4 bg-[#EDF7BD]/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
            <span className="text-2xl font-serif font-black text-black italic">{hotels.length}</span>
            <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Verified Properties</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT: FILTER SIDEBAR */}
          <aside className="lg:w-1/4">
            <div className="bg-[#EDF7BD] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl sticky top-32 overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                <SlidersHorizontal size={80} />
              </div>

              <div className="flex justify-between items-center mb-10 relative z-10">
                <h2 className="text-xs font-black text-black uppercase tracking-[0.3em] flex items-center gap-2">
                  <Filter size={14} className="text-black" /> Refine Search
                </h2>
                <button onClick={clearFilters} className="text-[9px] font-black text-black uppercase tracking-widest hover:text-black transition-colors">Reset</button>
              </div>

              {/* Price Range */}
              <div className="mb-10 relative z-10">
                <label className="block text-[9px] font-black text-black uppercase tracking-[0.2em] mb-4 pl-1">Price Range (₹)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="number" placeholder="Min" 
                    className="w-full bg-[#EDF7BD]/40 border border-white/10 rounded-xl p-3 text-xs text-black focus:border-transparent/50 focus:bg-[#EDF7BD]/60 outline-none transition-all font-bold placeholder:text-black"
                    value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <input 
                    type="number" placeholder="Max" 
                    className="w-full bg-[#EDF7BD]/40 border border-white/10 rounded-xl p-3 text-xs text-black focus:border-transparent/50 focus:bg-[#EDF7BD]/60 outline-none transition-all font-bold placeholder:text-black"
                    value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="mb-10 relative z-10">
                <label className="block text-[9px] font-black text-black uppercase tracking-[0.2em] mb-4 pl-1">Timeline</label>
                <div className="space-y-3">
                  <input 
                    type="date" 
                    className="w-full bg-[#EDF7BD]/40 border border-white/10 rounded-xl p-3 text-xs text-black focus:border-transparent/50 outline-none transition-all font-bold color-scheme-dark"
                    value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                  />
                  <input 
                    type="date" 
                    className="w-full bg-[#EDF7BD]/40 border border-white/10 rounded-xl p-3 text-xs text-black focus:border-transparent/50 outline-none transition-all font-bold color-scheme-dark"
                    value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>

              {/* Min Rating */}
              <div className="mb-10 relative z-10">
                <label className="block text-[9px] font-black text-black uppercase tracking-[0.2em] mb-4 pl-1">Rating</label>
                <div className="flex items-center gap-1 bg-[#EDF7BD]/40 p-3 rounded-xl border border-white/10">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star}
                      onClick={() => setMinRating(star.toString())}
                      className={`text-xl transition-all hover:scale-125 ${Number(minRating) >= star ? 'text-black' : 'text-black'}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-auto text-[10px] font-black text-black uppercase tracking-widest">{minRating}+ Rating</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-10 relative z-10">
                <label className="block text-[9px] font-black text-black uppercase tracking-[0.2em] mb-4 pl-1">Amenities</label>
                <div className="grid grid-cols-2 gap-3">
                  {amenitiesOptions.map(amenity => (
                    <label key={amenity} className="flex items-center text-[10px] font-bold text-black cursor-pointer group/item">
                      <input 
                        type="checkbox" 
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="w-4 h-4 rounded bg-[#EDF7BD]/40 border-white/10 text-black mr-3 focus:ring-offset-black focus:ring-[transparent] transition-all"
                      />
                      <span className="group-hover/item:text-black transition-colors">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={fetchHotels}
                className="w-full py-5 bg-transparent text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-[#EDF7BD] hover:text-black transition-all transform active:scale-95 shadow-xl shadow-transparent/10 relative z-10"
              >
                Apply Filters
              </button>
            </div>
          </aside>

          {/* RIGHT: CONTENT */}
          <main className="lg:w-3/4 space-y-12">
            
            {/* Search Consol */}
            <form onSubmit={handleSearch} className="flex w-full bg-[#EDF7BD] border border-white/10 rounded-[2.5rem] shadow-2xl relative group overflow-hidden">
              <div className="absolute inset-0 bg-transparent/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              
              <div className="flex-grow relative border-r border-white/5">
                <input 
                  type="text" 
                  placeholder="Hotel name or description..."
                  className="w-full px-8 py-6 focus:outline-none text-black bg-transparent text-sm font-bold uppercase tracking-wide placeholder:text-black"
                  value={keyword}
                  onChange={(e) => { setKeyword(e.target.value); setActiveInput('keyword'); setShowSuggestions(true); }}
                  onFocus={() => { setActiveInput('keyword'); setShowSuggestions(true); }}
                />
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-black pointer-events-none" size={18} />
                
                {showSuggestions && activeInput === 'keyword' && (suggestions.hotels.length > 0) && (
                  <div className="absolute top-[105%] left-0 w-full bg-[#161618] z-[60] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                     {suggestions.hotels.map(h => (
                       <div key={h._id} onClick={() => selectSuggestion(h.name, 'keyword')} className="px-8 py-4 hover:bg-transparent/10 cursor-pointer flex justify-between items-center group/opt border-b border-white/5 last:border-0">
                          <div>
                             <div className="text-xs font-black text-black group-hover/opt:text-black transition-colors uppercase tracking-widest">{h.name}</div>
                             <div className="text-[9px] font-bold text-black uppercase tracking-[0.2em]">{h.city}</div>
                          </div>
                          <ChevronRight size={14} className="text-black group-hover/opt:text-black group-hover/opt:translate-x-1 transition-all" />
                       </div>
                     ))}
                  </div>
                )}
              </div>

              <div className="w-1/3 relative">
                <input 
                  type="text" 
                  placeholder="Destination..."
                  className="w-full px-8 py-6 focus:outline-none text-black bg-transparent text-sm font-bold uppercase tracking-wide placeholder:text-black"
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setActiveInput('city'); setShowSuggestions(true); }}
                  onFocus={() => { setActiveInput('city'); setShowSuggestions(true); }}
                />
                <MapPin className="absolute right-6 top-1/2 -translate-y-1/2 text-black pointer-events-none" size={18} />
                
                {showSuggestions && activeInput === 'city' && suggestions.cities.length > 0 && (
                  <div className="absolute top-[105%] left-0 w-full bg-[#161618] z-[60] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                     {suggestions.cities.map(c => (
                       <div key={c} onClick={() => selectSuggestion(c, 'city')} className="px-8 py-4 hover:bg-transparent/10 cursor-pointer flex justify-between items-center group/opt border-b border-white/5 last:border-0">
                          <span className="text-xs font-black text-black group-hover/opt:text-black transition-colors uppercase tracking-widest">{c}</span>
                          <ChevronRight size={14} className="text-black group-hover/opt:text-black group-hover/opt:translate-x-1 transition-all" />
                       </div>
                     ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="bg-transparent hover:bg-[#EDF7BD] text-black px-10 font-black uppercase tracking-[0.3em] text-[10px] transition-all transform active:scale-95"
              >
                Search
              </button>
            </form>

            {/* Hotel Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-[500px] bg-[#EDF7BD] rounded-[3rem] border border-white/5 animate-pulse"></div>
                ))}
              </div>
            ) : hotels.length === 0 ? (
              <div className="text-center py-24 bg-[#EDF7BD] rounded-[3rem] border border-dashed border-white/5 border-2">
                <div className="text-6xl mb-8 opacity-20 grayscale">🏨</div>
                <h3 className="text-3xl font-serif font-black text-black mb-2 italic">No Hotels Found</h3>
                <p className="text-black mb-10 max-w-md mx-auto font-medium tracking-wide">The criteria provided does not match any hotels in our collection.</p>
                <button onClick={clearFilters} className="bg-[#EDF7BD]/5 hover:bg-[#EDF7BD]/10 text-black px-10 py-4 rounded-2xl border border-white/10 font-black uppercase tracking-widest text-[10px] transition-all">Clear Search Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {hotels.map((hotel) => {
                  const hotelPromo = promotions.find(p => !p.hotelId || (p.hotelId && p.hotelId._id === hotel._id));
                  return (
                  <Link key={hotel._id} to={`/hotels/${hotel._id}`} className="group h-full">
                    <div className="bg-[#EDF7BD] border border-white/5 rounded-[3rem] overflow-hidden flex flex-col h-full transition-all duration-700 hover:border-transparent/30 hover:shadow-[0_40px_80px_-20px_rgba(212,175,55,0.1)] group-hover:-translate-y-3 shadow-2xl">
                      
                      {/* Estate Image */}
                      <div className="relative h-[300px] overflow-hidden">
                        <img 
                          src={getHotelImage(hotel)} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1542314831-c6a4d27ce66f?auto=format&fit=crop&w=1200&q=80';
                          }}
                          alt={hotel.name} 
                          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60"></div>
                        
                        {/* Rating Component */}
                        <div className="absolute top-6 right-6 bg-[#EDF7BD]/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2 shadow-2xl z-20">
                          <Star size={12} className="text-black fill-[transparent]" />
                          <span className="text-xs font-black text-black">{hotel.rating ? hotel.rating.toFixed(1) : "NEW"}</span>
                        </div>

                        {/* Promo Badge */}
                        {hotelPromo && (
                           <div className="absolute top-6 left-6 bg-transparent text-black px-4 py-2 rounded-2xl border border-black/20 flex items-center gap-2 shadow-2xl z-20">
                             <Sparkles size={12} className="text-black" />
                             <span className="text-xs font-black uppercase font-sans tracking-widest">{hotelPromo.discount}{hotelPromo.type === 'percentage' ? '%' : ' INR'} OFF</span>
                           </div>
                        )}

                        {/* Starting Price Plate */}
                        <div className="absolute bottom-6 left-6">
                           <div className="bg-transparent text-black px-6 py-3 rounded-2xl font-serif font-black shadow-2xl border-2 border-transparent/50">
                             <span className="text-sm opacity-60 tracking-tighter mr-1 uppercase font-sans font-black">from</span>
                             <span className="text-xl italic">₹{hotel.startingPrice || 0}</span>
                             <span className="text-[9px] opacity-60 tracking-widest ml-1 uppercase font-sans font-black">/ night</span>
                           </div>
                        </div>
                      </div>

                      {/* Estate Details */}
                      <div className="p-10 flex flex-col flex-grow">
                        <div className="mb-6">
                          <h3 className="text-3xl font-serif font-black text-black mb-2 uppercase tracking-tight italic group-hover:text-black transition-colors">
                            {hotel.name}
                          </h3>
                          <p className="flex items-center gap-2 text-black text-[10px] font-black uppercase tracking-[0.2em]">
                            <MapPin size={10} className="text-black" /> {hotel.city}, {hotel.country}
                          </p>
                        </div>

                        <p className="text-black text-sm mb-8 line-clamp-2 leading-relaxed font-medium">
                          {hotel.description}
                        </p>
                        
                        {/* Amenities Preview */}
                        <div className="flex flex-wrap gap-2 mt-auto pt-8 border-t border-white/5">
                          {(hotel.amenities || []).slice(0, 3).map(a => (
                            <span key={a} className="bg-[#EDF7BD]/5 text-[9px] uppercase font-black tracking-widest text-black px-4 py-2 rounded-full border border-white/5 group-hover:bg-transparent/10 group-hover:text-black group-hover:border-transparent/20 transition-all duration-500">
                              {a}
                            </span>
                          ))}
                          {(hotel.amenities || []).length > 3 && (
                            <span className="text-[9px] font-black text-black/50 uppercase tracking-widest self-center ml-2">+{hotel.amenities.length - 3}</span>
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
