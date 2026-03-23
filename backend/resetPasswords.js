import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const resetAccounts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const accounts = [
      { email: 'admin@gmail.com', name: 'Admin User', role: 'admin', password: 'password123' },
      { email: 'manager@gmail.com', name: 'Manager User', role: 'manager', password: 'password123' }
    ];

    for (const acc of accounts) {
      let user = await User.findOne({ email: acc.email });
      if (user) {
        user.password = acc.password;
        await user.save();
        console.log(`Updated password for ${acc.email} to ${acc.password}`);
      } else {
        await User.create(acc);
        console.log(`Created ${acc.role} account: ${acc.email} with password: ${acc.password}`);
      }
    }

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetAccounts();
