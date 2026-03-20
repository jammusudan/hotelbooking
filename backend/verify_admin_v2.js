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
        const admin = await User.findOne({ email });
        
        if (admin) {
            console.log('--- Admin User Details ---');
            console.log('ID:', admin._id.toString());
            console.log('Email:', admin.email);
            console.log('Role:', admin.role);
            console.log('Password Hash:', admin.password);
            
            const testPassword = 'admin123';
            const isMatch = await bcrypt.compare(testPassword, admin.password);
            console.log(`Bcrypt comparison for "${testPassword}":`, isMatch);
            
            const isMatchDirect = await admin.matchPassword(testPassword);
            console.log(`matchPassword method for "${testPassword}":`, isMatchDirect);
        } else {
            console.log('Admin user NOT found');
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
