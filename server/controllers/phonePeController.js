const crypto = require('crypto');
const axios = require('axios');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');

// PhonePe client credentials
const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID || "PGTESTPAYUAT";
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || "96434309-7796-489d-8924-ab56988a6076";

// Use production URL in production, sandbox URL in development
const PHONEPE_BASE_URL = process.env.NODE_ENV === 'production'
    ? (process.env.PHONEPE_PROD_BASE_URL || "https://api.phonepe.com/apis/hermes")
    : (process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox");

// For testing, use PGTESTPAYUAT86 as the merchant ID
// For production, use the actual merchant ID from environment variables
const MERCHANT_ID = process.env.NODE_ENV === 'production' 
    ? process.env.PHONEPE_MERCHANT_ID 
    : (process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT86");

console.log(`PhonePe Controller - Using Merchant ID: ${MERCHANT_ID}`);
console.log(`PhonePe Controller - Using Client ID: ${PHONEPE_CLIENT_ID}`);
console.log(`PhonePe Controller - Using Base URL: ${PHONEPE_BASE_URL}`);

// Create PhonePe payment order
const createPhonePeOrder = async (req, res) => {
    try {
        console.log('PhonePe order creation request received:', req.body);
        const { amount, currency = 'INR', bookingId } = req.body;

        // Validate required fields
        if (!amount || !bookingId) {
            console.log('Missing required fields:', { amount, bookingId });
            return res.status(400).json({
                success: false,
                message: 'Amount and booking ID are required'
            });
        }

        // Get booking details
        let booking;
        
        // Check if bookingId is a valid MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(bookingId)) {
            booking = await Booking.findById(bookingId);
            if (!booking) {
                console.log('Booking not found:', bookingId);
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }
        } else {
            // For testing purposes, if bookingId is not a valid ObjectId
            console.log('Test booking ID detected:', bookingId);
            // Create a mock booking object for testing
            booking = {
                _id: 'test-booking-id',
                customer: 'test-user-id',
                price: amount
            };
        }

        // Get user details for the booking
        let user;
        let userPhone = '';
        
        // Check if customer ID is a valid MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(booking.customer)) {
            user = await mongoose.model('User').findById(booking.customer);
            userPhone = user?.phone || '';
        } else {
            // For testing purposes
            console.log('Test user ID detected:', booking.customer);
            userPhone = '9999999999'; // Default test phone number
        }
        
        console.log('User details:', { userId: booking.customer, userPhone });

        // Generate a unique transaction ID
        const merchantTransactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        console.log('Generated transaction ID:', merchantTransactionId);
        
        // Create payload for PhonePe API - following PG V2 Standard Checkout
        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: `MUID_${booking.customer}`,
            amount: amount * 100, // Amount in paise
            redirectUrl: `${req.protocol}://${req.get('host')}/api/payments/phonepe-redirect`,
            redirectMode: "REDIRECT",
            callbackUrl: `${req.protocol}://${req.get('host')}/api/payments/phonepe-callback`,
            mobileNumber: userPhone.replace(/\D/g, '').slice(0, 10), // Clean phone number
            paymentInstrument: {
                type: "PAY_PAGE"
            },
            // Add additional fields for better UX
            deviceContext: {
                deviceOS: "ANDROID"
            },
            // Add merchant defined fields for better tracking
            merchantOrderId: bookingId,
            // Add webhook URL for server-to-server notifications
            webhookUrl: `${req.protocol}://${req.get('host')}/api/payments/phonepe/webhook`
        };

        console.log('PhonePe payload:', JSON.stringify(payload, null, 2));

        // Convert payload to base64
        const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
        
        // Generate X-VERIFY header
        const xVerify = crypto
            .createHash('sha256')
            .update(payloadBase64 + "/pg/v1/pay" + PHONEPE_CLIENT_SECRET)
            .digest('hex') + '###1';

        console.log('Making API call to PhonePe with headers:', {
            'X-VERIFY': xVerify.substring(0, 10) + '...',
            'X-MERCHANT-ID': MERCHANT_ID
        });

        // Make API call to PhonePe
        let response;
        try {
            response = await axios.post(
                `${PHONEPE_BASE_URL}/pg/v1/pay`,
                {
                    request: payloadBase64
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-VERIFY': xVerify,
                        'X-MERCHANT-ID': MERCHANT_ID,
                        'Accept': 'application/json'
                    }
                }
            );
        } catch (apiError) {
            // For testing purposes, if we get a 404 error, create a mock response
            if (apiError.response && apiError.response.status === 404 && bookingId === 'test-booking-id') {
                console.log('Creating mock PhonePe response for testing');
                response = {
                    data: {
                        success: true,
                        code: 'PAYMENT_INITIATED',
                        data: {
                            merchantId: MERCHANT_ID,
                            merchantTransactionId: merchantTransactionId,
                            instrumentResponse: {
                                type: 'PAY_PAGE',
                                redirectInfo: {
                                    url: 'https://phonepe.com/test-payment-page',
                                    method: 'GET'
                                }
                            }
                        }
                    }
                };
            } else {
                throw apiError; // Re-throw if not a test case
            }
        }

        console.log('PhonePe response:', JSON.stringify(response.data, null, 2));

        // Check if the response is successful
        if (response.data.success) {
            // Update booking with PhonePe transaction ID
        if (mongoose.Types.ObjectId.isValid(bookingId)) {
            await Booking.findByIdAndUpdate(bookingId, {
                phonePeTransactionId: merchantTransactionId,
                paymentStatus: 'pending',
                paymentMethod: 'phonepe'
            });
        } else {
            console.log('Test booking - skipping database update');
        }

            console.log('Booking updated with PhonePe transaction details:', {
                bookingId,
                merchantTransactionId,
                paymentStatus: 'pending'
            });

            // Return the payment URL to the client
            return res.status(200).json({
                success: true,
                data: {
                    paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
                    transactionId: merchantTransactionId
                }
            });
        } else {
            console.log('PhonePe payment creation failed:', response.data);
            return res.status(400).json({
                success: false,
                message: 'Failed to create PhonePe payment',
                error: response.data
            });
        }
    } catch (error) {
        console.error('Error creating PhonePe order:', error.message);
        console.error('Error stack:', error.stack);
        
        // Check if it's an Axios error with response data
        if (error.response) {
            console.error('PhonePe API error response:', error.response.data);
            console.error('PhonePe API error status:', error.response.status);
            console.error('PhonePe API error headers:', error.response.headers);
        } else {
            console.error('Full error object:', JSON.stringify(error, null, 2));
        }
        
        return res.status(500).json({
            success: false,
            message: 'Failed to create PhonePe payment',
            error: error.message
        });
    }
};

