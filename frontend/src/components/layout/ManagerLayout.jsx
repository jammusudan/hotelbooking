import React, { useState, useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Hotel, 
  Bed, 
  BookOpen, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  Bell,
  User as UserIcon
} from 'lucide-react';

const ManagerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/manager/dashboard' },
    { name: 'Manage Hotels', icon: Hotel, path: '/manager/hotels' },
    { name: 'Manage Rooms', icon: Bed, path: '/manager/rooms' },
    { name: 'Bookings', icon: BookOpen, path: '/manager/bookings' },
    { name: 'Reviews', icon: MessageSquare, path: '/manager/reviews' },
  ];

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
              <p className="text-[9px] font-bold text-[#EDF7BD]/40 tracking-[0.3em] mt-1.5 uppercase">Management Portal</p>
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
                  {user?.name?.charAt(0) || 'M'}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-white truncate">{user?.name || 'Manager'}</p>
                  <p className="text-[8px] font-bold text-[#EDF7BD]/40 uppercase tracking-widest leading-none mt-1 truncate">Estate Curator</p>
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
        <header className="h-20 bg-white/40 backdrop-blur-3xl border-b border-black/5 flex items-center justify-between px-6 md:px-8 sticky top-0 z-40 shadow-sm">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3 text-[#003049] hover:bg-[#003049]/5 rounded-xl transition-colors lg:hidden bg-white/50 border border-black/5"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1 px-4 lg:px-0">
            <h2 className="text-sm font-serif font-black text-[#003049] tracking-[0.2em] uppercase italic">
              Manager <span className="hidden sm:inline">Console</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-white hover:bg-white/10 rounded-xl relative border border-white/20 shadow-inner group">
              <Bell className="w-5 h-5 group-hover:text-white transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#EDF7BD] rounded-full border-2 border-white shadow-[0_0_8px_rgba(212,175,55,0.4)]"></span>
            </button>
            <div className="flex items-center gap-4 pl-4 border-l border-white/20">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-white uppercase tracking-tighter">Manager</p>
                <div className="h-0.5 w-full bg-[#EDF7BD]/50 mt-0.5"></div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#EDF7BD] border border-gray-800 flex items-center justify-center text-black shadow-inner">
                <UserIcon className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
