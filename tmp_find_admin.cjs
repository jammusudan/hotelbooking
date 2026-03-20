const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }));
        const admin = await User.findOne({ role: 'admin' });
        console.log('ADMIN_EMAIL:', admin ? admin.email : 'NOT_FOUND');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
