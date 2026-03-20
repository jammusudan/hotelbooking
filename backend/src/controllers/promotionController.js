import Promotion from '../models/Promotion.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import { getPromotionCreatedTemplate } from '../utils/emailTemplates.js';

// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Private/Admin
const getPromotions = async (req, res, next) => {
    try {
        const promotions = await Promotion.find({}).populate('hotelId', 'name').sort('-createdAt');
        res.json(promotions);
    } catch (error) {
        next(error);
    }
};

// @desc    Get active public promotions
// @route   GET /api/promotions/public
// @access  Public
const getPublicPromotions = async (req, res, next) => {
    try {
        const promotions = await Promotion.find({
            isActive: true,
            expiryDate: { $gt: new Date() }
        }).populate('hotelId', 'name').sort('-createdAt');
        res.json(promotions);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a promotion
// @route   POST /api/promotions
// @access  Private/Admin
const createPromotion = async (req, res, next) => {
    try {
        const promotion = await Promotion.create(req.body);

        // Send promotional emails to all users asynchronously
        try {
            const users = await User.find({}, 'email name');
            const emailPromises = users.map(user => {
                return sendEmail({
                    email: user.email,
                    subject: `Special Offer: ${promotion.code}`,
                    html: getPromotionCreatedTemplate({
                        ...promotion.toObject(),
                        userName: user.name
                    })
                });
            });
            
            // Execute in background so we don't block the API response
            Promise.allSettled(emailPromises).then(results => {
                const fulfilled = results.filter(r => r.status === 'fulfilled').length;
                console.log(`Promotional emails sent successfully. Processed: ${fulfilled}/${results.length}`);
            });
        } catch (emailError) {
            console.error('Error initiating promotional emails:', emailError);
        }

        res.status(201).json(promotion);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a promotion
// @route   PUT /api/promotions/:id
// @access  Private/Admin
const updatePromotion = async (req, res, next) => {
    try {
        const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!promotion) {
            res.status(404);
            throw new Error('Promotion not found');
        }
        res.json(promotion);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a promotion
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
const deletePromotion = async (req, res, next) => {
    try {
        const promotion = await Promotion.findByIdAndDelete(req.params.id);
        if (!promotion) {
            res.status(404);
            throw new Error('Promotion not found');
        }
        res.json({ message: 'Offer removed' });
    } catch (error) {
        next(error);
    }
};

// @desc    Validate a promotion code (Public/Customer)
// @route   POST /api/promotions/validate
// @access  Private
const validatePromotion = async (req, res, next) => {
    try {
        const { code, amount, hotelId } = req.body;
        const promotion = await Promotion.findOne({ code, isActive: true });

        if (!promotion) {
            res.status(404);
            throw new Error('Invalid or expired promotion code');
        }

        if (promotion.hotelId && promotion.hotelId.toString() !== hotelId) {
            res.status(400);
            throw new Error('This promotion is only valid for a specific property');
        }

        if (promotion.expiryDate < new Date()) {
            res.status(400);
            throw new Error('Promotion code has expired');
        }

        if (amount < promotion.minBookingAmount) {
            res.status(400);
            throw new Error(`Minimum booking amount of ₹${promotion.minBookingAmount} required`);
        }

        if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
            res.status(400);
            throw new Error('Promotion limit reached');
        }

        let discountValue = 0;
        if (promotion.type === 'percentage') {
            discountValue = (promotion.discount / 100) * amount;
            if (discountValue > promotion.maxDiscount) {
                discountValue = promotion.maxDiscount;
            }
        } else {
            discountValue = promotion.discount;
        }

        res.json({
            success: true,
            code: promotion.code,
            discount: discountValue,
            type: promotion.type
        });
    } catch (error) {
        next(error);
    }
};

export { getPromotions, getPublicPromotions, createPromotion, updatePromotion, deletePromotion, validatePromotion };
