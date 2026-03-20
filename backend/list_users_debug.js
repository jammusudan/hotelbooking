import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const listAllUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const users = await User.find({});
        console.log(`TOTAL USERS: ${users.length}`);
        
        users.forEach(u => {
            console.log(`- ${u.email} | Role: ${u.role} | Name: ${u.name}`);
        });
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

listAllUsers();
