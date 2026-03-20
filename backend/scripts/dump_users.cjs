const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

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
        const users = await User.find({});
        const output = users.map(u => `${u.name} | ${u.email} | ${u.role}`).join('\n');
        fs.writeFileSync('users_snapshot.txt', output);
        console.log('User snapshot written to users_snapshot.txt');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
