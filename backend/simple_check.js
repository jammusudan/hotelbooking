import mongoose from 'mongoose';
import User from './src/models/User.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'admin@gmail.com' });
  if (!user) {
    console.log('NOT_FOUND');
  } else {
    const match = await bcrypt.compare('admin123', user.password);
    console.log(`ROLE:${user.role}`);
    console.log(`MATCH:${match}`);
  }
  process.exit(0);
}
check();
