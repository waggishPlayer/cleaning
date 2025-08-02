const express = require('express');
const router = express.Router();
const { createPhonePeOrder, handlePhonePeCallback, handlePhonePeRedirect, checkPhonePeStatus, handlePhonePeWebhook } = require('../controllers/phonePeController');
const { protect } = require('../middleware/auth');

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
