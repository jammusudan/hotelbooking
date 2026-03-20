import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Save, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0b] py-20 px-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-gold-900/10 blur-[150px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <button 
            onClick={() => navigate('/customer/dashboard')}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-gold-500 transition-colors mb-10 flex items-center gap-4"
        >
            <div className="w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center">←</div>
            Return to Dashboard
        </button>

        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-black text-white uppercase tracking-tighter italic">
            Profile <span className="text-gold-500">Settings</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mt-4">Manage your personal legacy identity</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-[#111113] p-10 rounded-[3rem] border border-white/5 flex flex-col items-center text-center shadow-2xl">
              <div className="w-32 h-32 rounded-full bg-gold-500 flex items-center justify-center text-black font-black text-5xl mb-6 shadow-xl shadow-gold-500/20">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <h2 className="text-xl font-serif font-black uppercase text-white italic">{user?.name}</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold-500 mt-2">{user?.role} Tier</p>
            </div>
            
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem] flex items-center gap-4">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                <div>
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Identity Verified</p>
                   <p className="text-xs font-bold text-gray-400 mt-1">Navan Secure Auth</p>
                </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-[#111113] p-12 rounded-[3rem] border border-white/5 shadow-2xl">
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <User className="w-3 h-3" /> Full Legal Name
                    </label>
                    <input 
                      type="text" 
                      defaultValue={user?.name}
                      className="w-full bg-black/50 border border-gray-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-gold-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Mail className="w-3 h-3" /> Electronic Mail
                    </label>
                    <input 
                      type="email" 
                      defaultValue={user?.email}
                      className="w-full bg-black/50 border border-gray-800 rounded-2xl p-4 text-gray-400 font-bold outline-none cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Phone className="w-3 h-3" /> Contact Telemetry
                    </label>
                    <input 
                      type="text" 
                      placeholder="+91 Add Secure Line"
                      className="w-full bg-black/50 border border-gray-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-gold-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Primary Stronghold
                    </label>
                    <input 
                      type="text" 
                      placeholder="Add Residency Location"
                      className="w-full bg-black/50 border border-gray-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-gold-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-800/50 flex justify-end">
                  <button className="flex items-center gap-3 bg-gold-500 text-black px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-white transition-all shadow-xl shadow-gold-500/10 active:scale-95">
                    <Save className="w-4 h-4" /> Save Modifications
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
