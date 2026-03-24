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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    <div className="min-h-screen bg-[#281C59] flex font-sans text-[#EDF7BD]">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#111114] border-r border-gray-800/50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 h-screen sticky top-0`}
      >
        <div className="h-full flex flex-col">
          <div className="p-8 pb-12">
            <h1 className="text-xl font-serif font-black text-[#EDF7BD] tracking-tighter uppercase italic flex items-center gap-3">
              <div className="w-8 h-8 overflow-hidden rounded-lg bg-white/5 p-1 border border-white/10">
                <img src="/logo.png" alt="Navan" className="w-full h-full object-contain" />
              </div>
              <span className="tracking-tighter">Navan</span>
            </h1>
            <p className="text-[10px] font-bold text-[#EDF7BD] tracking-[0.3em] mt-2 uppercase">Admin Console</p>
          </div>

          <nav className="flex-grow px-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-[#281C59] text-[#EDF7BD] shadow-lg shadow-[#281C59]/20' 
                      : 'text-[#EDF7BD] hover:bg-gray-800 hover:text-[#EDF7BD]'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-[#EDF7BD]'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-8 border-t border-gray-800/50">
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#281C59] to-[#281C59] flex items-center justify-center text-black font-black">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="text-xs font-black text-[#EDF7BD]">{user?.name || 'Administrator'}</p>
                  <p className="text-[9px] font-bold text-[#EDF7BD] uppercase tracking-widest leading-none mt-1">Console Master</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-[#EDF7BD] hover:text-rose-400 text-[10px] font-black uppercase tracking-widest transition-all italic group"
            >
              <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Exit Protocol</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-[#281C59]/80 backdrop-blur-md border-b border-gray-800/50 flex items-center justify-between px-8 sticky top-0 z-40">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-[#EDF7BD] hover:bg-gray-800/50 rounded-xl lg:hidden"
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>

          <div className="flex-1 px-4 lg:px-0">
            <h2 className="text-sm font-serif font-black text-[#EDF7BD] tracking-widest uppercase italic hidden sm:block">
              Admin Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input 
                type="text" 
                placeholder="Search telemetry..." 
                className="bg-white/5 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-[#EDF7BD] focus:border-[#281C59]/50 outline-none w-48 focus:w-64 transition-all"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              
              {showDropdown && searchQuery.trim() && (
                <div className="absolute top-full mt-4 right-0 w-80 bg-[#111114] border border-gray-800 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-4">
                  {isSearching ? (
                     <div className="flex items-center justify-center py-8 text-[#EDF7BD]">
                        <Loader2 className="w-5 h-5 animate-spin" />
                     </div>
                  ) : !searchResults ? null : (
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {searchResults.users?.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#EDF7BD] mb-3">Patrons Found</h4>
                          <div className="space-y-2">
                             {searchResults.users.map(u => (
                               <div key={u._id} className="flex flex-col p-3 bg-[#281C59]/40 border border-white/5 rounded-xl hover:border-[#281C59]/30 transition-all cursor-default">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-[#EDF7BD]">{u.name}</span>
                                    <span className="text-[9px] font-black uppercase text-[#EDF7BD]">{u.role}</span>
                                  </div>
                                  <span className="text-[10px] text-[#EDF7BD]">{u.email}</span>
                               </div>
                             ))}
                          </div>
                        </div>
                      )}

                      {searchResults.hotels?.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#EDF7BD] mb-3">Sanctuaries Found</h4>
                          <div className="space-y-2">
                             {searchResults.hotels.map(h => (
                               <div key={h._id} className="flex flex-col p-3 bg-[#281C59]/40 border border-white/5 rounded-xl hover:border-[#281C59]/30 transition-all cursor-default">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-[#EDF7BD] italic truncate pr-2">{h.name}</span>
                                    <span className={`text-[9px] font-black uppercase ${h.isApproved ? 'text-emerald-500' : 'text-rose-500'}`}>{h.isApproved ? 'Active' : 'Halted'}</span>
                                  </div>
                                  <span className="text-[10px] text-[#EDF7BD] uppercase tracking-widest">{h.city}, {h.country}</span>
                               </div>
                             ))}
                          </div>
                        </div>
                      )}

                      {searchResults.users?.length === 0 && searchResults.hotels?.length === 0 && (
                         <div className="py-6 text-center text-[10px] font-bold uppercase tracking-widest text-gray-600">
                           No Telemetry Fragments Located
                         </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button className="p-2.5 text-[#EDF7BD] hover:bg-gray-800/50 rounded-xl relative border border-gray-800/50 group">
              <Bell className="w-5 h-5 group-hover:text-[#EDF7BD] transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#281C59] rounded-full border-2 border-[#EDF7BD] shadow-[0_0_8px_rgba(212,175,55,0.4)]"></span>
            </button>

            {/* Root Admin Profile Dropdown */}
            <div className="flex items-center gap-4 pl-4 border-l border-gray-800/50 relative" ref={profileRef}>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-[#EDF7BD] uppercase tracking-tighter">Root Admin</p>
                <div className="h-0.5 w-full bg-[#281C59]/30 mt-0.5"></div>
              </div>
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-10 h-10 rounded-xl bg-[#281C59] border border-gray-800 flex items-center justify-center text-[#EDF7BD] shadow-inner hover:bg-gray-800 transition-colors focus:outline-none"
              >
                <ShieldAlert className="w-5 h-5" />
              </button>

              {/* Profile Menu Overlay */}
              {showProfileDropdown && (
                <div className="absolute top-full mt-4 right-0 w-64 bg-[#111114] border border-gray-800 rounded-2xl shadow-2xl p-5 animate-in fade-in slide-in-from-top-4 z-50">
                  <div className="pb-4 border-b border-gray-800/50 mb-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#281C59] to-[#281C59] mx-auto flex items-center justify-center text-black font-black text-lg mb-3 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                      {user?.name?.charAt(0) || 'A'}
                    </div>
                    <p className="text-xs font-black text-[#EDF7BD]">{user?.name || 'Administrator'}</p>
                    <p className="text-[10px] text-[#EDF7BD] uppercase tracking-widest mt-1">{user?.email}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-[10px] font-black text-[#EDF7BD] uppercase tracking-widest mb-2">System Status</p>
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
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-[#EDF7BD] transition-all text-[10px] font-black uppercase tracking-widest"
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
