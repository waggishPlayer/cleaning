const axios = require('axios');

console.log('Testing PhonePe V2 with actual booking flow...');

async function testBookingFlow() {
    try {
        // Test the actual endpoint that the frontend will call
        const response = await axios.post('http://localhost:5001/api/payments/phonepe/create-order', {
            amount: 29900, // ₹299 in paisa
            bookingId: 'test-booking-id-v2'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer dummy-token' // This might be required by protect middleware
            },
            timeout: 30000
        });

        console.log('✅ Booking flow successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        return response.data;
        
    } catch (error) {
        console.error('❌ Booking flow failed:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Error Message:', error.message);
        
        return null;
    }
}

// Test without auth middleware (using test endpoint)
async function testWithoutAuth() {
    try {
        console.log('\nTesting without auth middleware...');
        const response = await axios.post('http://localhost:5001/api/payments/phonepe/test-create-order', {
            amount: 29900, // ₹299 in paisa
            bookingId: 'test-booking-id-v2'
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        console.log('✅ Test endpoint successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        return response.data;
        
    } catch (error) {
        console.error('❌ Test endpoint failed:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Error Message:', error.message);
        
        return null;
    }
}

// Run tests
async function runTests() {
    await testWithoutAuth();
    await testBookingFlow();
}

runTests().catch(console.error);
