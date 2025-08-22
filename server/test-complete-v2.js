const axios = require('axios');
require('dotenv').config({ path: '.env.production' });

// Your production credentials
const CLIENT_ID = process.env.PHONEPE_CLIENT_ID;
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET;
const CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION || '1';
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;

console.log('Testing Complete PhonePe V2 Migration...');
console.log('CLIENT_ID:', CLIENT_ID);
console.log('CLIENT_VERSION:', CLIENT_VERSION);
console.log('MERCHANT_ID:', MERCHANT_ID);
console.log('CLIENT_SECRET:', CLIENT_SECRET ? CLIENT_SECRET.substring(0, 10) + '...' : 'NOT SET');

async function testCompleteV2Flow() {
    try {
        // Step 1: Get authorization token
        console.log('\n=== Step 1: Getting Authorization Token ===');
        const authUrl = 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';
        
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            client_version: CLIENT_VERSION,
            client_secret: CLIENT_SECRET,
            grant_type: 'client_credentials'
        });

        console.log('Making authorization request...');
        console.log('URL:', authUrl);

        const authResponse = await axios.post(authUrl, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 30000
        });

        console.log('✅ Authorization successful!');
        console.log('Token expires at:', new Date(authResponse.data.expires_at * 1000).toISOString());
        
        const authToken = authResponse.data.access_token;
        
        // Step 2: Create payment
        console.log('\n=== Step 2: Creating Payment ===');
        
        const merchantOrderId = `TEST_V2_${Date.now()}`;
        const paymentPayload = {
            merchantOrderId: merchantOrderId,
            amount: 1000, // ₹10 in paisa
            paymentFlow: {
                type: "PG_CHECKOUT",
                merchantUrls: {
                    redirectUrl: "https://caarvo.onrender.com/api/payments/phonepe-redirect"
                }
            }
        };

        console.log('Payment payload:', JSON.stringify(paymentPayload, null, 2));

        const paymentUrl = 'https://api.phonepe.com/apis/pg/checkout/v2/pay';
        console.log('Making payment request to:', paymentUrl);
        
        const paymentResponse = await axios.post(paymentUrl, paymentPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `O-Bearer ${authToken}`
            },
            timeout: 30000
        });

        console.log('✅ Payment creation successful!');
        console.log('Order ID:', paymentResponse.data.orderId);
        console.log('Redirect URL:', paymentResponse.data.redirectUrl);
        
        const orderId = paymentResponse.data.orderId;
        
        // Step 3: Check payment status
        console.log('\n=== Step 3: Checking Payment Status ===');
        
        const statusUrl = `https://api.phonepe.com/apis/pg/checkout/v2/order/${merchantOrderId}/status`;
        console.log('Making status request to:', statusUrl);
        
        const statusResponse = await axios.get(statusUrl, {
            headers: {
                'Authorization': `O-Bearer ${authToken}`,
                'Accept': 'application/json'
            },
            timeout: 30000
        });

        console.log('✅ Status check successful!');
        console.log('Status response:', JSON.stringify(statusResponse.data, null, 2));
        
        console.log('\n🎉 Complete V2 Migration Test SUCCESSFUL!');
        console.log('✅ Authorization: Working');
        console.log('✅ Payment Creation: Working');
        console.log('✅ Status Check: Working');
        
        return {
            authToken,
            orderId,
            merchantOrderId,
            status: statusResponse.data.state
        };
        
    } catch (error) {
        console.error('\n❌ V2 Migration Test FAILED:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Error Message:', error.message);
        
        return null;
    }
}

// Run the complete test
testCompleteV2Flow().then(result => {
    if (result) {
        console.log('\n✅ V2 Migration is ready for production!');
    } else {
        console.log('\n❌ V2 Migration needs more work.');
    }
}).catch(console.error);
