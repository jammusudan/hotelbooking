import asyncHandler from 'express-async-handler';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

// @desc    Get dashboard stats for manager
// @route   GET /api/manager/dashboard-stats
// @access  Private/Manager
export const getDashboardStats = asyncHandler(async (req, res) => {
  const managerId = req.user._id;

  const hotels = await Hotel.find({ managerId });
  const hotelIds = hotels.map((hotel) => hotel._id);

  const totalHotels = hotels.length;

  const roomStats = await Room.aggregate([
    { $match: { hotelId: { $in: hotelIds } } },
    { $group: { _id: null, totalRooms: { $sum: '$count' } } },
  ]);
  const totalRooms = roomStats.length > 0 ? roomStats[0].totalRooms : 0;

  const bookings = await Booking.find({ hotelId: { $in: hotelIds } });
  const totalBookings = bookings.length;

  const totalRevenue = bookings
    .filter((b) => b.status === 'Confirmed' || b.status === 'Completed')
    .reduce((acc, item) => acc + item.totalAmount, 0);

  // Monthly bookings / revenue (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyStats = await Booking.aggregate([
    {
      $match: {
        hotelId: { $in: hotelIds },
        createdAt: { $gte: sixMonthsAgo },
        status: { $in: ['Confirmed', 'Completed'] },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
        bookings: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    totalHotels,
    totalRooms,
    totalBookings,
    totalRevenue,
    monthlyStats: monthlyStats.map((item) => ({
      month: `${item._id.year}-${item._id.month}`,
      bookings: item.bookings,
      revenue: item.revenue,
    })),
  });
});

// @desc    Get manager hotels
// @route   GET /api/manager/hotels
// @access  Private/Manager
export const getManagerHotels = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find({ managerId: req.user._id });
  res.json(hotels);
});

// @desc    Get manager rooms
// @route   GET /api/manager/rooms
// @access  Private/Manager
export const getManagerRooms = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find({ managerId: req.user._id });
  const hotelIds = hotels.map((h) => h._id);
  const rooms = await Room.find({ hotelId: { $in: hotelIds } }).populate('hotelId', 'name');
  res.json(rooms);
});

// @desc    Get manager bookings
// @route   GET /api/manager/bookings
// @access  Private/Manager
export const getManagerBookings = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find({ managerId: req.user._id });
  const hotelIds = hotels.map((h) => h._id);
  const bookings = await Booking.find({ hotelId: { $in: hotelIds } })
    .populate('userId', 'name email')
    .populate('hotelId', 'name')
    .populate('roomId', 'type');
  res.json(bookings);
});

// @desc    Get manager reviews
// @route   GET /api/manager/reviews
// @access  Private/Manager
export const getManagerReviews = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find({ managerId: req.user._id });
  const hotelIds = hotels.map((h) => h._id);
  const reviews = await Review.find({ hotelId: { $in: hotelIds } })
    .populate('userId', 'name')
    .populate('hotelId', 'name');
  res.json(reviews);
});

// @desc    Update booking status
// @route   PUT /api/manager/bookings/:id/status
// @access  Private/Manager
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['Confirmed', 'Cancelled', 'Completed'].includes(status)) {
    res.status(400);
    throw new Error('Invalid booking status');
  }

  const booking = await Booking.findById(req.params.id).populate('hotelId');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if manager owns the hotel
  if (booking.hotelId.managerId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this booking');
  }

  booking.status = status;
  await booking.save();

  res.json(booking);
});

// @desc    Reply to review
// @route   POST /api/manager/reviews/reply
// @access  Private/Manager
export const replyToReview = asyncHandler(async (req, res) => {
  const { reviewId, managerResponse } = req.body;

  const review = await Review.findById(reviewId).populate('hotelId');

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if manager owns the hotel
  if (review.hotelId.managerId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to reply to this review');
  }

  review.managerResponse = managerResponse;
  await review.save();

  res.json(review);
});

// --- Hotel CRUD for Manager ---

// @desc    Create a hotel
// @route   POST /api/manager/hotels
// @access  Private/Manager
export const createHotel = asyncHandler(async (req, res) => {
  const { name, description, address, city, country, images, amenities } = req.body;

  const hotel = new Hotel({
    managerId: req.user._id,
    name,
    description,
    address,
    city,
    country,
    images: images || [],
    amenities: amenities || [],
  });

  const createdHotel = await hotel.save();
  res.status(201).json(createdHotel);
});

// @desc    Update a hotel
// @route   PUT /api/manager/hotels/:id
// @access  Private/Manager
export const updateHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    res.status(404);
    throw new Error('Hotel not found');
  }

  if (hotel.managerId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this hotel');
  }

  const { name, description, address, city, country, images, amenities } = req.body;

  hotel.name = name || hotel.name;
  hotel.description = description || hotel.description;
  hotel.address = address || hotel.address;
  hotel.city = city || hotel.city;
  hotel.country = country || hotel.country;
  hotel.images = images || hotel.images;
  hotel.amenities = amenities || hotel.amenities;

  const updatedHotel = await hotel.save();
  res.json(updatedHotel);
});

// @desc    Delete a hotel
// @route   DELETE /api/manager/hotels/:id
// @access  Private/Manager
export const deleteHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    res.status(404);
    throw new Error('Hotel not found');
  }

  if (hotel.managerId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this hotel');
  }

  // Delete all rooms associated with the hotel
  await Room.deleteMany({ hotelId: hotel._id });
  await Hotel.deleteOne({ _id: hotel._id });

  res.json({ message: 'Hotel and its rooms removed' });
});

// --- Room CRUD for Manager ---

// @desc    Add a room to manager's hotel
// @route   POST /api/manager/rooms
// @access  Private/Manager
export const addRoom = asyncHandler(async (req, res) => {
  const { hotelId, type, pricePerNight, capacity, adults, children, count, amenities, images } = req.body;

  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    res.status(404);
    throw new Error('Hotel not found');
  }

  if (hotel.managerId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to add rooms to this hotel');
  }

  const room = await Room.create({
    hotelId,
    type,
    pricePerNight,
    capacity,
    adults: adults || 1,
    children: children || 0,
    count,
    amenities: amenities || [],
    images: images || [],
  });

  res.status(201).json(room);
});

// @desc    Update room details
// @route   PUT /api/manager/rooms/:id
// @access  Private/Manager
export const updateRoom = asyncHandler(async (req, res) => {
  const { type, pricePerNight, capacity, adults, children, count, amenities, images, isMaintenance } = req.body;

  let room = await Room.findById(req.params.id);

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  const hotel = await Hotel.findById(room.hotelId);
  if (hotel.managerId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update rooms for this hotel');
  }

  room.type = type || room.type;
  room.pricePerNight = pricePerNight || room.pricePerNight;
  room.capacity = capacity || room.capacity;
  if (adults !== undefined) room.adults = adults;
  if (children !== undefined) room.children = children;
  room.count = count || room.count;
  room.amenities = amenities || room.amenities;
  room.images = images || room.images;
  if (isMaintenance !== undefined) room.isMaintenance = isMaintenance;

  const updatedRoom = await room.save();
  res.json(updatedRoom);
});

// @desc    Delete a room
// @route   DELETE /api/manager/rooms/:id
// @access  Private/Manager
export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  const hotel = await Hotel.findById(room.hotelId);
  if (hotel.managerId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete rooms for this hotel');
  }

  await Room.deleteOne({ _id: room._id });
  res.json({ message: 'Room removed' });
});
