import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || 
          origin.startsWith('http://localhost:') || 
          origin.startsWith('http://127.0.0.1:') || 
          origin === process.env.FRONTEND_URL || 
          (origin.startsWith('https://') && origin.endsWith('.vercel.app'))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join a room based on hotel ID to receive availability updates
  socket.on('join_hotel_room', (hotelId) => {
    socket.join(hotelId);
    console.log(`Socket ${socket.id} joined hotel room: ${hotelId}`);
  });

  // Role-based rooms
  socket.on('join_manager_room', (managerId) => {
    socket.join(`manager_${managerId}`);
    console.log(`Socket ${socket.id} joined manager room: manager_${managerId}`);
  });

  socket.on('join_admin_room', () => {
    socket.join('admin_room');
    console.log(`Socket ${socket.id} joined admin room`);
  });

  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined user room: user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Attach io to app to emit events from controllers
app.set('socketio', io);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    const PORT_NUM = Number(PORT);
    server.listen(PORT_NUM, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT_NUM}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\x1b[31m[CRITICAL ERROR] Port ${PORT_NUM} is already in use.\x1b[0m`);
        console.error(`\x1b[33mThis usually happens if another terminal is already running 'npm run dev'.\x1b[0m`);
        console.error(`\x1b[36mFix: Close all other terminals or run 'npm run clean' to reset.\x1b[0m`);
        process.exit(1);
      } else {
        console.error(`Unexpected server error: ${error.message}`);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error(`Error successfully starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
