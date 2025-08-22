const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");

// PhonePe configuration from environment variables
const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID || "SU2507312040090646235684";
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || "c643640d-f84c-4e84-abce-a9b161c73d0a";
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "M23I1QLTF4I88";
const PHONEPE_BASE_URL = process.env.NODE_ENV === 'production' 
    ? "https://api.phonepe.com/apis/hermes"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox";

console.log(`PhonePe Integration - Using Merchant ID: ${PHONEPE_MERCHANT_ID}`);
console.log(`PhonePe Integration - Using Base URL: ${PHONEPE_BASE_URL}`);

// Create PhonePe payment order
router.post("/create", async (req, res) => {
  try {
    console.log('PhonePe create order request:', req.body);
    const { amount, merchantTransactionId, bookingId } = req.body;

    // Validate required fields
    if (!amount || !merchantTransactionId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and merchant transaction ID are required'
      });
    }

    // Get booking details if bookingId is provided
    let booking = null;
    if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
      booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
    }

    // Create payload for PhonePe API
    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: booking ? `MUID_${booking.customer}` : "user123",
      amount: amount * 100, // Convert to paise
      redirectUrl: `${req.protocol}://${req.get('host')}/api/phonepe/redirect`,
      redirectMode: "REDIRECT",
      callbackUrl: `${req.protocol}://${req.get('host')}/api/phonepe/callback`,
      paymentInstrument: {
        type: "PAY_PAGE"
      },
      // Add webhook URL for server-to-server notifications
      webhookUrl: `${req.protocol}://${req.get('host')}/api/phonepe/webhook`
    };

    console.log('PhonePe payload:', JSON.stringify(payload, null, 2));

    // Convert payload to base64
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
    
    // Generate X-VERIFY header for V2 API
    const dataToHash = payloadBase64 + "/checkout/v2/pay" + PHONEPE_CLIENT_SECRET;
    const sha256 = crypto.createHash("sha256").update(dataToHash).digest("hex");
    const X_VERIFY = sha256 + "###1";

    console.log('Making API call to PhonePe');
    
    // Make API call to PhonePe V2 API
    const response = await fetch(`${PHONEPE_BASE_URL}/checkout/v2/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": X_VERIFY,
        "X-MERCHANT-ID": PHONEPE_MERCHANT_ID,
        "Accept": "application/json"
      },
      body: JSON.stringify({ request: payloadBase64 })
    });

    const result = await response.json();
    console.log('PhonePe API response:', result);

    if (result.success) {
      // Update booking with PhonePe transaction ID if booking exists
      if (booking) {
        await Booking.findByIdAndUpdate(bookingId, {
          phonePeTransactionId: merchantTransactionId,
          paymentStatus: 'pending',
          paymentMethod: 'phonepe'
        });
        console.log('Booking updated with PhonePe transaction ID:', merchantTransactionId);
      }

      res.json({
        success: true,
        data: {
          paymentUrl: result.data.instrumentResponse.redirectInfo.url,
          transactionId: merchantTransactionId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to create PhonePe payment',
        error: result
      });
    }
  } catch (err) {
    console.error('PhonePe create order error:', err);
    res.status(500).json({ 
      success: false,
      error: "Payment gateway error. Please try again later.",
      details: err.message 
    });
  }
});

// Handle PhonePe redirect
router.get("/redirect", async (req, res) => {
  try {
    const { merchantTransactionId } = req.query;
    console.log('PhonePe redirect received with merchantTransactionId:', merchantTransactionId);

    // Redirect to the frontend with transaction ID
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-status?transactionId=${merchantTransactionId}`;
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('PhonePe redirect error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-error`);
  }
});

// Handle PhonePe callback
router.post("/callback", async (req, res) => {
  try {
    console.log('PhonePe callback received:', req.body);
    const { merchantTransactionId, transactionId } = req.body;

    // Validate the callback data
    if (!merchantTransactionId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid callback data'
      });
    }

    // Find booking by PhonePe transaction ID
    const booking = await Booking.findOne({ phonePeTransactionId: merchantTransactionId });
    if (booking) {
      // Update booking payment status
      await Booking.findByIdAndUpdate(booking._id, {
        paymentStatus: 'completed',
        phonePePaymentId: transactionId
      });
      console.log('Booking payment marked as completed:', booking._id);
    }

    res.status(200).json({
      success: true,
      message: 'Callback processed successfully'
    });
  } catch (error) {
    console.error('PhonePe callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process callback',
      error: error.message
    });
  }
});

// Check PhonePe payment status
router.get("/status/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    console.log('Checking PhonePe status for transaction ID:', transactionId);

    // Find booking by PhonePe transaction ID
    const booking = await Booking.findOne({ phonePeTransactionId: transactionId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Generate X-VERIFY for status check using V2 API
    const xVerify = crypto
      .createHash('sha256')
      .update("/checkout/v2/order/" + transactionId + "/status" + PHONEPE_CLIENT_SECRET)
      .digest('hex') + '###1';

    // Check payment status from PhonePe V2 API
    const statusResponse = await fetch(
      `${PHONEPE_BASE_URL}/checkout/v2/order/${transactionId}/status`,
      {
        headers: {
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
          'Accept': 'application/json'
        }
      }
    );

    const statusResult = await statusResponse.json();
    console.log('PhonePe status response:', statusResult);

    const phonePeStatus = statusResult?.data?.state || 'UNKNOWN';

    res.status(200).json({
      success: true,
      paymentStatus: booking.paymentStatus,
      phonePeStatus: phonePeStatus,
      booking: booking
    });
  } catch (error) {
    console.error('Check PhonePe status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error.message
    });
  }
});

// Handle PhonePe webhook
router.post("/webhook", async (req, res) => {
  try {
    console.log('PhonePe webhook received:', req.body);
    
    const { event, data } = req.body;
    
    if (!event || !data) {
      console.warn('Invalid webhook data received');
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
          }
        }
        break;
        
      case 'pg.order.failed':
      case 'paylink.order.failed':
        // Payment failed
        if (data.merchantTransactionId) {
          const booking = await Booking.findOne({ phonePeTransactionId: data.merchantTransactionId });
          if (booking) {
            await Booking.findByIdAndUpdate(booking._id, {
              paymentStatus: 'failed'
            });
            console.log(`Booking ${booking._id} payment marked as failed via webhook`);
          }
        }
        break;
        
      default:
        console.log(`Unhandled webhook event type: ${event}`);
    }
    
    // Always return 200 to acknowledge receipt of webhook
    return res.status(200).send('OK');
  } catch (error) {
    console.error('PhonePe webhook error:', error);
    // Still return 200 to acknowledge receipt even if processing failed
    return res.status(200).send('OK');
  }
});

module.exports = router; 