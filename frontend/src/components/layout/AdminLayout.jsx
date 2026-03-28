import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext, api } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  CheckCircle, 
  Hotel, 
  Users, 
  BookOpen, 
  CreditCard, 
  Tag, 
  MessageSquare, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  ShieldAlert,
  Loader2
} from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Approve Hotels', icon: CheckCircle, path: '/admin/approve-hotels' },
    { name: 'Manage Hotels', icon: Hotel, path: '/admin/hotels' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Bookings', icon: BookOpen, path: '/admin/bookings' },
    { name: 'Payments', icon: CreditCard, path: '/admin/payments' },
    { name: 'Promotions', icon: Tag, path: '/admin/promotions' },
    { name: 'Reviews', icon: MessageSquare, path: '/admin/reviews' },
    { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await api.get(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(data);
      } catch (error) {
        console.error('Search telemetry failed', error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#EDF7BD] flex font-sans text-black">
    <>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#003049] border-r border-white/5 shadow-2xl transform transition-transform duration-500 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 h-screen sticky top-0`}
      >
        <div className="h-full flex flex-col">
          <div className="p-8 pb-10 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-serif font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                <div className="w-8 h-8 overflow-hidden rounded-lg bg-[#EDF7BD] p-1 shadow-lg">
                  <img src="/logo.png" alt="Navan" className="w-full h-full object-contain" />
                </div>
                <span className="tracking-tighter">Navan</span>
              </h1>
              <p className="text-[9px] font-bold text-[#EDF7BD]/40 tracking-[0.3em] mt-1.5 uppercase">Admin Console</p>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-white/40 hover:text-white lg:hidden transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-grow px-4 pb-8 space-y-1.5 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#EDF7BD] text-[#003049] shadow-2xl scale-[1.02]' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-[#003049]' : ''}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-8 border-t border-white/5 bg-black/10">
            <div className="mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#EDF7BD] font-black shadow-inner">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-white truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-[8px] font-bold text-[#EDF7BD]/40 uppercase tracking-widest leading-none mt-1 truncate">Console Master</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 bg-rose-500/10 text-rose-400 py-4 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:bg-rose-500 hover:text-white group border border-rose-500/20"
            >
              <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Exit Protocol</span>
            </button>
          </div>
        </div>
      </aside>
    </>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white/40 backdrop-blur-3xl border-b border-black/5 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 shadow-sm">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3 text-[#003049] hover:bg-[#003049]/5 rounded-xl transition-colors lg:hidden bg-white/50 border border-black/5"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1 px-4 lg:px-0">
            <h2 className="text-sm font-serif font-black text-[#003049] tracking-[0.2em] uppercase italic">
              Console <span className="hidden sm:inline">Overview</span>
            </h2>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden lg:flex relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#003049]/40" />
              <input 
                type="text" 
                placeholder="Search telemetry..." 
                className="bg-[#003049]/5 border border-black/5 rounded-xl py-2.5 pl-10 pr-4 text-[11px] font-black text-[#003049] placeholder-[#003049]/30 outline-none w-48 focus:w-64 transition-all focus:bg-white focus:shadow-xl"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              
              {showDropdown && searchQuery.trim() && (
                <div className="absolute top-full mt-4 right-0 w-80 bg-transparent border border-gray-800 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-4">
                  {isSearching ? (
                     <div className="flex items-center justify-center py-8 text-black">
                        <Loader2 className="w-5 h-5 animate-spin" />
                     </div>
                  ) : !searchResults ? null : (
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {searchResults.users?.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-black mb-3">Patrons Found</h4>
                          <div className="space-y-2">
                             {searchResults.users.map(u => (
                               <div key={u._id} className="flex flex-col p-3 bg-[#EDF7BD]/40 border border-white/5 rounded-xl hover:border-[#EDF7BD]/30 transition-all cursor-default">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-black">{u.name}</span>
                                    <span className="text-[9px] font-black uppercase text-black">{u.role}</span>
                                  </div>
                                  <span className="text-[10px] text-black">{u.email}</span>
                               </div>
                             ))}
                          </div>
                        </div>
                      )}

                      {searchResults.hotels?.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-black mb-3">Sanctuaries Found</h4>
                          <div className="space-y-2">
                             {searchResults.hotels.map(h => (
                               <div key={h._id} className="flex flex-col p-3 bg-[#EDF7BD]/40 border border-white/5 rounded-xl hover:border-[#EDF7BD]/30 transition-all cursor-default">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-black italic truncate pr-2">{h.name}</span>
                                    <span className={`text-[9px] font-black uppercase ${h.isApproved ? 'text-emerald-500' : 'text-rose-500'}`}>{h.isApproved ? 'Active' : 'Halted'}</span>
                                  </div>
                                  <span className="text-[10px] text-black uppercase tracking-widest">{h.city}, {h.country}</span>
                               </div>
                             ))}
                          </div>
                        </div>
                      )}

                      {searchResults.users?.length === 0 && searchResults.hotels?.length === 0 && (
                         <div className="py-6 text-center text-[10px] font-bold uppercase tracking-widest text-black">
                           No Telemetry Fragments Located
                         </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button className="p-2.5 text-white hover:bg-white/10 rounded-xl relative border border-white/20 group">
              <Bell className="w-5 h-5 group-hover:text-white transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#EDF7BD] rounded-full border-2 border-white shadow-[0_0_8px_rgba(212,175,55,0.4)]"></span>
            </button>

            {/* Root Admin Profile Dropdown */}
            <div className="flex items-center gap-4 pl-4 border-l border-white/20 relative" ref={profileRef}>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-white uppercase tracking-tighter">Root Admin</p>
                <div className="h-0.5 w-full bg-[#EDF7BD]/50 mt-0.5"></div>
              </div>
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-10 h-10 rounded-xl bg-[#EDF7BD] border border-gray-800 flex items-center justify-center text-black shadow-inner hover:bg-gray-800 transition-colors focus:outline-none"
              >
                <ShieldAlert className="w-5 h-5" />
              </button>

              {/* Profile Menu Overlay */}
              {showProfileDropdown && (
                <div className="absolute top-full mt-4 right-0 w-64 bg-transparent border border-gray-800 rounded-2xl shadow-2xl p-5 animate-in fade-in slide-in-from-top-4 z-50">
                  <div className="pb-4 border-b border-gray-800/50 mb-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#EDF7BD] to-[#EDF7BD] mx-auto flex items-center justify-center text-black font-black text-lg mb-3 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                      {user?.name?.charAt(0) || 'A'}
                    </div>
                    <p className="text-xs font-black text-black">{user?.name || 'Administrator'}</p>
                    <p className="text-[10px] text-black uppercase tracking-widest mt-1">{user?.email}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-[10px] font-black text-black uppercase tracking-widest mb-2">System Status</p>
                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Global Telemetry</span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-black transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    <LogOut className="w-4 h-4" /> Terminate Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
