const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
const createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', bookingId } = req.body;

        // Validate required fields
        if (!amount || !bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Amount and booking ID are required'
            });
        }

        // Create order options
        const options = {
            amount: amount * 100, // Amount in paise
            currency,
            receipt: `booking_${bookingId}`,
            notes: {
                bookingId: bookingId
            }
        };

        // Create order with Razorpay
        const order = await razorpay.orders.create(options);

        // Update booking with order ID
        await Booking.findByIdAndUpdate(bookingId, {
            razorpayOrderId: order.id,
            paymentStatus: 'pending'
        });

        res.status(200).json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt
            }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
};

// Verify payment
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId
        } = req.body;

        // Create signature for verification
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        // Verify signature
        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update booking payment status
            await Booking.findByIdAndUpdate(bookingId, {
                paymentStatus: 'completed',
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature
            });

            res.status(200).json({
                success: true,
                message: 'Payment verified successfully'
            });
        } else {
            // Update booking payment status to failed
            await Booking.findByIdAndUpdate(bookingId, {
                paymentStatus: 'failed'
            });

            res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            paymentStatus: booking.paymentStatus,
            razorpayOrderId: booking.razorpayOrderId,
            razorpayPaymentId: booking.razorpayPaymentId
        });
    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment status',
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    getPaymentStatus
};
