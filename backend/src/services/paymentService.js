import Razorpay from 'razorpay';
import Booking from '../models/Booking.js';

/**
 * Core refund logic shared across controllers
 */
export const applyRefund = async (bookingId) => {
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.paymentStatus !== 'Paid') return null;

    // Mock Refund for demo
    if (booking.razorpayOrderId?.startsWith('order_mock_')) {
        booking.paymentStatus = 'Refunded';
        booking.status = 'Cancelled';
        await booking.save();
        return { success: true, message: 'Mock refund processed' };
    }

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const refund = await razorpay.payments.refund(booking.razorpayPaymentId, {
        amount: booking.totalAmount * 100,
        notes: { reason: "Automated cancellation refund" }
    });

    booking.paymentStatus = 'Refunded';
    booking.status = 'Cancelled';
    await booking.save();

    return { success: true, refund };
};
