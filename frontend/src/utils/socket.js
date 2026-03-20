import { io } from 'socket.io-client';

const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  getSocket() {
    if (!this.socket) {
      this.socket = io(backendUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling'], // Fallback to polling for resilience
      });
      
      this.socket.on('connect_error', (err) => {
        console.warn('Socket connection warning:', err.message);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

const socketService = new SocketService();
export default socketService;
