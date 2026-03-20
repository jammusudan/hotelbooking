import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const email = 'jamunaselvammsc98@gmail.com';
        const user = await User.findOne({ email });
        
        if (user) {
            console.log('USER FOUND:');
            console.log(JSON.stringify({
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            }, null, 2));
        } else {
            console.log('USER NOT FOUND: ' + email);
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

check();
