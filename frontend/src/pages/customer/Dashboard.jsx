import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, User, Settings, LogOut, ChevronRight, Award, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    { name: 'My Bookings', icon: Calendar, path: '/my-bookings', description: 'View and manage your reservations' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] py-20 px-4 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-900/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="text-left">
            <h1 className="text-xs font-black uppercase tracking-[0.5em] text-gold-500 mb-4 flex items-center gap-2">
              <Sparkles size={14} /> Customer
            </h1>
            <h2 className="text-5xl md:text-7xl font-serif font-black text-white uppercase tracking-tighter leading-none italic">
              Welcome back, <span className="text-gold-500">{user?.name?.split(' ')[0]}</span>
            </h2>
            <p className="text-gray-500 mt-4 font-medium tracking-wide">Your luxury experience continues here.</p>
          </div>
          <div className="hidden md:flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
            <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-gold-500/20">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-widest">{user?.name}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{user?.role} Tier</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Navigation */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4 ml-2">Legacy Access</h3>
            <div className="grid grid-cols-1 gap-4">
              {menuItems.map((item) => (
                <Link 
                  key={item.name} 
                  to={item.path}
                  className="group flex items-center justify-between p-8 bg-[#111113] border border-white/5 rounded-[2rem] hover:border-gold-500/30 hover:bg-gold-500/5 transition-all duration-500 shadow-2xl"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gold-500 group-hover:scale-110 group-hover:bg-gold-500 group-hover:text-white transition-all duration-500">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="block text-xl font-serif font-black text-white uppercase tracking-tight mb-1 group-hover:text-gold-500 transition-colors">{item.name}</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.description}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-gold-500 group-hover:translate-x-2 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Guest Stats & Actions */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-gradient-to-br from-[#111113] to-[#0a0a0b] rounded-[3rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Award size={150} />
              </div>

              <h3 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
                <Shield size={12} /> Status Protocol
              </h3>

              <div className="space-y-6 mb-12 relative z-10">
                <div className="flex justify-between items-end pb-4 border-b border-white/5">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Customer Tier</span>
                  <span className="text-xl font-serif font-black text-white uppercase italic">Premium Member</span>
                </div>
                <div className="flex justify-between items-end pb-4 border-b border-white/5">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Loyalty Points</span>
                  <span className="text-xl font-serif font-black text-gold-500 uppercase">1,250 PTS</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Since</span>
                  <span className="text-sm font-bold text-white uppercase tracking-widest">Mar 2024</span>
                </div>
              </div>

              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-3 py-5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-rose-500 hover:text-white transition-all transform active:scale-95 shadow-lg shadow-rose-500/5 group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Terminate Session
              </button>
            </div>

            {/* Exclusive Offer Card */}
            <div className="bg-gold-500 p-10 rounded-[3rem] shadow-2xl shadow-gold-500/20 text-black overflow-hidden relative group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 blur-3xl rounded-full"></div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 opacity-70">Privilege Update</h4>
              <p className="text-2xl font-serif font-black uppercase leading-tight italic mb-6">Unlock the Royal Penthouse for 20% less</p>
              <button className="bg-black text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">Secure Access</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
