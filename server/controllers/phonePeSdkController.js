const { StandardCheckoutClient, Env, StandardCheckoutPayRequest } = require('pg-sdk-node');
const { randomUUID } = require('crypto');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');

// PhonePe client credentials from environment variables
// Use the standard PhonePe test credentials when in development/sandbox mode
const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID || (process.env.NODE_ENV === 'production' ? process.env.PHONEPE_CLIENT_ID : 'PGTESTPAYUAT');
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || (process.env.NODE_ENV === 'production' ? process.env.PHONEPE_CLIENT_SECRET : '96434309-7796-489d-8924-ab56988a6076');
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || (process.env.NODE_ENV === 'production' ? process.env.PHONEPE_MERCHANT_ID : 'PGTESTPAYUAT86');

// Determine environment based on NODE_ENV
const PHONEPE_ENV = process.env.NODE_ENV === 'production' ? Env.PRODUCTION : Env.SANDBOX;

// Client version (typically 1 for v1 of the API)
const CLIENT_VERSION = 1;

// Initialize the PhonePe client
const client = StandardCheckoutClient.getInstance(
    PHONEPE_CLIENT_ID,
    PHONEPE_CLIENT_SECRET,
    CLIENT_VERSION,
    PHONEPE_ENV
);

console.log(`PhonePe SDK Controller - Using Merchant ID: ${PHONEPE_MERCHANT_ID}`);
console.log(`PhonePe SDK Controller - Using Client ID: ${PHONEPE_CLIENT_ID}`);
console.log(`PhonePe SDK Controller - Using Environment: ${PHONEPE_ENV}`);

