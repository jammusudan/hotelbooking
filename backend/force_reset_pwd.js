import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './src/models/User.js';

dotenv.config();

const forceReset = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const email = 'jamunaselvammsc98@gmail.com';
        const rawPassword = 'password123';
        
        const user = await User.findOne({ email });
        
        if (user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(rawPassword, salt);
            
            // Bypass pre-save hook by using findOneAndUpdate if needed, 
            // but let's just set it and save, but verify explicitly.
            user.password = hashedPassword;
            // We need to make sure the pre-save hook doesn't hash it AGAIN.
            // But the hook checks if password is modified. 
            // If we set it to a hash, it IS modified, and it will hash the hash.
            // SO: We should use findOneAndUpdate to bypass hooks.
            
            await User.findOneAndUpdate({ email }, { password: hashedPassword });
            
            console.log('Password FORCE RESET successful for ' + email);
            
            // Verify immediately
            const updatedUser = await User.findOne({ email });
            const isMatch = await bcrypt.compare(rawPassword, updatedUser.password);
            console.log('Verification match:', isMatch);
        } else {
            console.log('USER NOT FOUND: ' + email);
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

forceReset();
