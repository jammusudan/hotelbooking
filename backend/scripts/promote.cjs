const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await User.updateMany(
            { $or: [
                { email: 'nichen002@gmail.com' },
                { email: 'admin@gmail.com' }
            ]}, 
            { role: 'admin' }
        );
        console.log('Update result:', result);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
