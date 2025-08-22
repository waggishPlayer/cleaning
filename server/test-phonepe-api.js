const crypto = require('crypto');
const axios = require('axios');

// PhonePe sandbox configuration
const PHONEPE_BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
const MERCHANT_ID = 'PGTESTPAYUAT86';
const CLIENT_SECRET = '96434309-7796-489d-8924-ab56988a6076';

// Test function to create a PhonePe payment
async function testPhonePePayment() {
    try {
        console.log('Testing PhonePe API with sandbox credentials...');
        console.log(`API URL: ${PHONEPE_BASE_URL}`);
        console.log(`Merchant ID: ${MERCHANT_ID}`);
        
        // Generate a unique transaction ID
        const merchantTransactionId = `TEST_TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        // Create test payload
        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: 'MUID_TEST_USER_123',
            amount: 100, // 1 rupee in paise
            redirectUrl: 'https://caarvo.onrender.com/api/payments/phonepe-redirect',
            redirectMode: 'REDIRECT',
            callbackUrl: 'https://caarvo.onrender.com/api/payments/phonepe-callback',
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };
        
        console.log('Payload:', JSON.stringify(payload, null, 2));
        
        // Convert payload to base64
        const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
        
        // Generate X-VERIFY header for V2 API
        const xVerify = crypto
            .createHash('sha256')
            .update(payloadBase64 + '/checkout/v2/pay' + CLIENT_SECRET)
            .digest('hex') + '###1';
        
        // Make API call to V2 endpoint
        const response = await axios.post(
            `${PHONEPE_BASE_URL}/checkout/v2/pay`,
            { request: payloadBase64 },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': xVerify,
                    'X-MERCHANT-ID': MERCHANT_ID,
                    'Accept': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ SUCCESS! PhonePe API response:');
        console.log(JSON.stringify(response.data, null, 2));
        
        if (response.data.success) {
            console.log('🎉 Payment URL:', response.data.data.instrumentResponse.redirectInfo.url);
        }
        
    } catch (error) {
        console.log('❌ ERROR occurred:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Status Text:', error.response.statusText);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error:', error.message);
        }
    }
}

// Run the test
testPhonePePayment();
