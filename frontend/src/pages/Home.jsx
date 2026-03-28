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
    <div className="flex flex-col bg-[#EDF7BD] min-h-screen text-black overflow-x-hidden">
      <HeroSection />

      {/* Exclusive Offers */}
      {promotions.length > 0 && (
        <section className="py-16 md:py-24 relative overflow-hidden bg-[#EDF7BD]">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-transparent/20 to-transparent"></div>
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div className="text-center mb-12 md:mb-16 animate-in fade-in slide-in-from-bottom duration-1000">
               <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/60 mb-6 flex items-center justify-center gap-4">
                 <span className="w-8 h-[1px] bg-black/10"></span> Exclusive Privileges <span className="w-8 h-[1px] bg-black/10"></span>
               </h2>
               <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-black uppercase tracking-tighter italic text-[#003049]">Active Protocols</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {promotions.map((promo) => (
                <Link 
                  key={promo._id} 
                  to={promo.hotelId ? `/hotels/${promo.hotelId._id}` : '/hotels'}
                  className="block p-8 bg-[#003049] border border-white/10 rounded-[2.5rem] hover:border-[#EDF7BD]/30 hover:bg-[#003049]/95 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden shadow-2xl cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-bl-[100%] transition-all opacity-0 group-hover:opacity-100 duration-500 group-hover:scale-110"></div>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="text-2xl sm:text-3xl font-serif font-black text-[#EDF7BD] italic tracking-tighter">
                      {promo.discount}{promo.type === 'percentage' ? '%' : ' INR'} <span className="text-[#EDF7BD]/80 text-xl sm:text-2xl">OFF</span>
                    </div>
                    <span className="bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border border-white/10 shadow-inner group-hover:bg-[#EDF7BD] group-hover:text-[#003049] transition-colors">
                      {promo.code}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white/90 font-serif italic mb-4 relative z-10 min-h-[40px]">
                    "{promo.description}"
                  </p>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#EDF7BD]/70 mb-6 relative z-10 flex items-center gap-2">
                    <MapPin size={12} className="text-[#EDF7BD]" /> {promo.hotelId ? `Valid at ${promo.hotelId.name}` : 'Global Collection'}
                  </div>
                  <div className="flex justify-between items-center relative z-10 border-t border-white/5 pt-4 mt-auto">
                    <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 flex items-center gap-2">
                       <Tag size={12} className="text-[#EDF7BD]/50" /> Valid Until
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#EDF7BD]">
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
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/5 to-transparent"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#003049]/5 blur-[150px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 md:mb-24 animate-in fade-in slide-in-from-bottom duration-1000">
             <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/60 mb-6 flex items-center justify-center gap-4">
               <span className="w-8 h-[1px] bg-black/10"></span> The Collections <span className="w-8 h-[1px] bg-black/10"></span>
             </h2>
             <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-black uppercase tracking-tighter italic text-[#003049]">Iconic Destinations</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { name: "Dubai", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: "120+" },
              { name: "Paris", img: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: "85+" },
              { name: "Maldives", img: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: "40+" }
            ].map((dest, i) => (
              <div key={i} className="group relative h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden border border-black/5 transition-all duration-700 hover:border-[#003049]/20 shadow-2xl">
                <img src={dest.img} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-[3s]" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent flex flex-col justify-end p-8 md:p-12">
                   <h4 className="text-3xl md:text-4xl font-serif font-black text-[#003049] italic mb-2 group-hover:-translate-y-2 transition-transform duration-500">{dest.name}</h4>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#003049]/60 opacity-0 group-hover:opacity-100 transition-all duration-700">{dest.count} Luxury Hotels</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 md:mt-24 text-center">
             <Link to="/hotels" className="group text-[10px] font-black uppercase tracking-[0.5em] text-[#003049] hover:text-[#003049]/70 transition-colors flex items-center justify-center gap-4">
               Explore Global Inventory <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
             </Link>
          </div>
        </div>
      </section>

      {/* The Protocol (Why Choose) */}
      <section className="py-20 md:py-32 bg-[#EDF7BD] relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div className="text-center mb-16 md:mb-24">
               <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/60 mb-6">The Navan Experience</h2>
               <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-black italic tracking-tighter text-[#003049]">Beyond Standard Hospitality</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
               {[
                 { icon: <Shield size={32} />, title: "Digital Fortress", desc: "Advanced 4096-bit RSA encryption ensuring your legacy remains private and secure." },
                 { icon: <Award size={32} />, title: "Elite Concierge", desc: "A dedicated digital curator available round the clock to refine your journey." },
                 { icon: <Zap size={32} />, title: "Rate Supremacy", desc: "Our commitment to the absolute best value across all global collections." }
               ].map((item, i) => (
                 <div key={i} className="p-10 md:p-12 bg-[#003049] border border-white/10 rounded-[3rem] hover:border-[#EDF7BD]/30 transition-all text-center group shadow-xl hover:shadow-2xl">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-[#EDF7BD] rounded-3xl flex items-center justify-center mx-auto mb-8 text-[#003049] shadow-inner group-hover:scale-110 transition-transform">
                       {item.icon}
                    </div>
                    <h4 className="text-xl md:text-2xl font-serif font-black text-[#EDF7BD] uppercase italic mb-4 tracking-tight">{item.title}</h4>
                    <p className="text-sm font-medium text-white/80 leading-relaxed font-serif italic">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
         
         <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/5 to-transparent"></div>
      </section>
    </div>
  );
};

export default Home;
