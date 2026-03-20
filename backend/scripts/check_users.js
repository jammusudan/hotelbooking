import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const users = await User.find({}, 'name email role');
    console.log('Users in database:');
    console.table(users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role
    })));

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();
