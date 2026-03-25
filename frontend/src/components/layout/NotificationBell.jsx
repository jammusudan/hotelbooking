import { useState, useEffect, useContext, useRef } from 'react';
import { Bell, Check, Trash2, ShieldAlert, Sparkles, Receipt, X } from 'lucide-react';
import { AuthContext, api } from '../../context/AuthContext';
import socketService from '../../utils/socket';

const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Socket.io Setup
    socketRef.current = socketService.getSocket();

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_user_room', user._id);
    });

    socketRef.current.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Optional: Play subtle sound
      // const audio = new Audio('/notification-sound.mp3');
      // audio.play().catch(() => {});
    });

    return () => {
      // Intentionally NOT disconnecting the singleton socket on unmount during Dev to prevent StrictMode abort errors.
      // The socket stays alive globally while the app is running.
      socketRef.current.off('new_notification');
      socketRef.current.off('connect');
    };
  }, [user]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'booking': return <Sparkles size={14} className="text-black" />;
      case 'payment': return <Receipt size={14} className="text-green-500" />;
      case 'cancellation': return <ShieldAlert size={14} className="text-rose-500" />;
      default: return <Bell size={14} className="text-blue-500" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-black hover:text-black transition-colors bg-[#EDF7BD]/5 rounded-full border border-white/5"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#0B2D72] text-[10px] font-black text-black rounded-full flex items-center justify-center animate-pulse border border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-[#EDF7BD] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-black">Navan Protocol Alerts</h3>
            <button onClick={() => setIsOpen(false)}><X size={14} className="text-black hover:text-black" /></button>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[10px] uppercase font-bold text-black tracking-widest">No Active Alerts</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n._id} 
                  className={`p-4 border-b border-white/5 flex gap-4 transition-colors ${n.isRead ? 'opacity-60' : 'bg-[#EDF7BD]/[0.02] border-l-2 border-l-[#0B2D72]'}`}
                >
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-[#EDF7BD]/5 flex items-center justify-center border border-white/5">
                      {getIcon(n.type)}
                    </div>
                  </div>
                  <div className="flex-grow space-y-1">
                    <p className={`text-xs leading-relaxed ${n.isRead ? 'text-black' : 'text-black font-medium'}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] uppercase font-black text-black tracking-widest">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!n.isRead && (
                        <button 
                          onClick={() => markAsRead(n._id)}
                          className="text-[9px] font-black text-black hover:text-black uppercase tracking-widest flex items-center gap-1"
                        >
                          Clear <Check size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-[#EDF7BD]/40 text-center">
            <p className="text-[9px] uppercase font-black text-black tracking-[0.2em]">Secure Notification Node v1.0</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
