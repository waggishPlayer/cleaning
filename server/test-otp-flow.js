const axios = require('axios');
const readline = require('readline');

const API_BASE = 'http://localhost:5001/api/auth';
const testPhone = '+918305234864';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function testOTPFlow() {
  try {
    console.log('🧪 Testing Complete OTP Flow');
    console.log('='.repeat(50));
    
    // Step 1: Send OTP
    console.log('\n📱 Step 1: Sending OTP...');
    const sendResponse = await axios.post(`${API_BASE}/send-otp`, {
      phone: testPhone
    });
    
    console.log('✅ Send OTP Response:', sendResponse.data);
    
    // Get OTP from user input since WhatsApp is working
    console.log('\n📱 Check your WhatsApp for the OTP message!');
    const otp = await askQuestion('🔐 Enter the OTP you received: ');
    
    console.log('🔐 Using OTP:', otp);
    
    // Step 2: Verify OTP
    console.log('\n🔐 Step 2: Verifying OTP...');
    const verifyResponse = await axios.post(`${API_BASE}/verify-otp`, {
      phone: testPhone,
      otp: otp.trim()
    });
    
    console.log('✅ Verify OTP Response:', verifyResponse.data);
    
    if (verifyResponse.data.success) {
      // Step 3: Complete Registration
      console.log('\n👤 Step 3: Completing Registration...');
      const registerResponse = await axios.post(`${API_BASE}/register-user`, {
        name: 'Test User',
        phone: testPhone,
        password: 'password123'
      });
      
      console.log('✅ Registration Response:', registerResponse.data);
      
      console.log('\n🎉 Complete OTP Flow Test Successful!');
      console.log('✅ WhatsApp OTP integration is working perfectly!');
    } else {
      console.log('❌ OTP verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  } finally {
    rl.close();
  }
}

// Run test
testOTPFlow();
