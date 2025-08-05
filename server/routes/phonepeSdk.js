const express = require('express');
const router = express.Router();
const phonePeSdkController = require('../controllers/phonePeSdkController');

// Route to create a PhonePe payment order using the SDK
router.post('/create-order', phonePeSdkController.createPhonePeOrder);

// Route to create a PhonePe SDK order for frontend SDK integration
router.post('/create-sdk-order', phonePeSdkController.createSdkOrder);

// Route to check PhonePe payment status
router.get('/status/:transactionId', phonePeSdkController.checkPhonePeStatus);

// Route to handle PhonePe callback
router.post('/callback', phonePeSdkController.handlePhonePeCallback);

// Route to handle PhonePe redirect
router.get('/redirect', phonePeSdkController.handlePhonePeRedirect);

module.exports = router;