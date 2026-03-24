import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import HeroSection from '../components/home/HeroSection';
import { Award, Shield, Zap, MapPin, Globe, Sparkles, Tag } from 'lucide-react';

const Home = () => {
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const { data } = await api.get('/promotions/public');
        setPromotions(data);
      } catch (error) {
        console.error('Failed to fetch promotions', error);
      }
    };
    fetchPromotions();
  }, []);

  return (
    <div className="flex flex-col bg-white min-h-screen text-gray-900 overflow-x-hidden">
      <HeroSection />

      {/* Exclusive Offers */}
      {promotions.length > 0 && (
        <section className="py-24 relative overflow-hidden bg-white">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#0B2D72]/20 to-transparent"></div>
          <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-1000">
               <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-900 mb-6 flex items-center justify-center gap-4">
                 <span className="w-8 h-[1px] bg-[#0B2D72]/30"></span> Exclusive Privileges <span className="w-8 h-[1px] bg-[#0B2D72]/30"></span>
               </h2>
               <h3 className="text-4xl md:text-5xl lg:text-7xl font-serif font-black uppercase tracking-tighter italic">Active Protocols</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {promotions.map((promo) => (
                <Link 
                  key={promo._id} 
                  to={promo.hotelId ? `/hotels/${promo.hotelId._id}` : '/hotels'}
                  className="block p-8 bg-white border border-[#0B2D72]/20 rounded-[2.5rem] hover:border-[#0B2D72]/50 hover:bg-white/5 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden shadow-2xl cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#0B2D72]/10 rounded-bl-[100%] transition-all opacity-0 group-hover:opacity-100 duration-500 group-hover:scale-110"></div>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="text-3xl font-serif font-black text-gray-900 italic tracking-tighter">
                      {promo.discount}{promo.type === 'percentage' ? '%' : ' INR'} <span className="text-gray-900 text-2xl">OFF</span>
                    </div>
                    <span className="bg-[#0B2D72]/10 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border border-[#0B2D72]/20 shadow-inner group-hover:bg-[#0B2D72] group-hover:text-black transition-colors">
                      {promo.code}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 font-serif italic mb-4 relative z-10 min-h-[40px] group-hover:text-gray-900 transition-colors">
                    "{promo.description}"
                  </p>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900 mb-6 relative z-10 flex items-center gap-2">
                    <MapPin size={12} /> {promo.hotelId ? `Valid at ${promo.hotelId.name}` : 'Global Collection'}
                  </div>
                  <div className="flex justify-between items-center relative z-10 border-t border-white/5 pt-4 mt-auto group-hover:border-[#0B2D72]/30 transition-colors">
                    <div className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 flex items-center gap-2 group-hover:text-gray-900 transition-colors">
                       <Tag size={12} className="text-gray-900/50" /> Valid Until
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900">
                      {new Date(promo.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Destinations */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#0B2D72]/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0B2D72]/5 blur-[150px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="text-center mb-24 animate-in fade-in slide-in-from-bottom duration-1000">
             <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-900 mb-6 flex items-center justify-center gap-4">
               <span className="w-8 h-[1px] bg-[#0B2D72]/30"></span> The Collections <span className="w-8 h-[1px] bg-[#0B2D72]/30"></span>
             </h2>
             <h3 className="text-4xl md:text-5xl lg:text-7xl font-serif font-black uppercase tracking-tighter italic">Iconic Destinations</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { name: "Dubai", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: "120+" },
              { name: "Paris", img: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: "85+" },
              { name: "Maldives", img: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: "40+" }
            ].map((dest, i) => (
              <div key={i} className="group relative h-[500px] rounded-[3rem] overflow-hidden border border-white/5 transition-all duration-700 hover:border-[#0B2D72]/30 shadow-2xl">
                <img src={dest.img} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-[3s]" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent flex flex-col justify-end p-12">
                   <h4 className="text-3xl md:text-4xl font-serif font-black text-gray-900 italic mb-2 group-hover:-translate-y-2 transition-transform duration-500">{dest.name}</h4>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 opacity-0 group-hover:opacity-100 transition-all duration-700">{dest.count} Luxury Hotels</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-24 text-center">
             <Link to="/hotels" className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-900 hover:text-gray-900 transition-colors flex items-center justify-center gap-4">
               Explore Global Inventory <Sparkles size={14} />
             </Link>
          </div>
        </div>
      </section>

      {/* The Protocol (Why Choose) */}
      <section className="py-32 bg-white relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
            <div className="text-center mb-24">
               <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-900 mb-6">The Navan Experience</h2>
               <h3 className="text-3xl md:text-5xl lg:text-6xl font-serif font-black italic tracking-tighter">Beyond Standard Hospitality</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
               {[
                 { icon: <Shield size={32} />, title: "Digital Fortress", desc: "Advanced 4096-bit RSA encryption ensuring your legacy remains private and secure." },
                 { icon: <Award size={32} />, title: "Elite Concierge", desc: "A dedicated digital curator available round the clock to refine your journey." },
                 { icon: <Zap size={32} />, title: "Rate Supremacy", desc: "Our commitment to the absolute best value across all global collections." }
               ].map((item, i) => (
                 <div key={i} className="p-12 bg-white/40 border border-white/5 rounded-[3rem] hover:border-[#0B2D72]/20 transition-all text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 text-gray-900">
                       {item.icon}
                    </div>
                    <h4 className="text-2xl font-serif font-black uppercase italic mb-4 tracking-tight">{item.title}</h4>
                    <p className="text-sm font-medium text-gray-900 leading-relaxed font-serif italic">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
         
         <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#0B2D72]/10 to-transparent"></div>
      </section>
    </div>
  );
};

export default Home;
