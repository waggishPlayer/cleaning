const crypto = require('crypto');
const axios = require('axios');

// Your production credentials
const MERCHANT_ID = 'M23I1QLTF4I88';
const CLIENT_SECRET = 'c643640d-f84c-4e84-abce-a9b161c73d0a';

// Updated production endpoint
const PHONEPE_BASE_URL = 'https://api.phonepe.com/apis/pg';

async function testFinalEndpoint() {
    try {
        console.log('🚀 Testing UPDATED PhonePe production endpoint...');
        console.log(`API URL: ${PHONEPE_BASE_URL}/checkout/v2/pay`);
        console.log(`Merchant ID: ${MERCHANT_ID}`);
        
        // Generate test transaction ID
        const merchantTransactionId = `FINAL_TEST_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        // Create test payload
        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: 'MUID_FINAL_TEST_123',
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
                timeout: 15000
            }
        );
        
        console.log('✅ SUCCESS! Updated endpoint works!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        if (response.data.success) {
            console.log('🎉 Payment URL:', response.data.data.instrumentResponse.redirectInfo.url);
            console.log('\n✅ Your production PhonePe integration is now working!');
            console.log('Deploy the updated code and test your booking flow.');
        }
        
    } catch (error) {
        console.log('❌ Still failing:');
        if (error.response) {
            console.log(`Status: ${error.response.status} - ${error.response.statusText}`);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
            
            if (error.response.status === 400 && error.response.data.message === 'Bad Request - Api Mapping Not Found') {
                console.log('\n⚠️  This suggests your merchant account might not be fully activated.');
                console.log('Next steps:');
                console.log('1. Contact PhonePe support');
                console.log('2. Verify your merchant ID is active for production');
                console.log('3. Ensure all KYC and setup is complete');
            }
        } else {
            console.log('Error:', error.message);
        }
    }
}

// Run the test
testFinalEndpoint();
