import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const deleteUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const email = 'jamunaselvammsc98@gmail.com';
        const result = await User.deleteOne({ email });
        
        if (result.deletedCount > 0) {
            console.log('USER DELETED successfully: ' + email);
        } else {
            console.log('USER NOT FOUND (nothing to delete): ' + email);
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

deleteUser();
