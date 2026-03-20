const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const hotelSchema = new mongoose.Schema({
    name: String,
    managerId: mongoose.Schema.Types.ObjectId,
    isApproved: Boolean
});

const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const hotels = await Hotel.find({});
        const output = hotels.map(h => `ID: ${h._id} | Hotel: ${h.name} | ManagerID: ${h.managerId} | Approved: ${h.isApproved}`).join('\n');
        fs.writeFileSync('hotels_dump.txt', output);
        console.log('Hotel dump written to hotels_dump.txt');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
