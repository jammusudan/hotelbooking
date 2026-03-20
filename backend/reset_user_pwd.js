import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const reset = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const email = 'jamunaselvammsc98@gmail.com';
        const user = await User.findOne({ email });
        
        if (user) {
            user.password = 'password123';
            await user.save();
            console.log('Password reset successfully for ' + email);
            console.log('New Password: password123');
        } else {
            console.log('USER NOT FOUND: ' + email);
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

reset();
