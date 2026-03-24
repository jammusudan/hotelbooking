import React from 'react';
import { Key, ShieldAlert, Smartphone, Fingerprint, Lock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Security = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white py-20 px-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-indigo-900/10 blur-[150px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <button 
            onClick={() => navigate('/customer/dashboard')}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-900 hover:text-indigo-400 transition-colors mb-10 flex items-center gap-4"
        >
            <div className="w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center">←</div>
            Return to Dashboard
        </button>

        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-black text-gray-900 uppercase tracking-tighter italic">
            Account <span className="text-indigo-400">Security</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-900 mt-4">Fortify your digital presence</p>
        </header>

        <div className="space-y-8">
          {/* Password Change Module */}
          <div className="bg-white p-10 rounded-[3rem] border border-white/5 shadow-2xl">
            <div className="flex items-center gap-6 mb-8 border-b border-gray-800 pb-8">
               <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Key className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="text-lg font-serif font-black text-gray-900 uppercase italic">Access Credentials</h3>
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mt-1">Rotate cryptographic passphrase</p>
               </div>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                   <label className="text-[9px] font-black text-gray-900 uppercase tracking-[0.3em]">Current Protocol</label>
                   <input 
                     type="password" 
                     placeholder="••••••••"
                     className="w-full bg-white/50 border border-gray-800 rounded-2xl p-4 text-gray-900 font-bold outline-none focus:border-indigo-400/50 transition-colors"
                   />
                 </div>
                 <div className="space-y-3">
                   <label className="text-[9px] font-black text-gray-900 uppercase tracking-[0.3em]">New Protocol</label>
                   <input 
                     type="password" 
                     placeholder="••••••••"
                     className="w-full bg-white/50 border border-gray-800 rounded-2xl p-4 text-gray-900 font-bold outline-none focus:border-indigo-400/50 transition-colors"
                   />
                 </div>
               </div>
               <div className="pt-4 flex justify-end">
                  <button className="flex items-center gap-3 bg-white/5 text-gray-900 px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-indigo-500 transition-all border border-white/10 shadow-xl active:scale-95">
                    <Lock className="w-4 h-4" /> Enforce New Passphrase
                  </button>
               </div>
            </form>
          </div>

          {/* MFA Module */}
          <div className="bg-white p-10 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <Smartphone className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-lg font-serif font-black text-gray-900 uppercase italic flex items-center gap-3">
                        Two-Factor Auth <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </h3>
                    <p className="text-[10px] font-medium text-gray-900 uppercase tracking-widest mt-2 max-w-sm leading-relaxed">
                        Your account is protected by an additional layer of biometric and temporal security.
                    </p>
                </div>
              </div>
              <button disabled className="px-6 py-3 bg-white text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed border border-gray-800">
                  Active Profile
              </button>
          </div>

          {/* Active Sessions */}
          <div className="bg-white p-10 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-lg font-serif font-black text-gray-900 uppercase italic">Active Deployments</h3>
                    <p className="text-[10px] font-medium text-gray-900 uppercase tracking-widest mt-2 max-w-sm leading-relaxed">
                        Terminate all active browser and device sessions globally to ensure containment.
                    </p>
                </div>
              </div>
              <button className="px-6 py-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-rose-500/20 shadow-lg shadow-rose-500/5 hover:scale-105 active:scale-95">
                  Purge Sessions
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
