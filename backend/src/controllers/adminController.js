import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get unapproved hotels
// @route   GET /api/admin/hotels/pending
// @access  Private/Admin
const getPendingHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find({ isApproved: false }).populate(
      'managerId',
      'name email'
    );
    res.json(hotels);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a hotel
// @route   PUT /api/admin/hotels/:id/approve
// @access  Private/Admin
const approveHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (hotel) {
      hotel.isApproved = true;
      const updatedHotel = await hotel.save();
      res.json(updatedHotel);
    } else {
      res.status(404);
      throw new Error('Hotel not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all hotels
// @route   GET /api/admin/hotels
// @access  Private/Admin
const getAllHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find({}).populate('managerId', 'name email');
    res.json(hotels);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({})
      .populate('userId', 'name email')
      .populate('hotelId', 'name')
      .populate('roomId', 'type')
      .sort('-createdAt');
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a hotel
// @route   DELETE /api/admin/hotels/:id
// @access  Private/Admin
const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (hotel) {
      await hotel.deleteOne();
      res.json({ message: 'Sanctuary removed from platform' });
    } else {
      res.status(404);
      throw new Error('Hotel not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalHotels = await Hotel.countDocuments({ isApproved: true });
    
    // Revenue & Bookings
    const confirmedBookings = await Booking.find({ paymentStatus: 'Paid' });
    const totalBookings = confirmedBookings.length;
    const totalRevenue = confirmedBookings.reduce((acc, b) => acc + b.totalAmount, 0);

    // Most Booked Hotels Aggregation
    const hotelStats = await Booking.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: '$hotelId', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'hotels', localField: '_id', foreignField: '_id', as: 'hotelInfo' } },
      { $unwind: '$hotelInfo' }
    ]);

    // Customer Growth Trends (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const growthStats = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { 
          _id: { $month: '$createdAt' }, 
          count: { $sum: 1 } 
      }},
      { $sort: { '_id': 1 } }
    ]);

    // Revenue Trends (Last 6 Months)
    const revenueStats = await Booking.aggregate([
      { $match: { paymentStatus: 'Paid', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { 
          _id: { $month: '$createdAt' }, 
          total: { $sum: '$totalAmount' } 
      }},
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      totalUsers,
      totalHotels,
      totalBookings,
      totalRevenue,
      mostBooked: hotelStats,
      growth: growthStats,
      revenueTrends: revenueStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Global omni-search for Admin
// @route   GET /api/admin/search
// @access  Private/Admin
const searchTelemetry = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') return res.json({ users: [], hotels: [] });

    // Use regex to find matching patrons and sanctuaries
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).limit(5).select('name email role');

    const hotels = await Hotel.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } }
      ]
    }).limit(5).select('name city country isApproved');

    res.json({ users, hotels });
  } catch (error) {
    next(error);
  }
};

export { getUsers, getPendingHotels, approveHotel, getAllHotels, getAllBookings, deleteHotel, getAnalytics, searchTelemetry };
