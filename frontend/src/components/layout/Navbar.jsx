import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Change nav background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isHome = location.pathname === '/';
  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/manager');

  // Use transparent bg on home top, dark otherwise
  const navClasses = `fixed w-full z-50 transition-all duration-300 border-b ${
     scrolled 
        ? 'bg-[#0992C2]/90 backdrop-blur-xl border-gray-800/50 py-3 shadow-2xl' 
        : (isHome ? 'bg-transparent border-transparent py-5' : 'bg-[#0992C2] border-gray-800 py-4 shadow-lg')
  }`;

  const linkColor = scrolled ? 'text-black hover:text-black' : (isHome ? 'text-black hover:text-black' : 'text-black hover:text-black');
  const logoColor = 'text-black hover:text-black';

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          <Link to="/" className={`text-2xl md:text-3xl font-serif font-bold ${logoColor} transition flex items-center gap-3 group`}>
            <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-[#EDF7BD]/10 p-1 group-hover:scale-110 transition-transform duration-300">
              <img src="/logo.png" alt="Navan Logo" className="w-full h-full object-contain" />
            </div>
            <span className="tracking-tight">Navan</span>
          </Link>
          
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className={`text-sm font-medium tracking-wide transition ${linkColor}`}>Home</Link>
            <Link to="/hotels" className={`text-sm font-medium tracking-wide transition ${linkColor}`}>Destinations</Link>
            
            {user ? (
              <div className="relative group flex items-center space-x-6 pl-6 border-l border-gray-300/30">
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] uppercase font-black tracking-widest ${scrolled ? 'text-black' : 'text-black'}`}>{user.role}</span>
                  <span className={`text-sm tracking-wide font-bold ${linkColor}`}>{user.name.split(' ')[0]}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <NotificationBell />
                  {user.role === 'admin' ? (
                    <Link to="/admin/dashboard" className="bg-[#EDF7BD]/10 hover:bg-[#EDF7BD]/20 text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all border border-white/10">Console</Link>
                  ) : user.role === 'manager' ? (
                    <Link to="/manager/dashboard" className="bg-blue-600 hover:bg-blue-700 text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-600/20">Portal</Link>
                  ) : (
                    <>
                      <Link to="/customer/dashboard" className={`text-xs font-bold uppercase tracking-widest transition ${linkColor}`}>Dashboard</Link>
                      <Link to="/my-bookings" className={`text-xs font-bold uppercase tracking-widest transition ${linkColor}`}>Bookings</Link>
                    </>
                  )}

                  <button 
                    onClick={handleLogout} 
                    className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-black rounded-lg transition-all border border-rose-500/20"
                  >
                    Exit
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-x-4 flex items-center pl-6 border-l border-gray-300/30">
                <Link to="/login" className={`text-sm font-medium tracking-wide transition ${linkColor}`}>Log In</Link>
                <Link to="/register" className="bg-[#0992C2] hover:bg-[#0992C2] text-black text-sm font-bold px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all">Join Now</Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {user && (
               <div className="mr-4 mt-1">
                 <NotificationBell />
               </div>
            )}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl transition-colors ${linkColor} hover:bg-[#EDF7BD]/10`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-[#0992C2]/95 backdrop-blur-3xl border-b border-gray-800 shadow-2xl transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-[500px] py-4' : 'max-h-0 py-0 border-transparent'
        }`}
      >
        <div className="px-6 flex flex-col space-y-4">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-black hover:text-black font-medium py-2 border-b border-gray-800/50">Home</Link>
          <Link to="/hotels" onClick={() => setIsMobileMenuOpen(false)} className="text-black hover:text-black font-medium py-2 border-b border-gray-800/50">Destinations</Link>
          
          {user ? (
            <div className="pt-2 flex flex-col space-y-4">
              <div className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-full bg-[#0992C2] flex items-center justify-center text-black font-black text-lg">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-black font-bold">{user.name}</p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-black">{user.role}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                  {user.role === 'admin' ? (
                    <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-center bg-[#EDF7BD]/10 hover:bg-[#EDF7BD]/20 text-black text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-lg transition-all border border-white/10">Console</Link>
                  ) : user.role === 'manager' ? (
                    <Link to="/manager/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-center bg-blue-600 hover:bg-blue-700 text-black text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-lg transition-all shadow-lg shadow-blue-600/20">Portal</Link>
                  ) : (
                    <>
                      <Link to="/customer/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-center bg-[#EDF7BD]/5 hover:bg-[#EDF7BD]/10 text-black text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-lg transition-all border border-white/5">Dashboard</Link>
                      <Link to="/my-bookings" onClick={() => setIsMobileMenuOpen(false)} className="text-center bg-[#EDF7BD]/5 hover:bg-[#EDF7BD]/10 text-black text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-lg transition-all border border-white/5">Bookings</Link>
                    </>
                  )}
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} 
                    className="col-span-2 mt-2 text-[10px] font-black uppercase tracking-widest px-4 py-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-black rounded-lg transition-all border border-rose-500/20"
                  >
                    Logout
                  </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 flex flex-col space-y-3">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center bg-[#EDF7BD]/5 hover:bg-[#EDF7BD]/10 text-black font-medium py-3 rounded-xl transition border border-white/5">Log In</Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-center bg-[#0992C2] hover:bg-[#0992C2] text-black font-bold py-3 rounded-xl shadow-lg transition-all">Join Now</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
