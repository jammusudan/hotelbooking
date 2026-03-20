const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/hotel-booking').then(async () => {
    const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }));
    const users = await User.find({ role: { $in: ['admin', 'manager'] } });
    console.log(users);
    process.exit(0);
});
