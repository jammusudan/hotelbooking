import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';

// @desc    Get rooms for a hotel
// @route   GET /api/hotels/:hotelId/rooms
// @access  Public
const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ hotelId: req.params.hotelId });
    res.json(rooms);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a room to hotel
// @route   POST /api/hotels/:hotelId/rooms
// @access  Private/Manager
const addRoom = async (req, res, next) => {
  try {
    req.body.hotelId = req.params.hotelId;
    
    const hotel = await Hotel.findById(req.params.hotelId);
    
    if (!hotel) {
      res.status(404);
      throw new Error('Hotel not found');
    }

    if (hotel.managerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to add rooms to this hotel');
    }

    const room = await Room.create(req.body);
    
    // Optionally alert via Socket.io if a new room type is available
    const io = req.app.get('socketio');
    if (io) {
        io.to(req.params.hotelId).emit('room_added', room);
    }
    
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

// @desc    Update room details
// @route   PUT /api/hotels/:hotelId/rooms/:id
// @access  Private/Manager
const updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      res.status(404);
      throw new Error('Room not found');
    }
    
    const hotel = await Hotel.findById(req.params.hotelId);
    if (hotel.managerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update rooms for this hotel');
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(room);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a room
// @route   DELETE /api/hotels/:hotelId/rooms/:id
// @access  Private/Manager
const deleteRoom = async (req, res, next) => {
    try {
      const room = await Room.findById(req.params.id);
  
      if (!room) {
        res.status(404);
        throw new Error('Room not found');
      }
      
      const hotel = await Hotel.findById(req.params.hotelId);
      if (hotel.managerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to delete rooms for this hotel');
      }
  
      await Room.deleteOne({ _id: room._id });
  
      res.json({ message: 'Room removed' });
    } catch (error) {
      next(error);
    }
  };

export { getRooms, addRoom, updateRoom, deleteRoom };
