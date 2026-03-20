import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import bcrypt from 'bcrypt';

dotenv.config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const email = 'admin@gmail.com';
        let admin = await User.findOne({ email });
        
        if (!admin) {
            console.log('Admin user NOT found. Creating one...');
            admin = await User.create({
                name: 'System Admin',
                email: email,
                password: 'admin123',
                role: 'admin',
                isEmailVerified: true
            });
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user found. Resetting password to admin123...');
            admin.password = 'admin123';
            await admin.save();
            console.log('Admin password reset successfully');
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
