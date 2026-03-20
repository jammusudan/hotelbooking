import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const updateEmail = async () => {
  try {
    console.log('Connecting to MONGO_URI:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const userId = '69b3e296f849e2e170502936';
    const newEmail = 'manager@gmail.com';

    console.log(`Searching for user ID: ${userId}`);
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found by ID. Searching by email manager@gmail.com...');
      const userByEmail = await User.findOne({ email: 'manager@gmail.com' });
      if (!userByEmail) {
        console.log('User not found by email either.');
        process.exit(1);
      }
      console.log(`Found user by email: ${userByEmail.name} (${userByEmail._id})`);
      userByEmail.email = newEmail;
      await userByEmail.save();
      console.log(`Successfully updated email to: ${newEmail}`);
    } else {
      const oldEmail = user.email;
      user.email = newEmail;
      await user.save();
      console.log(`Successfully updated email for user ${user.name}:`);
      console.log(`Old Email: ${oldEmail}`);
      console.log(`New Email: ${newEmail}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error updating email:', error);
    process.exit(1);
  }
};

updateEmail();
