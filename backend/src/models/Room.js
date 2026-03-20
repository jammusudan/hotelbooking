import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Single', 'Double', 'Suite', 'Deluxe'],
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      default: 1,
    },
    amenities: [
      {
        type: String,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    count: {
      type: Number,
      required: true,
      default: 1,
      description: 'Total number of rooms of this type in the hotel',
    },
    isMaintenance: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model('Room', roomSchema);
export default Room;
