const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPaymentStatus } = require('../controllers/paymentController');

// Create Razorpay order
router.post('/create-order', createOrder);

// Verify payment
router.post('/verify-payment', verifyPayment);

// Get payment status
router.get('/status/:bookingId', getPaymentStatus);

module.exports = router;
