const crypto = require('crypto');
const axios = require('axios');

// Your production credentials
const MERCHANT_ID = 'M23I1QLTF4I88';
const CLIENT_SECRET = 'c643640d-f84c-4e84-abce-a9b161c73d0a';

// Different possible production endpoints to test (updated to V2)
const ENDPOINTS_TO_TEST = [
    'https://api.phonepe.com/apis/pg/checkout/v2/pay',
    'https://api.phonepe.com/apis/pg'  // Base URL - will append /checkout/v2/pay
];

// Test function
async function testProductionEndpoint(baseUrl) {
    try {
        console.log(`\n🔍 Testing endpoint: ${baseUrl}`);
        
        // Generate test transaction ID
        const merchantTransactionId = `PROD_TEST_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        // Create minimal test payload
        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: 'MUID_PROD_TEST_123',
            amount: 100, // 1 rupee in paise
            redirectUrl: 'https://caarvo.onrender.com/api/payments/phonepe-redirect',
            redirectMode: 'REDIRECT',
            callbackUrl: 'https://caarvo.onrender.com/api/payments/phonepe-callback',
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };
        
        // Convert payload to base64
        const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
        
        // Generate X-VERIFY header for V2 API
        let endpoint = '/checkout/v2/pay';
        let fullUrl = baseUrl;
        
        // If baseUrl doesn't include the full path, append the endpoint
        if (!baseUrl.includes('/checkout/v2/pay')) {
            fullUrl = baseUrl.endsWith('/') ? baseUrl + 'checkout/v2/pay' : baseUrl + '/checkout/v2/pay';
        }
        
        const xVerify = crypto
            .createHash('sha256')
            .update(payloadBase64 + endpoint + CLIENT_SECRET)
            .digest('hex') + '###1';
        
        // Make API call with timeout
        const response = await axios.post(
            fullUrl,
            { request: payloadBase64 },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': xVerify,
                    'X-MERCHANT-ID': MERCHANT_ID,
                    'Accept': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            }
        );
        
        console.log('✅ SUCCESS!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return { endpoint: baseUrl, success: true, data: response.data };
        
    } catch (error) {
        console.log('❌ FAILED');
        if (error.response) {
            console.log(`Status: ${error.response.status} - ${error.response.statusText}`);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
            return { 
                endpoint: baseUrl, 
                success: false, 
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data 
            };
        } else if (error.code === 'ECONNREFUSED') {
            console.log('Connection refused - endpoint might not exist');
            return { endpoint: baseUrl, success: false, error: 'CONNECTION_REFUSED' };
        } else {
            console.log('Error:', error.message);
            return { endpoint: baseUrl, success: false, error: error.message };
        }
    }
}

// Test all endpoints
async function testAllEndpoints() {
    console.log('🚀 Testing PhonePe production endpoints with your credentials...');
    console.log(`Merchant ID: ${MERCHANT_ID}`);
    console.log(`Client Secret: ${CLIENT_SECRET.substring(0, 10)}...`);
    
    const results = [];
    
    for (const endpoint of ENDPOINTS_TO_TEST) {
        const result = await testProductionEndpoint(endpoint);
        results.push(result);
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(50));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    if (successful.length > 0) {
        console.log('✅ Working endpoints:');
        successful.forEach(r => {
            console.log(`  - ${r.endpoint}`);
        });
    } else {
        console.log('❌ No working endpoints found');
    }
    
    if (failed.length > 0) {
        console.log('\n❌ Failed endpoints:');
        failed.forEach(r => {
            const reason = r.status ? `HTTP ${r.status}` : r.error;
            console.log(`  - ${r.endpoint} (${reason})`);
        });
    }
    
    // Analyze 404 errors
    const notFoundErrors = failed.filter(r => r.status === 404);
    if (notFoundErrors.length > 0) {
        console.log('\n⚠️  404 Errors suggest:');
        console.log('   1. Wrong API endpoint structure');
        console.log('   2. Merchant ID not activated for production');
        console.log('   3. API version mismatch');
    }
    
    // Analyze 401/403 errors  
    const authErrors = failed.filter(r => r.status === 401 || r.status === 403);
    if (authErrors.length > 0) {
        console.log('\n🔐 Authentication errors suggest:');
        console.log('   1. Invalid credentials');
        console.log('   2. Merchant not approved for production');
        console.log('   3. Wrong client secret');
    }
}

// Run the test
testAllEndpoints().catch(console.error);