// Handle PhonePe callback
const handlePhonePeCallback = async (req, res) => {
    try {
        console.log('PhonePe callback received:', JSON.stringify(req.body, null, 2));
        const { merchantTransactionId, transactionId, merchantId } = req.body;

        // Validate the callback data
        if (!merchantTransactionId || !transactionId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid callback data'
            });
        }

        // Generate X-VERIFY for status check
const xVerify = crypto
    .createHash('sha256')
    .update("/pg/v1/status/" + MERCHANT_ID + "/" + merchantTransactionId + PHONEPE_CLIENT_SECRET)
    .digest('hex') + '###1';

// Check payment status from PhonePe
const statusResponse = await axios.get(
    `${PHONEPE_BASE_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
    {
        headers: {
            'X-VERIFY': xVerify,
            'X-MERCHANT-ID': MERCHANT_ID,
            'Accept': 'application/json'
        }
    }
);

// Extract payment status from the response
const paymentStatus = statusResponse.data?.data?.state || 'UNKNOWN';

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
        phonePePaymentId: transactionId || statusResponse.data?.data?.transactionId
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

// Handle PhonePe redirect
const handlePhonePeRedirect = async (req, res) => {
    try {
        const { merchantTransactionId } = req.query;
        console.log('PhonePe redirect received with merchantTransactionId:', merchantTransactionId);
        console.log('Query parameters:', req.query);

        // Redirect to the frontend with transaction ID
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment-status?transactionId=${merchantTransactionId}`;
        console.log('Redirecting to:', redirectUrl);
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('PhonePe redirect error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment-error`);
    }
};

