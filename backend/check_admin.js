import mongoose from 'mongoose';
import User from './src/models/User.js';

(async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/hotel-booking');
        console.log('Connected to MongoDB');
        
        const admin = await User.findOne({ email: 'admin@gmail.com' });
        if (admin) {
            console.log('Admin user found:');
            console.log('ID:', admin._id);
            console.log('Name:', admin.name);
            console.log('Email:', admin.email);
            console.log('Role:', admin.role);
            console.log('Password Hash:', admin.password);
        } else {
            console.log('Admin user NOT found with email: admin@gmail.com');
            const allUsers = await User.find({}, 'email role');
            console.log('All users in DB:', allUsers);
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
