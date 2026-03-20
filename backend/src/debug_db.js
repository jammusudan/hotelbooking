import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotel-booking');
        
        // Use existing models if possible, otherwise define
        const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', new mongoose.Schema({ 
            name: String, 
            isApproved: Boolean,
            images: [String],
            city: String,
            country: String
        }));
        
        const Room = mongoose.models.Room || mongoose.model('Room', new mongoose.Schema({ 
            hotelId: mongoose.Schema.Types.ObjectId, 
            pricePerNight: Number 
        }));

        const hotels = await Hotel.find({});
        const rooms = await Room.find({});
        
        const results = {
            totalHotels: hotels.length,
            hotels: hotels.map(h => ({ 
                name: h.name, 
                isApproved: h.isApproved, 
                _id: h._id,
                images: h.images,
                roomCount: rooms.filter(r => r.hotelId && r.hotelId.toString() === h._id.toString()).length
            })),
            totalRooms: rooms.length
        };

        fs.writeFileSync(path.join(__dirname, '../../db_status.json'), JSON.stringify(results, null, 2));
        console.log('Success - wrote to db_status.json');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