/**
 * Create a PhonePe payment order using the SDK
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPhonePeOrder = async (req, res) => {
    try {
        console.log('PhonePe SDK order creation request received:', req.body);
        const { amount, currency = 'INR', bookingId } = req.body;

        // Validate required fields
        if (!amount) {
            console.log('Missing required fields:', { amount });
            return res.status(400).json({
                success: false,
                message: 'Amount is required'
            });
        }

        // Generate a unique merchant order ID
        const merchantOrderId = randomUUID();
        console.log('Generated merchant order ID:', merchantOrderId);
        
        // Create the redirect URL - this is where PhonePe will redirect after payment
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? `https://${req.get('host')}` 
            : `${req.protocol}://${req.get('host')}`;
        const redirectUrl = `${baseUrl}/api/phonepe-sdk/redirect?merchantOrderId=${merchantOrderId}`;
        console.log('Redirect URL:', redirectUrl);

        // Build the payment request using the SDK builder pattern
        const request = StandardCheckoutPayRequest.builder()
            .merchantOrderId(merchantOrderId)
            .amount(amount * 100) // Amount in paise
            .redirectUrl(redirectUrl)
            .build();

        console.log('PhonePe SDK request built');

        // Make the payment request using the SDK
        const response = await client.pay(request);
        console.log('PhonePe SDK response:', response);

        // Extract the payment URL from the response
        const paymentUrl = response.redirectUrl;
        
        if (paymentUrl) {
            // Update booking with PhonePe transaction ID if bookingId is provided
            if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
                await Booking.findByIdAndUpdate(bookingId, {
                    phonePeTransactionId: merchantOrderId,
                    paymentStatus: 'pending',
                    paymentMethod: 'phonepe'
                });
                console.log('Booking updated with PhonePe transaction details:', {
                    bookingId,
                    merchantOrderId,
                    paymentStatus: 'pending'
                });
            } else {
                console.log('No valid bookingId provided - skipping database update');
            }

            // Return the payment URL to the client
            return res.status(200).json({
                success: true,
                data: {
                    paymentUrl: paymentUrl,
                    transactionId: merchantOrderId,
                    checkoutPageUrl: paymentUrl // Added for compatibility with sample app
                }
            });
        } else {
            console.log('PhonePe payment creation failed: No payment URL in response');
            return res.status(400).json({
                success: false,
                message: 'Failed to create PhonePe payment',
                error: 'No payment URL in response'
            });
        }
    } catch (error) {
        console.error('Error creating PhonePe order:', error.message);
        console.error('Error stack:', error.stack);
        
        return res.status(500).json({
            success: false,
            message: 'Failed to create PhonePe payment',
            error: error.message
        });
    }
};

/**
 * Create a PhonePe SDK order for frontend SDK integration
 * This uses the same flow as createPhonePeOrder for simplicity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createSdkOrder = async (req, res) => {
    // For now, use the same implementation as createPhonePeOrder
    // This can be extended later if needed for specific SDK features
    return await createPhonePeOrder(req, res);
};

/**
 * Check PhonePe payment status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkPhonePeStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        console.log('Checking PhonePe status for transaction ID:', transactionId);

        // Find booking by PhonePe transaction ID
        const booking = await Booking.findOne({ phonePeTransactionId: transactionId });
        if (!booking) {
            console.error('Booking not found for transaction ID:', transactionId);
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        console.log('Found booking:', booking._id);

        // Check payment status using the SDK
        const response = await client.getOrderStatus(transactionId);
        console.log('PhonePe status check response:', response);

        // Extract payment status from the response
        const phonePeStatus = response.state || 'UNKNOWN';

        // Update booking payment status based on PhonePe status
        if (phonePeStatus === 'COMPLETED' || phonePeStatus === 'SUCCESS') {
            await Booking.findByIdAndUpdate(booking._id, {
                paymentStatus: 'completed',
                phonePePaymentId: response.transactionId
            });
        } else if (phonePeStatus === 'FAILED' || phonePeStatus === 'FAILURE') {
            await Booking.findByIdAndUpdate(booking._id, {
                paymentStatus: 'failed'
            });
        }

        res.status(200).json({
            success: true,
            paymentStatus: booking.paymentStatus,
            phonePeStatus: phonePeStatus,
            booking: booking,
            rawResponse: response // Include raw response for debugging
        });
    } catch (error) {
        console.error('Check PhonePe status error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to check payment status',
            error: error.message
        });
    }
};

/**
 * Handle PhonePe callback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handlePhonePeCallback = async (req, res) => {
    try {
        console.log('PhonePe callback received:', JSON.stringify(req.body, null, 2));
        const { merchantTransactionId, transactionId } = req.body;

        // Validate the callback data
        if (!merchantTransactionId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid callback data'
            });
        }

        // Check payment status using the SDK
        const statusResponse = await client.getOrderStatus(merchantTransactionId);
        console.log('PhonePe status check response:', statusResponse);

        // Extract payment status from the response
        const paymentStatus = statusResponse.state || 'UNKNOWN';

        // Find booking by PhonePe transaction ID
        const booking = await Booking.findOne({ phonePeTransactionId: merchantTransactionId });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Update booking payment status based on PhonePe status
        if (paymentStatus === 'COMPLETED' || paymentStatus === 'SUCCESS') {
            await Booking.findByIdAndUpdate(booking._id, {
                paymentStatus: 'completed',
                phonePePaymentId: transactionId || statusResponse.transactionId
            });
        } else if (paymentStatus === 'FAILED' || paymentStatus === 'FAILURE') {
            await Booking.findByIdAndUpdate(booking._id, {
                paymentStatus: 'failed'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Callback processed successfully'
        });
    } catch (error) {
        console.error('PhonePe callback error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to process callback',
            error: error.response?.data?.message || error.message
        });
    }
};

/**
 * Handle PhonePe redirect
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handlePhonePeRedirect = async (req, res) => {
    try {
        const { merchantOrderId } = req.query;
        console.log('PhonePe redirect received with merchantOrderId:', merchantOrderId);
        console.log('Query parameters:', req.query);

        // Redirect to the frontend with transaction ID
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment-status?transactionId=${merchantOrderId}`;
        console.log('Redirecting to:', redirectUrl);
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('PhonePe redirect error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment-error`);
    }
};

module.exports = {
    createPhonePeOrder,
    createSdkOrder,
    checkPhonePeStatus,
    handlePhonePeCallback,
    handlePhonePeRedirect
};