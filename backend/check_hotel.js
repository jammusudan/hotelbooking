import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hotel from './src/models/Hotel.js';
import fs from 'fs';

dotenv.config();

const checkHotel = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const hotel = await Hotel.findOne({ name: /Taj Coromandel/i });
        if (hotel) {
            console.log('Hotel Found');
            fs.writeFileSync('hotel_data.json', JSON.stringify(hotel, null, 2));
            console.log('Data written to hotel_data.json');
        } else {
            console.log('Hotel "Taj Coromandel" not found.');
        }
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkHotel();
