const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

async function testWhatsAppDirectly() {
  console.log('🧪 Testing MSG91 WhatsApp OTP Directly');
  console.log('='.repeat(50));
  
  const apiKey = process.env.MSG91_API_KEY;
  console.log('API Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT FOUND');
  
  if (!apiKey) {
    console.error('❌ MSG91_API_KEY not found in environment');
    return;
  }
  
  // Replace with your actual phone number for testing
  const testPhone = '918765432109'; // Remove + and use format: 918765432109
  const testOTP = '123456';
  
  console.log('📱 Testing phone:', testPhone);
  console.log('🔐 Test OTP:', testOTP);
  
  try {
    console.log('\n🧪 Testing WhatsApp OTP API with route 4...');
    
    const payload = {
      authkey: apiKey,
      mobile: testPhone,
      route: 4, // As specified by MSG91 agent
      sender: '919203240991' // Your WhatsApp Business number
    };
    
    console.log('📋 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(
      'https://control.msg91.com/api/v5/otp/whatsapp',
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );
    
    console.log('✅ SUCCESS! Response:', response.data);
    console.log('🎉 WhatsApp OTP should be sent to your phone!');
    
  } catch (error) {
    console.error('❌ ERROR:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Troubleshooting 401 Unauthorized:');
      console.log('1. Check if your MSG91 API key is correct');
      console.log('2. Verify WhatsApp API is enabled in your MSG91 account');
      console.log('3. Contact MSG91 support: +91 8818888733');
    }
    
    if (error.response?.data?.code === '306') {
      console.log('\n💡 Error 306: Route unavailable');
      console.log('Contact MSG91 to enable WhatsApp route 4');
    }
  }
}

// Test alternative endpoint
async function testWhatsAppAlternative() {
  console.log('\n🔄 Testing alternative WhatsApp endpoint...');
  
  const apiKey = process.env.MSG91_API_KEY;
  const testPhone = '918765432109';
  const testOTP = '123456';
  
  try {
    const payload = {
      authkey: apiKey,
      route: 4,
      body: {
        type: 'text',
        text: `Your verification code is: ${testOTP}. Do not share this code with anyone.`
      },
      globalParams: [],
      contacts: [{
        mobiles: testPhone
      }]
    };
    
    const response = await axios.post(
      'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );
    
    console.log('✅ Alternative endpoint SUCCESS:', response.data);
    
  } catch (error) {
    console.error('❌ Alternative endpoint failed:', error.response?.data || error.message);
  }
}

// Run tests
(async () => {
  await testWhatsAppDirectly();
  await testWhatsAppAlternative();
})();
