const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const bookingSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    hotelId: mongoose.Schema.Types.ObjectId,
    roomId: mongoose.Schema.Types.ObjectId,
    status: String,
    totalAmount: Number
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const bookings = await Booking.find({});
        const output = bookings.map(b => `BookingID: ${b._id} | HotelID: ${b.hotelId} | Status: ${b.status} | Amount: ${b.totalAmount}`).join('\n');
        fs.writeFileSync('bookings_dump.txt', output);
        console.log('Booking dump written to bookings_dump.txt');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
