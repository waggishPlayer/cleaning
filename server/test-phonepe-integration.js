require('dotenv').config({ path: './.env.development' });
const axios = require('axios');
const crypto = require('crypto');

// PhonePe client credentials from environment variables
const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID || "PGTESTPAYUAT";
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || "96434309-7796-489d-8924-ab56988a6076";
const PHONEPE_BASE_URL = process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT86";

console.log('PhonePe Integration Test');
console.log('------------------------');
console.log(`Client ID: ${PHONEPE_CLIENT_ID}`);
console.log(`Base URL: ${PHONEPE_BASE_URL}`);
console.log(`Merchant ID: ${MERCHANT_ID}`);

// Generate a unique transaction ID
const merchantTransactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

// Create payload for PhonePe API
const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: `MUID_TEST_USER`,
    amount: 10000, // 100 INR in paise
    redirectUrl: `http://localhost:5001/api/payments/phonepe-redirect`,
    redirectMode: "REDIRECT",
    callbackUrl: `http://localhost:5001/api/payments/phonepe-callback`,
    mobileNumber: "9999999999",
    paymentInstrument: {
        type: "PAY_PAGE"
    }
};

// Convert payload to base64
const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');

// Generate X-VERIFY header
const xVerify = crypto
    .createHash('sha256')
    .update(payloadBase64 + "/pg/v1/pay" + PHONEPE_CLIENT_SECRET)
    .digest('hex') + '###1';

// Add merchant ID to headers
const headers = {
    'Content-Type': 'application/json',
    'X-VERIFY': xVerify,
    'X-MERCHANT-ID': MERCHANT_ID,
    'Accept': 'application/json'
};

console.log('\nPayload:');
console.log(JSON.stringify(payload, null, 2));
console.log('\nBase64 Payload:');
console.log(payloadBase64);
console.log('\nX-VERIFY:');
console.log(xVerify);

// Make API call to PhonePe
async function testPhonePeAPI() {
    try {
        console.log('\nSending request to PhonePe API...');
        const response = await axios.post(
            `${PHONEPE_BASE_URL}/pg/v1/pay`,
            {
                request: payloadBase64
            },
            {
                headers: headers
            }
        );

        console.log('\nResponse:');
        console.log(JSON.stringify(response.data, null, 2));

        if (response.data.data && response.data.data.instrumentResponse && 
            response.data.data.instrumentResponse.redirectInfo) {
            console.log('\nPayment URL:');
            console.log(response.data.data.instrumentResponse.redirectInfo.url);
        }
    } catch (error) {
        console.error('\nError:');
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            console.error('Request made but no response received');
            console.error(error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
    }
}

testPhonePeAPI();