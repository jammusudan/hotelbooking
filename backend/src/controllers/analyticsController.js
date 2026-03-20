import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';

// @desc    Get analytics for manager
// @route   GET /api/analytics/manager
// @access  Private/Manager
const getManagerAnalytics = async (req, res, next) => {
    try {
        const { hotelId } = req.query;
        let hotelFilter = { managerId: req.user._id };
        if (hotelId) hotelFilter._id = hotelId;

        const hotels = await Hotel.find(hotelFilter);
        const hotelIds = hotels.map(h => h._id);

        // 1. Total Revenue (Confirmed bookings)
        const bookings = await Booking.find({ 
            hotelId: { $in: hotelIds },
            status: 'Confirmed'
        });

        const totalRevenue = bookings.reduce((acc, curr) => acc + curr.totalAmount, 0);

        // 2. Booking Stats
        const stats = {
            total: bookings.length,
            pending: await Booking.countDocuments({ hotelId: { $in: hotelIds }, status: 'Pending' }),
            cancelled: await Booking.countDocuments({ hotelId: { $in: hotelIds }, status: 'Cancelled' })
        };

        // 3. Occupancy calculation (simplified: % of rooms with active bookings today)
        const today = new Date();
        const activeBookingsToday = await Booking.countDocuments({
            hotelId: { $in: hotelIds },
            status: 'Confirmed',
            checkIn: { $lte: today },
            checkOut: { $gte: today }
        });

        const rooms = await Room.find({ hotelId: { $in: hotelIds } });
        const totalRoomUnitsAvailable = rooms.reduce((acc, r) => acc + (r.isMaintenance ? 0 : r.count), 0);

        const occupancyRate = totalRoomUnitsAvailable > 0 
            ? Math.round((activeBookingsToday / totalRoomUnitsAvailable) * 100) 
            : 0;

        // 4. Monthly Revenue (Last 6 months)
        const monthlyRevenue = [];
        for (let i = 5; i >= 0; i--) {
            const start = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const end = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
            
            const monthBookings = bookings.filter(b => b.createdAt >= start && b.createdAt <= end);
            const revenue = monthBookings.reduce((acc, curr) => acc + curr.totalAmount, 0);
            
            monthlyRevenue.push({
                month: start.toLocaleString('default', { month: 'short' }),
                revenue
            });
        }

        res.json({
            totalRevenue,
            stats,
            occupancyRate,
            monthlyRevenue,
            hotelCount: hotels.length
        });

    } catch (error) {
        next(error);
    }
};

export { getManagerAnalytics };
