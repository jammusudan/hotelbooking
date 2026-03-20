import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './src/models/User.js';

dotenv.config();

const testAuth = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB:', process.env.MONGO_URI);
        
        const email = 'jamunaselvammsc98@gmail.com';
        const rawPassword = 'password123';
        
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('User not found in DB');
            return;
        }
        
        console.log('User found:', user.email);
        console.log('Stored hashed password:', user.password);
        
        const isMatch = await user.matchPassword(rawPassword);
        console.log('Password match result:', isMatch);
        
        // Let's also try direct bcrypt compare just in case
        const directMatch = await bcrypt.compare(rawPassword, user.password);
        console.log('Direct bcrypt match result:', directMatch);
        
    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await mongoose.disconnect();
    }
};

testAuth();
