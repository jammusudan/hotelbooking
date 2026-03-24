import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { createNotification } from './src/controllers/notificationController.js';
import { getBookingInitiatedTemplate } from './src/utils/emailTemplates.js';

const testNotification = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const User = (await import('./src/models/User.js')).default;
    const user = await User.findOne({ email: 'jamunaselvammsc98@gmail.com' });
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    
    // Create a mock app object since createNotification expects req.app for socketio
    const mockApp = { get: () => null };
    
    const emailHtml = getBookingInitiatedTemplate({
      userName: user.name,
      hotelName: 'Test Hotel',
      hotelAddress: '123 Test St',
      hotelCity: 'Test City',
      roomType: 'Deluxe Suite',
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 86400000),
      totalAmount: 5000,
      guests: 2,
      nights: 1,
      pricePerNight: 5000
    });
    
    console.log('Triggering createNotification...');
    await createNotification(
      mockApp,
      user._id,
      'booking',
      `Your booking at Test Hotel (Deluxe Suite) has been initiated.`,
      {
        email: user.email,
        subject: 'Navan: Booking Initiated Test',
        html: emailHtml
      }
    );
    
    console.log('Test complete. Check email_log.txt and your inbox.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
testNotification();
