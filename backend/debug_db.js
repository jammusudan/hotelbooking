import mongoose from 'mongoose';
import fs from 'fs';

const hotelSchema = new mongoose.Schema({ name: String, isApproved: Boolean });
const roomSchema = new mongoose.Schema({ hotelId: mongoose.Schema.Types.ObjectId, type: String, pricePerNight: Number });

const Hotel = mongoose.model('Hotel', hotelSchema);
const Room = mongoose.model('Room', roomSchema);

(async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/hotel-booking');
        
        const hotels = await Hotel.find({});
        const rooms = await Room.find({});
        
        const data = {
            hotels: hotels.map(h => ({ name: h.name, id: h._id.toString(), isApproved: h.isApproved })),
            rooms: rooms.map(r => ({ hotelId: r.hotelId?.toString(), type: r.type, price: r.pricePerNight, id: r._id.toString() }))
        };
        
        fs.writeFileSync('debug_data.json', JSON.stringify(data, null, 2));
        console.log('Exported to debug_data.json');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
