import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

// @desc    Get all approved hotels
// @route   GET /api/hotels
// @access  Public
const getHotels = async (req, res, next) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;
    const { keyword, city, minRating, minPrice, maxPrice, amenities, checkIn, checkOut } = req.query;

    let filter = {
      $or: [
        { isApproved: true },
        ...(req.user ? [{ managerId: req.user._id }] : [])
      ]
    };

    // Keyword search (Name/Description)
    if (keyword) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ]
      });
    }

    // City filter
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    // Rating filter
    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    // Amenities filter
    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : amenities.split(',');
      filter.amenities = { $all: amenitiesList };
    }

    // First find hotels matching basic filters
    console.log('[Search Trace] Final Filter Object:', JSON.stringify(filter, null, 2));
    let hotelsList = await Hotel.find(filter);
    console.log(`[Search Trace] Total hotels after basic search: ${hotelsList.length}`);
    hotelsList.forEach(h => console.log(`  - Hotel: ${h.name} (${h._id}) rating: ${h.rating} amenities: ${h.amenities?.join(',')}`));

    // Filter by Price and/or Availability if needed
    if (minPrice || maxPrice || (checkIn && checkOut)) {
      console.log(`[Search Trace] Price/Availability filtering. min: ${minPrice} max: ${maxPrice} in: ${checkIn} out: ${checkOut}`);
      const hotelIds = hotelsList.map(h => h._id);
      let roomFilter = { hotelId: { $in: hotelIds }, isMaintenance: { $ne: true } };
      
      if (minPrice) roomFilter.pricePerNight = { $gte: Number(minPrice) };
      if (maxPrice) roomFilter.pricePerNight = { ...roomFilter.pricePerNight, $lte: Number(maxPrice) };

      const rooms = await Room.find(roomFilter);
      console.log(`[Search Trace] Total rooms matching price: ${rooms.length}`);
      
      const validHotelIds = [];
      const checkInDate = checkIn ? new Date(checkIn) : null;
      const checkOutDate = checkOut ? new Date(checkOut) : null;

      for (const room of rooms) {
        let isAvailable = true;

        if (checkInDate && checkOutDate) {
          const overlappingBookings = await Booking.find({
            roomId: room._id,
            status: { $in: ['Pending', 'Confirmed'] },
            $and: [
              { checkIn: { $lt: checkOutDate } },
              { checkOut: { $gt: checkInDate } }
            ]
          });
          
          if (overlappingBookings.length >= room.count) {
            console.log(`[Search Trace] Room ${room._id} (Hotel ${room.hotelId}) is FULL`);
            isAvailable = false;
          }
        }

        if (isAvailable) {
          validHotelIds.push(room.hotelId.toString());
        }
      }

      const uniqueValidHotelIds = [...new Set(validHotelIds)];
      console.log(`[Search Trace] Valid Hotel IDs from rooms: ${uniqueValidHotelIds.join(', ')}`);
      hotelsList = hotelsList.filter(h => uniqueValidHotelIds.includes(h._id.toString()));
      console.log(`[Search Trace] Total hotels after price/avail: ${hotelsList.length}`);
    }

    // Manual Pagination
    const total = hotelsList.length;
    const paginatedHotels = hotelsList.slice((page - 1) * pageSize, page * pageSize);

    // Fetch rooms for each hotel to show starting price
    const hotelsWithPrice = await Promise.all(paginatedHotels.map(async (hotel) => {
        const rooms = await Room.find({ hotelId: hotel._id }).sort({ pricePerNight: 1 });
        return {
            ...hotel.toObject(),
            startingPrice: rooms.length > 0 ? rooms[0].pricePerNight : 0
        };
    }));

    res.json({ 
      hotels: hotelsWithPrice, 
      page, 
      pages: Math.ceil(total / pageSize),
      total 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hotel with rooms
// @route   GET /api/hotels/:id
// @access  Public
const getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (hotel) {
      if (!hotel.isApproved && req.user?.role !== 'admin' && req.user?._id.toString() !== hotel.managerId.toString()) {
         res.status(403);
         throw new Error('Hotel is not approved yet');
      }
      
      const rooms = await Room.find({ hotelId: hotel._id });
      res.json({ hotel, rooms });
    } else {
      res.status(404);
      throw new Error('Hotel not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a hotel
// @route   POST /api/hotels
// @access  Private/Manager
const createHotel = async (req, res, next) => {
  try {
    const { name, description, address, city, country, images, amenities } = req.body;

    const hotel = new Hotel({
      managerId: req.user._id,
      name,
      description,
      address,
      city,
      country,
      images,
      amenities,
    });

    const createdHotel = await hotel.save();
    res.status(201).json(createdHotel);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a hotel
// @route   PUT /api/hotels/:id
// @access  Private/Manager
const updateHotel = async (req, res, next) => {
  try {
    const { name, description, address, city, country, images, amenities } = req.body;

    const hotel = await Hotel.findById(req.params.id);

    if (hotel) {
      // Check if user is manager of this hotel or is an admin
      if (hotel.managerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to update this hotel');
      }

      hotel.name = name || hotel.name;
      hotel.description = description || hotel.description;
      hotel.address = address || hotel.address;
      hotel.city = city || hotel.city;
      hotel.country = country || hotel.country;
      hotel.images = images || hotel.images;
      hotel.amenities = amenities || hotel.amenities;

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

// @desc    Delete a hotel
// @route   DELETE /api/hotels/:id
// @access  Private/Admin
const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (hotel) {
       await Room.deleteMany({ hotelId: hotel._id });
       await Hotel.deleteOne({ _id: hotel._id });
       res.json({ message: 'Hotel removed' });
    } else {
       res.status(404);
       throw new Error('Hotel not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all hotels managed by current user
// @route   GET /api/hotels/myhotels
// @access  Private/Manager
const getMyHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find({ managerId: req.user._id });
    res.json(hotels);
  } catch (error) {
    next(error);
  }
};

// @desc    Get search suggestions for hotels and cities
// @route   GET /api/hotels/suggestions
// @access  Public
const getSuggestions = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.json({ hotels: [], cities: [] });
    }

    const hotels = await Hotel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ],
      isApproved: true
    }).limit(5).select('name city');

    const cities = await Hotel.distinct('city', {
      city: { $regex: query, $options: 'i' },
      isApproved: true
    });

    res.json({ hotels, cities: cities.slice(0, 5) });
  } catch (error) {
    next(error);
  }
};

export { getHotels, getHotelById, createHotel, updateHotel, deleteHotel, getMyHotels, getSuggestions };
