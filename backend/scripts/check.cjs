const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// User Schema (copied roughly for quick check)
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        users.forEach(u => console.log(`${u.name} | ${u.email} | ${u.role}`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
