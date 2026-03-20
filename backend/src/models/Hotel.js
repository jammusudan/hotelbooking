import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
  {
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    amenities: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false, // Must be approved by an Admin
    },
  },
  {
    timestamps: true,
  }
); // Mongoose virtual to relate rooms later

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;
