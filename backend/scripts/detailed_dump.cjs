const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String,
    googleId: String,
    githubId: String
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        const output = users.map(u => `ID: ${u._id} | Name: ${u.name} | Email: ${u.email} | Role: ${u.role}`).join('\n');
        fs.writeFileSync('detailed_users.txt', output);
        console.log('Detailed snapshot written to detailed_users.txt');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