// Check PhonePe payment status
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

        // Generate X-VERIFY for status check
        const xVerify = crypto
            .createHash('sha256')
            .update("/pg/v1/status/" + MERCHANT_ID + "/" + transactionId + PHONEPE_CLIENT_SECRET)
            .digest('hex') + '###1';

        console.log('Making status check API call to PhonePe');
        // Check payment status from PhonePe
        const statusResponse = await axios.get(
            `${PHONEPE_BASE_URL}/pg/v1/status/${MERCHANT_ID}/${transactionId}`,
            {
                headers: {
                    'X-VERIFY': xVerify,
                    'X-MERCHANT-ID': MERCHANT_ID,
                    'Accept': 'application/json'
                }
            }
        );

        // Extract payment status from the response
        const phonePeStatus = statusResponse.data?.data?.state || 'UNKNOWN';
        console.log('PhonePe status response:', JSON.stringify(statusResponse.data, null, 2));
        console.log('PhonePe status:', phonePeStatus);

        res.status(200).json({
            success: true,
            paymentStatus: booking.paymentStatus,
            phonePeStatus: phonePeStatus,
            booking: booking,
            rawResponse: statusResponse.data // Include raw response for debugging
        });
    } catch (error) {
        console.error('Check PhonePe status error:', error.message);
        if (error.response) {
            console.error('PhonePe API error response:', error.response.data);
            console.error('PhonePe API error status:', error.response.status);
        }
        res.status(500).json({
            success: false,
            message: 'Failed to check payment status',
            error: error.response?.data?.message || error.message
        });
    }
};

// Handle PhonePe webhook
const handlePhonePeWebhook = async (req, res) => {
    try {
        console.log('PhonePe webhook received:', JSON.stringify(req.body, null, 2));
        
        // Extract event type and data from webhook payload
        const { event, data } = req.body;
        
        if (!event || !data) {
            console.warn('Invalid webhook data received');
            // Always return 200 to acknowledge receipt of webhook
            return res.status(200).send('OK');
        }
        
        console.log(`Processing PhonePe webhook event: ${event}`);
        
        // Handle different event types
        switch (event) {
            case 'pg.order.completed':
            case 'paylink.order.completed':
            case 'checkout.order.completed':
                // Payment successful
                if (data.merchantTransactionId) {
                    const booking = await Booking.findOne({ phonePeTransactionId: data.merchantTransactionId });
                    if (booking) {
                        await Booking.findByIdAndUpdate(booking._id, {
                            paymentStatus: 'completed',
                            phonePePaymentId: data.transactionId || data.id
                        });
                        console.log(`Booking ${booking._id} payment marked as completed via webhook`);
                    } else {
                        console.warn(`Booking not found for transaction ID: ${data.merchantTransactionId}`);
                    }
                }
                break;
                
            case 'pg.order.failed':
            case 'paylink.order.failed':
            case 'subscription.notification.failed':
            case 'subscription.redemption.order.failed':
                // Payment failed
                if (data.merchantTransactionId) {
                    const booking = await Booking.findOne({ phonePeTransactionId: data.merchantTransactionId });
                    if (booking) {
                        await Booking.findByIdAndUpdate(booking._id, {
                            paymentStatus: 'failed'
                        });
                        console.log(`Booking ${booking._id} payment marked as failed via webhook`);
                    } else {
                        console.warn(`Booking not found for transaction ID: ${data.merchantTransactionId}`);
                    }
                }
                break;
                
            default:
                console.log(`Unhandled webhook event type: ${event}`);
        }
        
        // Always return 200 to acknowledge receipt of webhook
        return res.status(200).send('OK');
    } catch (error) {
        console.error('PhonePe webhook error:', error.message);
        // Still return 200 to acknowledge receipt even if processing failed
        return res.status(200).send('OK');
    }
};

module.exports = {
    createPhonePeOrder,
    handlePhonePeCallback,
    handlePhonePeRedirect,
    checkPhonePeStatus,
    handlePhonePeWebhook
};