const express = require('express');
const route = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    createPaymentOrder,
    verifyPayment,
    getTransactionHistory,
    getTransactionById
} = require('../Controller/paymentController');

route.post('/create-order', authMiddleware, createPaymentOrder);
route.post('/verify-payment', authMiddleware, verifyPayment);
route.get('/history', authMiddleware, getTransactionHistory);
route.get('/:transactionId', authMiddleware, getTransactionById);

module.exports = route;
