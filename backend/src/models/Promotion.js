import mongoose from 'mongoose';

const PromotionSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please add a promotion code'],
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        default: null
    },
    discount: {
        type: Number,
        required: [true, 'Please add a discount value']
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    minBookingAmount: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: 10000
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        required: [true, 'Please add an expiry date']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageLimit: {
        type: Number,
        default: null // null means unlimited
    },
    usageCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Promotion = mongoose.model('Promotion', PromotionSchema);
export default Promotion;
