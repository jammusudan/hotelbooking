import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './src/models/User.js';

dotenv.config();

const ensureAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const email = 'admin@gmail.com';
        const rawPassword = 'admin123';
        
        // Delete all admin users to avoid confusion and start clean
        const delResult = await User.deleteMany({ role: 'admin' });
        console.log(`Deleted ${delResult.deletedCount} existing admin users.`);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);
        
        const newAdmin = await User.create({
            name: 'Master Admin',
            email: email,
            password: rawPassword, // The model pre-save hook will hash this if we use .create()
            role: 'admin',
            isEmailVerified: true
        });
        
        console.log('NEW ADMIN CREATED:');
        console.log(JSON.stringify({
            name: newAdmin.name,
            email: newAdmin.email,
            role: newAdmin.role
        }, null, 2));
        
        // Double check hashing
        const verifiedUser = await User.findOne({ email });
        const isMatch = await verifiedUser.matchPassword(rawPassword);
        console.log('Password Hashing Verification (matchPassword):', isMatch);
        
    } catch (err) {
        console.error('Error in ensureAdmin:', err);
    } finally {
        await mongoose.disconnect();
    }
};

ensureAdmin();
