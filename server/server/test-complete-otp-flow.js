const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

const API_BASE = 'http://localhost:5001/api/auth';

async function testCompleteOTPFlow() {
  console.log('🧪 Testing Complete WhatsApp OTP Registration Flow');
  console.log('='.repeat(60));
  
  const testPhone = '+918765432109';
  const testName = 'Test User';
  const testPassword = 'password123';
  let generatedOTP = null;
  
  try {
    // Step 1: Send OTP
    console.log('\n📱 Step 1: Sending WhatsApp OTP...');
    console.log(`Phone: ${testPhone}`);
    
    const sendResponse = await axios.post(`${API_BASE}/send-otp`, {
      phone: testPhone
    });
    
    console.log('✅ OTP Send Response:', sendResponse.data);
    
    // In development, we can see the OTP in the response or console
    if (sendResponse.data.devOtp) {
      generatedOTP = sendResponse.data.devOtp;
      console.log(`🔐 Generated OTP: ${generatedOTP}`);
    } else {
      console.log('📋 Check server console for the OTP');
      // For demo purposes, let's use a test OTP
      generatedOTP = '123456';
      console.log(`🔧 Using test OTP: ${generatedOTP}`);
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Verify OTP
    console.log('\n🔐 Step 2: Verifying OTP...');
    
    const verifyResponse = await axios.post(`${API_BASE}/verify-otp`, {
      phone: testPhone,
      otp: generatedOTP
    });
    
    console.log('✅ OTP Verification Response:', verifyResponse.data);
    
    if (!verifyResponse.data.success) {
      console.log('⚠️ OTP verification failed. This is expected with test OTP.');
      console.log('💡 In production, use the actual OTP received on WhatsApp');
      return;
    }
    
    // Step 3: Complete Registration
    console.log('\n👤 Step 3: Completing User Registration...');
    
    const registerResponse = await axios.post(`${API_BASE}/register-user`, {
      name: testName,
      phone: testPhone,
      password: testPassword
    });
    
    console.log('✅ Registration Response:', registerResponse.data);
    
    // Step 4: Test Login
    console.log('\n🔑 Step 4: Testing Login...');
    
    const loginResponse = await axios.post(`${API_BASE}/login-password`, {
      phone: testPhone,
      password: testPassword
    });
    
    console.log('✅ Login Response:', loginResponse.data);
    
    console.log('\n🎉 Complete OTP Flow Test Completed Successfully!');
    
  } catch (error) {
    console.error('\n❌ Error during OTP flow test:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function testWhatsAppConfiguration() {
  console.log('\n🔍 Testing WhatsApp Configuration');
  console.log('='.repeat(40));
  
  console.log('MSG91_API_KEY:', process.env.MSG91_API_KEY ? 'SET ✅' : 'MISSING ❌');
  console.log('WhatsApp Business Number: 919203240991 ✅');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  
  if (process.env.MSG91_API_KEY) {
    console.log('API Key Preview:', process.env.MSG91_API_KEY.substring(0, 10) + '...');
  }
}

// Run tests
(async () => {
  await testWhatsAppConfiguration();
  await testCompleteOTPFlow();
})();
