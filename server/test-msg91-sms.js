require('dotenv').config();
const axios = require('axios');

const msg91ApiKey = process.env.MSG91_API_KEY;
const testPhoneNumber = '919876543210'; // Replace with your number

console.log('Testing MSG91 SMS API...');
console.log('API Key:', msg91ApiKey ? msg91ApiKey.substring(0, 10) + '...' : 'Missing');

async function testSMS() {
  try {
    console.log('\n🧪 Testing SMS to:', testPhoneNumber);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔐 Generated OTP:', otp);
    
    // Try SMS API first
    const url = 'https://control.msg91.com/api/v5/otp';
    const payload = {
      authkey: msg91ApiKey,
      mobile: testPhoneNumber.replace('91', ''), // Remove 91 prefix for SMS
      otp: otp
    };
    
    console.log('📤 Sending SMS request to MSG91...');
    console.log('📋 Payload:', { ...payload, authkey: '[HIDDEN]' });
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': msg91ApiKey
      }
    });
    
    console.log('✅ MSG91 SMS Response:', response.data);
    console.log('\n📱 Check your phone for the SMS!');
    
  } catch (error) {
    console.error('❌ MSG91 SMS Test Failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 SOLUTION: Invalid API Key or unauthorized');
      console.log('   - Verify your authkey is correct');
      console.log('   - Check if SMS service is enabled');
    }
  }
}

testSMS();
