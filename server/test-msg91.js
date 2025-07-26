require('dotenv').config();
const axios = require('axios');

const msg91ApiKey = process.env.MSG91_API_KEY;
const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;
const msg91SenderId = process.env.MSG91_SENDER_ID;

console.log('Testing MSG91 Configuration...');
console.log('API Key:', msg91ApiKey ? msg91ApiKey.substring(0, 10) + '...' : 'Missing');
console.log('Template ID:', msg91TemplateId || 'Missing');
console.log('Sender ID:', msg91SenderId || 'Missing');

if (!msg91ApiKey || !msg91TemplateId) {
  console.error('❌ Missing MSG91 credentials in environment variables');
  console.log('\n📋 To fix this:');
  console.log('1. Go to https://control.msg91.com/');
  console.log('2. Get your API Key from Settings → API Keys');
  console.log('3. Create an OTP template and get the Template ID');
  console.log('4. Update your .env file with real values');
  process.exit(1);
}

// Test phone number (replace with your number)
const testPhoneNumber = '9203240991'; // Your number without +91

async function testSMS() {
  try {
    console.log('\n🧪 Testing SMS to:', `+91${testPhoneNumber}`);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔐 Generated OTP:', otp);
    
    const url = 'https://control.msg91.com/api/v5/otp';
    const payload = {
      template_id: msg91TemplateId,
      mobile: testPhoneNumber, // No +91 prefix for MSG91
      authkey: msg91ApiKey,
      otp: otp
    };
    
    console.log('📤 Sending request to MSG91...');
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': msg91ApiKey
      }
    });
    
    console.log('✅ MSG91 Response:', response.data);
    console.log('\n📱 Check your phone for the SMS!');
    
  } catch (error) {
    console.error('❌ MSG91 Test Failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 SOLUTION: Invalid API Key');
      console.log('   - Check your MSG91_API_KEY in .env file');
      console.log('   - Get correct API key from MSG91 dashboard');
    }
    
    if (error.response?.status === 400) {
      console.log('\n💡 SOLUTION: Check Template ID or request format');
      console.log('   - Verify MSG91_TEMPLATE_ID in .env file');
      console.log('   - Make sure template is approved in MSG91');
    }
  }
}

// Uncomment the line below to test (after setting up credentials)
// testSMS();

console.log('\n🚀 To test SMS:');
console.log('1. Update .env with your real MSG91 credentials');
console.log('2. Uncomment the last line in this file');
console.log('3. Run: node test-msg91.js');
