import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import './config/passport.js';

import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

const app = express();

// Security Middleware
app.use(helmet());

app.use(cors({
  origin: function (origin, callback) {
    // Allow any localhost/127.0.0.1 port in dev, explicit env URL, or any Vercel deployment
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
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-active-role'],
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
});
app.use('/api', limiter);

import authRoutes from './routes/authRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import managerRoutes from './routes/managerRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js';

// Base Route
app.get('/', (req, res) => {
  res.send('Hotel Booking API is running...');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
// app.use('/api/users', userRoutes); // handled in adminRoutes
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/promotions', promotionRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
