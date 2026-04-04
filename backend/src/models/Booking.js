import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
    },
    adults: {
      type: Number,
      default: 1,
    },
    children: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending',
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    stripeSessionId: {
      type: String,
    },
    stripePaymentId: {
      type: String,
    },
    expiresAt: {
      type: Date,
      // For temporary locks, booking expires if not paid within 15 mins
      default: function () {
        if (this.status === 'Pending') {
          return new Date(Date.now() + 15 * 60 * 1000);
        }
        return null;
      },
    },
  },
  {
    timestamps: true,
  }
);

// TTL Index: Automatically delete document if expiresAt is reached and status is still Pending
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
