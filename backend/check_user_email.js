import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const User = (await import('./src/models/User.js')).default;
    const users = await User.find({ name: /jamuna/i });
    console.log(users.map(u => ({ name: u.name, email: u.email, role: u.role })));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
checkUsers();
