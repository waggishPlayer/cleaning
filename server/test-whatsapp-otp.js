require('dotenv').config();
const axios = require('axios');

const msg91ApiKey = process.env.MSG91_API_KEY;
const testPhoneNumber = '919876543210'; // Replace with your actual number

console.log('Testing MSG91 WhatsApp OTP Endpoint...');
console.log('API Key:', msg91ApiKey ? msg91ApiKey.substring(0, 10) + '...' : 'Missing');

// Try WhatsApp OTP specific endpoint
async function testWhatsAppOTP() {
  try {
    console.log('\n🧪 Test: WhatsApp OTP Endpoint');
    
    const url = 'https://control.msg91.com/api/v5/otp/whatsapp';
    const payload = {
      authkey: msg91ApiKey,
      mobile: testPhoneNumber,
      sender: 'MSG91'
    };
    
    console.log('📤 Sending to:', url);
    console.log('📋 Payload:', { ...payload, authkey: '[HIDDEN]' });
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ WhatsApp OTP Response:', response.data);
    console.log('📱 Check your WhatsApp for the OTP!');
    return true;
    
  } catch (error) {
    console.error('❌ WhatsApp OTP Failed:', error.response?.data || error.message);
    return false;
  }
}

// Try form-data version
async function testWhatsAppOTPForm() {
  try {
    console.log('\n🧪 Test: WhatsApp OTP Form Data');
    
    const url = 'https://control.msg91.com/api/v5/otp/whatsapp';
    
    const params = new URLSearchParams();
    params.append('authkey', msg91ApiKey);
    params.append('mobile', testPhoneNumber);
    params.append('sender', 'MSG91');
    
    console.log('📤 Sending to:', url);
    console.log('📋 Form Data - Mobile:', testPhoneNumber);
    
    const response = await axios.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log('✅ WhatsApp OTP Form Response:', response.data);
    console.log('📱 Check your WhatsApp for the OTP!');
    return true;
    
  } catch (error) {
    console.error('❌ WhatsApp OTP Form Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test if regular OTP endpoint supports WhatsApp
async function testOTPWithChannel() {
  try {
    console.log('\n🧪 Test: Regular OTP with WhatsApp channel');
    
    const url = 'https://control.msg91.com/api/v5/otp';
    const payload = {
      authkey: msg91ApiKey,
      mobile: testPhoneNumber,
      sender: 'MSG91',
      channel: 'whatsapp' // Try specifying channel
    };
    
    console.log('📤 Sending to:', url);
    console.log('📋 Payload:', { ...payload, authkey: '[HIDDEN]' });
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ OTP Channel Response:', response.data);
    console.log('📱 Check your WhatsApp for the OTP!');
    return true;
    
  } catch (error) {
    console.error('❌ OTP Channel Failed:', error.response?.data || error.message);
    return false;
  }
}

async function runOTPTests() {
  console.log('🚀 Starting WhatsApp OTP Tests...\n');
  
  const results = {
    otpEndpoint: await testWhatsAppOTP(),
    otpForm: await testWhatsAppOTPForm(),
    otpChannel: await testOTPWithChannel()
  };
  
  console.log('\n📊 OTP Test Results:');
  console.log('WhatsApp OTP Endpoint:', results.otpEndpoint ? '✅ SUCCESS' : '❌ FAILED');
  console.log('WhatsApp OTP Form:', results.otpForm ? '✅ SUCCESS' : '❌ FAILED');
  console.log('OTP with WhatsApp Channel:', results.otpChannel ? '✅ SUCCESS' : '❌ FAILED');
  
  if (Object.values(results).some(r => r)) {
    console.log('\n🎉 SUCCESS! WhatsApp OTP is working!');
  } else {
    console.log('\n❌ All WhatsApp tests failed.');
    console.log('💡 Recommendation: Contact MSG91 support with this exact error:');
    console.log('   "Getting 401 Unauthorized (apiError: 418) for WhatsApp API"');
    console.log('   "SMS works fine with same authkey: 462076AyU0v9oUQ16887210eP1"');
  }
}

runOTPTests();
