const axios = require('axios');
require('dotenv').config({ path: '.env.production' });

// Your production credentials
const CLIENT_ID = process.env.PHONEPE_CLIENT_ID;
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET;
const CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION || '1';
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;

console.log('Testing Complete PhonePe V2 Migration with Amount Conversion...');
console.log('CLIENT_ID:', CLIENT_ID);
console.log('MERCHANT_ID:', MERCHANT_ID);
console.log('CLIENT_VERSION:', CLIENT_VERSION);
console.log('CLIENT_SECRET:', CLIENT_SECRET ? CLIENT_SECRET.substring(0, 10) + '...' : 'NOT SET');

// Function to get OAuth token
async function getAuthToken() {
    try {
        const authUrl = 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';
        
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            client_version: CLIENT_VERSION,
            client_secret: CLIENT_SECRET,
            grant_type: 'client_credentials'
        });

        console.log('\nGetting OAuth token...');
        
        const response = await axios.post(authUrl, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 30000
        });

        console.log('✓ OAuth token obtained successfully');
        return response.data.access_token;
        
    } catch (error) {
        console.error('✗ OAuth token failed:');
        console.error('Status:', error.response?.status);
        console.error('Error:', error.response?.data);
        throw error;
    }
}

// Function to test payment creation with amount conversion
async function testPaymentCreation(authToken) {
    try {
        console.log('\n=== Testing Payment Creation with Amount Conversion ===');
        
        const amountInRupees = 299; // ₹299
        const amountInPaise = amountInRupees * 100; // Convert to paise
        
        console.log(`Amount in Rupees: ₹${amountInRupees}`);
        console.log(`Amount in Paise: ${amountInPaise}`);
        
        const testPayload = {
            merchantOrderId: `TEST_${Date.now()}`,
            amount: amountInPaise,
            paymentFlow: {
                type: "PG_CHECKOUT",
                merchantUrls: {
                    redirectUrl: "https://caarvo.onrender.com/api/payments/phonepe-redirect"
                }
            }
        };

        console.log('Payment payload:', JSON.stringify(testPayload, null, 2));

        const paymentUrl = 'https://api.phonepe.com/apis/pg/checkout/v2/pay';
        
        const response = await axios.post(paymentUrl, testPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `O-Bearer ${authToken}`
            },
            timeout: 30000
        });

        console.log('✓ Payment creation successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        return response.data;
        
    } catch (error) {
        console.error('✗ Payment creation failed:');
        console.error('Status:', error.response?.status);
        console.error('Error:', JSON.stringify(error.response?.data, null, 2));
        throw error;
    }
}

// Main test function
async function runCompleteV2Test() {
    try {
        console.log('🚀 Starting Complete PhonePe V2 Test with Amount Conversion...\n');
        
        // Step 1: Get OAuth token
        const authToken = await getAuthToken();
        
        // Step 2: Test payment creation
        const paymentResult = await testPaymentCreation(authToken);
        
        console.log('\n🎉 V2 Migration with Amount Conversion Test Completed!');
        console.log('\n📝 Summary:');
        console.log('- ✓ OAuth authentication working');
        console.log('- ✓ V2 payment creation working');
        console.log('- ✓ Amount conversion (₹299 → 29900 paise) working');
        console.log('- ✓ V2 API integration complete');
        
    } catch (error) {
        console.error('\n❌ V2 migration test failed:');
        console.error(error.message);
        process.exit(1);
    }
}

// Run the complete test
runCompleteV2Test();
