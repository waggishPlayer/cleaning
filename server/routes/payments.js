const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPaymentStatus } = require('../controllers/paymentController');
const { createPhonePeOrder, handlePhonePeCallback, handlePhonePeRedirect, checkPhonePeStatus, handlePhonePeWebhook } = require('../controllers/phonePeController');
const { protect } = require('../middleware/auth');

// Razorpay endpoints
// Create Razorpay order
router.post('/create-order', protect, createOrder);

// Verify payment
router.post('/verify-payment', protect, verifyPayment);

// Get payment status
router.get('/status/:bookingId', protect, getPaymentStatus);

// PhonePe endpoints
// Create PhonePe order
router.post('/phonepe/create-order', protect, createPhonePeOrder);

// Test endpoint for PhonePe integration (no auth required)
router.post('/phonepe/test-create-order', createPhonePeOrder);

// Handle PhonePe callback
router.post('/phonepe-callback', handlePhonePeCallback);

// Handle PhonePe redirect
router.get('/phonepe-redirect', handlePhonePeRedirect);

// Check PhonePe payment status
router.get('/phonepe/status/:transactionId', protect, checkPhonePeStatus);

// Handle PhonePe webhook
router.post('/phonepe/webhook', handlePhonePeWebhook);

module.exports = router;
