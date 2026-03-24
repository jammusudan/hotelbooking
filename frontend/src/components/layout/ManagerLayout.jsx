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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FE81D4] flex font-sans text-gray-900">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#111114] border-r border-gray-800/50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 h-screen sticky top-0`}
      >
        <div className="h-full flex flex-col">
          <div className="p-8 pb-12">
            <h1 className="text-xl font-serif font-black text-gray-900 tracking-tighter uppercase italic flex items-center gap-3">
              <div className="w-8 h-8 overflow-hidden rounded-lg bg-white/5 p-1">
                <img src="/logo.png" alt="Navan Logo" className="w-full h-full object-contain" />
              </div>
              <span>Navan</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-900 tracking-[0.3em] mt-2">MANAGEMENT PORTAL</p>
          </div>

          <nav className="flex-grow px-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-[#FE81D4] text-gray-900 shadow-lg shadow-[#FE81D4]/20' 
                      : 'text-gray-900 hover:bg-gray-800 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gray-900'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-8 border-t border-gray-800/50">
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FE81D4] to-[#FE81D4] flex items-center justify-center text-black font-black">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900">{user?.name}</p>
                  <p className="text-[9px] font-bold text-gray-900 uppercase tracking-widest">Manager</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-gray-900 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-all italic"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Protocol</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-[#FE81D4]/80 backdrop-blur-md border-b border-gray-800/50 flex items-center justify-between px-8 sticky top-0 z-40">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-900 hover:bg-gray-800/50 rounded-xl lg:hidden"
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>

          <div className="flex-1 px-4 lg:px-0">
            <h2 className="text-sm font-serif font-black text-gray-900 tracking-widest uppercase italic hidden sm:block">
              Manager Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-gray-900 hover:bg-gray-800/50 rounded-xl relative border border-gray-800/50 shadow-inner group">
              <Bell className="w-5 h-5 group-hover:text-gray-900 transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#FE81D4] rounded-full border-2 border-[#FAACBF] shadow-[0_0_8px_rgba(212,175,55,0.4)]"></span>
            </button>
            <div className="flex items-center gap-4 pl-4 border-l border-gray-800/50">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">Manager</p>
                <div className="h-0.5 w-full bg-[#FE81D4]/30 mt-0.5"></div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FE81D4] border border-gray-800 flex items-center justify-center text-gray-900 shadow-inner">
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
