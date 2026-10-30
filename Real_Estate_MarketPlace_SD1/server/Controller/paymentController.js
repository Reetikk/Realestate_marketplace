const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Property = require('../models/Property');

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
    : null;

// Create payment order
const createPaymentOrder = async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(503).json({ message: 'Payment service is not configured' });
        }

        const { amount, propertyId, transactionType } = req.body;
        const userId = req.user.id;

        // Verify property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Create Razorpay order
        const options = {
            amount: amount * 100, // amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                propertyId: propertyId,
                userId: userId,
                transactionType: transactionType
            }
        };

        const order = await razorpay.orders.create(options);

        // Create transaction record
        const transaction = new Transaction({
            user: userId,
            property: propertyId,
            amount: amount,
            razorpayOrderId: order.id,
            transactionType: transactionType,
            status: 'pending'
        });

        await transaction.save();

        res.status(201).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            transactionId: transaction._id
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

// Verify payment
const verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, transactionId } = req.body;

        // Verify signature
        const sign = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpaySignature !== expectedSign) {
            return res.status(400).json({ message: 'Payment verification failed' });
        }

        // Update transaction
        const transaction = await Transaction.findByIdAndUpdate(
            transactionId,
            {
                razorpayPaymentId,
                razorpaySignature,
                status: 'completed'
            },
            { new: true }
        );

        res.status(200).json({
            message: 'Payment verified successfully',
            transaction
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get transaction history
const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        let query = { user: userId };
        if (status) query.status = status;

        const transactions = await Transaction.find(query)
            .populate('property', 'title image price')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(transactions);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const transaction = await Transaction.findById(transactionId)
            .populate('property', 'title image price address')
            .populate('user', 'name email');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json(transaction);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getTransactionHistory,
    getTransactionById
};
