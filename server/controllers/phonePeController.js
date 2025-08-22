const axios = require('axios');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');

// PhonePe V2 API client credentials
const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID || "PGTESTPAYUAT";
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || "96434309-7796-489d-8924-ab56988a6076";
const PHONEPE_CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION || "1";

// PhonePe V2 API URLs
const PHONEPE_AUTH_URL = process.env.NODE_ENV === 'production'
    ? "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";

const PHONEPE_BASE_URL = process.env.NODE_ENV === 'production'
    ? "https://api.phonepe.com/apis/pg"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox";

// Use production merchant ID
const MERCHANT_ID = process.env.NODE_ENV === 'production' 
    ? process.env.PHONEPE_MERCHANT_ID 
    : "PGTESTPAYUAT86";

// Token cache to avoid frequent auth calls
let authTokenCache = {
    token: null,
    expiresAt: null
};

console.log('PhonePe V2 Configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MERCHANT_ID from env:', process.env.PHONEPE_MERCHANT_ID);
console.log('- Final MERCHANT_ID:', MERCHANT_ID);
console.log('- CLIENT_ID:', PHONEPE_CLIENT_ID);
console.log('- CLIENT_VERSION:', PHONEPE_CLIENT_VERSION);
console.log('- AUTH_URL:', PHONEPE_AUTH_URL);
console.log('- BASE_URL:', PHONEPE_BASE_URL);

// Function to get OAuth token for V2 API
const getAuthToken = async () => {
    try {
        // Check if we have a valid cached token
        if (authTokenCache.token && authTokenCache.expiresAt && Date.now() < authTokenCache.expiresAt) {
            console.log('Using cached auth token');
            return authTokenCache.token;
        }

        console.log('Requesting new PhonePe V2 auth token...');
        
        const params = new URLSearchParams({
            client_id: PHONEPE_CLIENT_ID,
            client_version: PHONEPE_CLIENT_VERSION,
            client_secret: PHONEPE_CLIENT_SECRET,
            grant_type: 'client_credentials'
        });

        const response = await axios.post(PHONEPE_AUTH_URL, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 30000
        });

        if (response.data && response.data.access_token) {
            // Cache the token (expires 5 minutes before actual expiry for safety)
            const expiresAt = response.data.expires_at ? (response.data.expires_at * 1000 - 300000) : (Date.now() + 3300000);
            
            authTokenCache = {
                token: response.data.access_token,
                expiresAt: expiresAt
            };

            console.log('Successfully obtained auth token, expires at:', new Date(expiresAt).toISOString());
            return response.data.access_token;
        } else {
            throw new Error('No access token in response');
        }
    } catch (error) {
        console.error('Failed to get auth token:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        throw new Error('Failed to authenticate with PhonePe V2 API');
    }
};

// Create PhonePe payment order using V2 API
const createPhonePeOrder = async (req, res) => {
    try {
        console.log('=== PhonePe V2 order creation request received ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('User from auth middleware:', req.user);
        
        const { amount, currency = 'INR', bookingId } = req.body;

        // Validate required fields
        if (!amount || !bookingId) {
            console.log('Missing required fields:', { amount, bookingId });
            return res.status(400).json({
                success: false,
                message: 'Amount and booking ID are required'
            });
        }

        // Validate amount is a positive number
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be a positive number'
            });
        }

        // Validate booking ID format
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID format'
            });
        }

        // Get booking details
        let booking;
        
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
            // For testing purposes
            console.log('Test booking ID detected:', bookingId);
            booking = {
                _id: 'test-booking-id',
                customer: 'test-user-id',
                price: amount
            };
        }

        // Get user details for the booking
        let user;
        let userPhone = '';
        
        if (mongoose.Types.ObjectId.isValid(booking.customer)) {
            user = await mongoose.model('User').findById(booking.customer);
            userPhone = user?.phone || '';
        } else {
            console.log('Test user ID detected:', booking.customer);
            userPhone = '9999999999'; // Default test phone number
        }
        
        console.log('User details:', { userId: booking.customer, userPhone });

        // Generate a unique merchant order ID for V2 API
        const merchantOrderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        console.log('Generated order ID:', merchantOrderId);
        
        // Get OAuth token
        const authToken = await getAuthToken();
        
        // Create V2 API payload
        const payload = {
            merchantOrderId: merchantOrderId,
            amount: amount * 100, // Convert rupees to paise
            paymentFlow: {
                type: "PG_CHECKOUT",
                merchantUrls: {
                    redirectUrl: `${req.protocol}://${req.get('host')}/api/payments/phonepe-redirect`
                }
            }
        };

        console.log('PhonePe V2 payload:', JSON.stringify(payload, null, 2));

        // Make API call to PhonePe V2 API
        let response;
        try {
            const payEndpoint = '/checkout/v2/pay';
            const fullUrl = `${PHONEPE_BASE_URL}${payEndpoint}`;
            console.log(`Making V2 request to: ${fullUrl}`);
            
            response = await axios.post(fullUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `O-Bearer ${authToken}`,
                    'Accept': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            });
        } catch (apiError) {
            console.error('PhonePe V2 API Error:', {
                status: apiError.response?.status,
                statusText: apiError.response?.statusText,
                data: apiError.response?.data,
                message: apiError.message
            });
            
            // Return a user-friendly error response
            return res.status(500).json({
                success: false,
                message: 'Payment gateway error. Please try again later.',
                error: {
                    code: apiError.response?.status || 'UNKNOWN',
                    message: apiError.response?.data?.message || apiError.message
                }
            });
        }

        console.log('PhonePe V2 response:', JSON.stringify(response.data, null, 2));

        // Check if the response is successful
        if (response.data && response.data.orderId) {
            // Update booking with PhonePe order details
            if (mongoose.Types.ObjectId.isValid(bookingId)) {
                await Booking.findByIdAndUpdate(bookingId, {
                    phonePeOrderId: response.data.orderId,
                    phonePeMerchantOrderId: merchantOrderId,
                    paymentStatus: 'pending',
                    paymentMethod: 'phonepe'
                });
            } else {
                console.log('Test booking - skipping database update');
            }

            console.log('Booking updated with PhonePe V2 order details:', {
                bookingId,
                orderId: response.data.orderId,
                merchantOrderId: merchantOrderId,
                paymentStatus: 'pending'
            });

            // Return the payment URL to the client
            return res.status(200).json({
                success: true,
                data: {
                    paymentUrl: response.data.redirectUrl,
                    orderId: response.data.orderId,
                    merchantOrderId: merchantOrderId
                }
            });
        } else {
            console.log('PhonePe V2 payment creation failed:', response.data);
            return res.status(400).json({
                success: false,
                message: 'Failed to create PhonePe payment',
                error: response.data
            });
        }
    } catch (error) {
        console.error('Error creating PhonePe V2 order:', error.message);
        console.error('Error stack:', error.stack);
        
        return res.status(500).json({
            success: false,
            message: 'Failed to create PhonePe payment',
            error: error.message
        });
    }
};

