import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Save, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#EDF7BD] py-20 px-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-[#281C59]/10 blur-[150px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <button 
            onClick={() => navigate('/customer/dashboard')}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-[#281C59] hover:text-[#281C59] transition-colors mb-10 flex items-center gap-4"
        >
            <div className="w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center">←</div>
            Return to Dashboard
        </button>

        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-black text-[#281C59] uppercase tracking-tighter italic">
            Profile <span className="text-[#281C59]">Settings</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#281C59] mt-4">Manage your personal legacy identity</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-[#EDF7BD] p-10 rounded-[3rem] border border-white/5 flex flex-col items-center text-center shadow-2xl">
              <div className="w-32 h-32 rounded-full bg-[#281C59] flex items-center justify-center text-black font-black text-5xl mb-6 shadow-xl shadow-[#281C59]/20">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <h2 className="text-xl font-serif font-black uppercase text-[#281C59] italic">{user?.name}</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#281C59] mt-2">{user?.role} Tier</p>
            </div>
            
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem] flex items-center gap-4">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                <div>
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Identity Verified</p>
                   <p className="text-xs font-bold text-[#281C59] mt-1">Navan Secure Auth</p>
                </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-[#EDF7BD] p-12 rounded-[3rem] border border-white/5 shadow-2xl">
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-[#281C59] uppercase tracking-[0.3em] flex items-center gap-2">
                        <User className="w-3 h-3" /> Full Legal Name
                    </label>
                    <input 
                      type="text" 
                      defaultValue={user?.name}
                      className="w-full bg-[#EDF7BD]/50 border border-gray-800 rounded-2xl p-4 text-[#281C59] font-bold outline-none focus:border-[#281C59]/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-[#281C59] uppercase tracking-[0.3em] flex items-center gap-2">
                        <Mail className="w-3 h-3" /> Electronic Mail
                    </label>
                    <input 
                      type="email" 
                      defaultValue={user?.email}
                      className="w-full bg-[#EDF7BD]/50 border border-gray-800 rounded-2xl p-4 text-[#281C59] font-bold outline-none cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-[#281C59] uppercase tracking-[0.3em] flex items-center gap-2">
                        <Phone className="w-3 h-3" /> Contact Telemetry
                    </label>
                    <input 
                      type="text" 
                      placeholder="+91 Add Secure Line"
                      className="w-full bg-[#EDF7BD]/50 border border-gray-800 rounded-2xl p-4 text-[#281C59] font-bold outline-none focus:border-[#281C59]/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-[#281C59] uppercase tracking-[0.3em] flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Primary Stronghold
                    </label>
                    <input 
                      type="text" 
                      placeholder="Add Residency Location"
                      className="w-full bg-[#EDF7BD]/50 border border-gray-800 rounded-2xl p-4 text-[#281C59] font-bold outline-none focus:border-[#281C59]/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-800/50 flex justify-end">
                  <button className="flex items-center gap-3 bg-[#281C59] text-[#EDF7BD] px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-white transition-all shadow-xl shadow-[#281C59]/10 active:scale-95">
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
