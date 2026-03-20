import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hotel from './src/models/Hotel.js';

dotenv.config();

const checkHotel = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const hotel = await Hotel.findOne({ name: /Merlis Hotel/i });
        if (hotel) {
            console.log('Hotel Name:', hotel.name);
            const fs = await import('fs');
            fs.writeFileSync('merlis_images.json', JSON.stringify(hotel.images, null, 2));
            console.log('Images written to merlis_images.json');
        } else {
            console.log('Hotel not found');
        }
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkHotel();
