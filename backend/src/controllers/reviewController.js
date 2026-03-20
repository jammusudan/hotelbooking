import Review from '../models/Review.js';
import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';

// @desc    Add review for a hotel
// @route   POST /api/reviews/hotel/:hotelId
// @access  Private
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const hotelId = req.params.hotelId;

    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      res.status(404);
      throw new Error('Hotel not found');
    }

    // Verify stay completion
    const hasStayed = await Booking.findOne({
      userId: req.user._id,
      hotelId,
      status: 'Confirmed',
      checkOut: { $lt: new Date() }
    });

    if (!hasStayed) {
      res.status(403);
      throw new Error('You can only review hotels after your stay is completed');
    }

    // Check if review already exists
    const alreadyReviewed = await Review.findOne({
      userId: req.user._id,
      hotelId,
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('You have already reviewed this hotel');
    }

    const review = await Review.create({
      userId: req.user._id,
      hotelId,
      rating: Number(rating),
      comment,
    });

    // Update hotel rating and number of reviews
    const reviews = await Review.find({ hotelId });
    hotel.numReviews = reviews.length;
    hotel.rating =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await hotel.save();

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a hotel
// @route   GET /api/reviews/hotel/:hotelId
// @access  Public
const getHotelReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ hotelId: req.params.hotelId }).populate(
      'userId',
      'name'
    );
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a manager response to a review
// @route   PUT /api/reviews/:id/response
// @access  Private/Manager
const addManagerResponse = async (req, res, next) => {
  try {
    const { managerResponse } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    const hotel = await Hotel.findById(review.hotelId);
    if (hotel.managerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to respond to this review');
    }

    review.managerResponse = managerResponse;
    const updatedReview = await review.save();

    res.json(updatedReview);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews platform-wide
// @route   GET /api/reviews/all
// @access  Private/Admin
const getAllReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({})
            .populate('userId', 'name email shadowColor')
            .populate('hotelId', 'name city')
            .sort('-createdAt');
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            res.status(404);
            throw new Error('Review not found');
        }

        // Update hotel stats before deleting
        const hotel = await Hotel.findById(review.hotelId);
        if (hotel) {
            const reviews = await Review.find({ hotelId: hotel._id, _id: { $ne: review._id } });
            hotel.numReviews = reviews.length;
            hotel.rating = reviews.length > 0 
                ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length 
                : 0;
            await hotel.save();
        }

        await review.deleteOne();
        res.json({ message: 'Review purged' });
    } catch (error) {
        next(error);
    }
};

export { addReview, getHotelReviews, addManagerResponse, getAllReviews, deleteReview };
