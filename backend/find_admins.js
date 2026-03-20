import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const findAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const admins = await User.find({ role: 'admin' });
        
        if (admins.length > 0) {
            console.log(`FOUND ${admins.length} ADMINS:`);
            admins.forEach(admin => {
                console.log(JSON.stringify({
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    isVerified: admin.isVerified
                }, null, 2));
            });
        } else {
            console.log('NO ADMINS FOUND IN DATABASE');
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

findAdmins();