// Handle PhonePe V2 callback
const handlePhonePeCallback = async (req, res) => {
    try {
        console.log('PhonePe V2 callback received:', JSON.stringify(req.body, null, 2));
        const { orderId, merchantOrderId } = req.body;

        // Validate the callback data
        if (!orderId || !merchantOrderId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid callback data'
            });
        }

        // Get OAuth token for status check
        const authToken = await getAuthToken();

        // Check payment status from PhonePe V2 API
        console.log(`Making V2 status check request for order: ${merchantOrderId}`);
        let statusResponse;
        try {
            const statusUrl = `${PHONEPE_BASE_URL}/checkout/v2/order/${merchantOrderId}/status`;
            console.log(`Status check URL: ${statusUrl}`);
            
            statusResponse = await axios.get(statusUrl, {
                headers: {
                    'Authorization': `O-Bearer ${authToken}`,
                    'Accept': 'application/json'
                },
                timeout: 30000
            });
            
            console.log('PhonePe V2 status check response:', JSON.stringify(statusResponse.data, null, 2));
        } catch (error) {
            console.error('PhonePe V2 status check error:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }

        // Extract payment status from the V2 response
        const paymentStatus = statusResponse.data?.state || 'UNKNOWN';

        // Find booking by PhonePe order ID
        const booking = await Booking.findOne({ 
            $or: [
                { phonePeOrderId: orderId },
                { phonePeMerchantOrderId: merchantOrderId }
            ]
        });
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Update booking payment status based on PhonePe V2 status
        if (paymentStatus === 'COMPLETED' || paymentStatus === 'SUCCESS') {
            await Booking.findByIdAndUpdate(booking._id, {
                paymentStatus: 'completed',
                phonePeOrderId: orderId
            });
        } else if (paymentStatus === 'FAILED' || paymentStatus === 'FAILURE') {
            await Booking.findByIdAndUpdate(booking._id, {
                paymentStatus: 'failed'
            });
        }

        res.status(200).json({
            success: true,
            message: 'V2 Callback processed successfully'
        });
    } catch (error) {
        console.error('Error processing PhonePe V2 callback:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to process callback',
            error: error.message
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

// Check PhonePe V2 payment status
const checkPhonePeStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        console.log('Checking PhonePe V2 status for order ID:', transactionId);

        // Find booking by PhonePe order ID or merchant order ID
        const booking = await Booking.findOne({ 
            $or: [
                { phonePeOrderId: transactionId },
                { phonePeMerchantOrderId: transactionId }
            ]
        });
        
        if (!booking) {
            console.error('Booking not found for transaction ID:', transactionId);
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        console.log('Found booking:', booking._id);

        // Get OAuth token for status check
        const authToken = await getAuthToken();

        console.log('Making V2 status check API call to PhonePe');
        // Check payment status from PhonePe V2 API
        const statusUrl = `${PHONEPE_BASE_URL}/checkout/v2/order/${transactionId}/status`;
        console.log(`Making V2 status check request to: ${statusUrl}`);
        
        let statusResponse;
        try {
            statusResponse = await axios.get(statusUrl, {
                headers: {
                    'Authorization': `O-Bearer ${authToken}`,
                    'Accept': 'application/json'
                },
                timeout: 30000
            });
            console.log('PhonePe V2 status check response:', JSON.stringify(statusResponse.data, null, 2));
        } catch (error) {
            console.error('PhonePe V2 status check error:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            return res.status(500).json({
                success: false,
                message: 'Failed to check payment status',
                error: error.response?.data?.message || error.message
            });
        }

        // Extract payment status from the V2 response
        const phonePeStatus = statusResponse.data?.state || 'UNKNOWN';
        console.log('PhonePe V2 status response:', JSON.stringify(statusResponse.data, null, 2));
        console.log('PhonePe V2 status:', phonePeStatus);

        res.status(200).json({
            success: true,
            paymentStatus: booking.paymentStatus,
            phonePeStatus: phonePeStatus,
            booking: booking,
            rawResponse: statusResponse.data // Include raw response for debugging
        });
    } catch (error) {
        console.error('Check PhonePe V2 status error:', error.message);
        if (error.response) {
            console.error('PhonePe V2 API error response:', error.response.data);
            console.error('PhonePe V2 API error status:', error.response.status);
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