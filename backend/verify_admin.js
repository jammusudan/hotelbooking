import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './src/models/User.js';

dotenv.config();

const verifyAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const email = 'admin@gmail.com';
        const user = await User.findOne({ email });
        
        if (user) {
            user.isEmailVerified = true;
            await user.save();
            console.log('Admin user fully verified: ' + email);
        } else {
            console.log('ADMIN USER NOT FOUND: ' + email);
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

verifyAdmin();
