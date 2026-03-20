import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hotel from './src/models/Hotel.js';

dotenv.config();

const updateHotel = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const result = await Hotel.updateOne(
            { name: /Taj Coromandel/i },
            { $set: { images: [] } }
        );
        
        if (result.modifiedCount > 0) {
            console.log('Successfully updated Taj Coromandel. Images cleared to trigger fallback.');
        } else {
            console.log('Hotel not found or no change needed.');
        }
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

updateHotel();
