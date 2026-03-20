import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './src/models/User.js';

dotenv.config();

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const email = 'admin@gmail.com';
        const rawPassword = 'password123';
        
        const user = await User.findOne({ email });
        
        if (user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(rawPassword, salt);
            await User.findOneAndUpdate({ email }, { password: hashedPassword });
            console.log('Admin password FORCE RESET successful: ' + email);
        } else {
            console.log('ADMIN USER NOT FOUND: ' + email);
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

resetAdmin();
