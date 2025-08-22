const axios = require('axios');
require('dotenv').config({ path: '.env.production' });

// Your production credentials
const CLIENT_ID = process.env.PHONEPE_CLIENT_ID;
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET;
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;

console.log('Testing PhonePe V2 Authorization...');
console.log('CLIENT_ID:', CLIENT_ID);
console.log('MERCHANT_ID:', MERCHANT_ID);
console.log('CLIENT_SECRET:', CLIENT_SECRET ? CLIENT_SECRET.substring(0, 10) + '...' : 'NOT SET');

async function testV2Authorization() {
    try {
        // Try to get authorization token
        const authUrl = 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';
        
        // Try with client_version = 1 first
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            client_version: '1',
            client_secret: CLIENT_SECRET,
            grant_type: 'client_credentials'
        });

        console.log('\nMaking authorization request...');
        console.log('URL:', authUrl);
        console.log('Params:', {
            client_id: CLIENT_ID,
            client_version: '1',
            client_secret: CLIENT_SECRET ? CLIENT_SECRET.substring(0, 10) + '...' : 'NOT SET',
            grant_type: 'client_credentials'
        });

        const response = await axios.post(authUrl, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 30000
        });

        console.log('\nAuthorization successful!');
        console.log('Response:', response.data);
        
        return response.data.access_token;
        
    } catch (error) {
        console.error('\nAuthorization failed:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Error Data:', error.response?.data);
        console.error('Error Message:', error.message);
        
        return null;
    }
}

async function testV2Payment(authToken) {
    if (!authToken) {
        console.log('\nSkipping payment test - no auth token');
        return;
    }
    
    try {
        console.log('\n=== Testing V2 Payment Creation ===');
        
        // Create payment payload in V2 format
        const payload = {
            merchantOrderId: `TEST_${Date.now()}`,
            amount: 1000, // ₹10 in paisa
            paymentFlow: {
                type: "PG_CHECKOUT",
                merchantUrls: {
                    redirectUrl: "https://caarvo.onrender.com/api/payments/phonepe-redirect"
                }
            }
        };

        console.log('Payment payload:', JSON.stringify(payload, null, 2));

        const paymentUrl = 'https://api.phonepe.com/apis/pg/checkout/v2/pay';
        
        const response = await axios.post(paymentUrl, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `O-Bearer ${authToken}`
            },
            timeout: 30000
        });

        console.log('\nPayment creation successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('\nPayment creation failed:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Error Message:', error.message);
    }
}

// Run the tests
async function runTests() {
    const authToken = await testV2Authorization();
    await testV2Payment(authToken);
}

runTests().catch(console.error);
