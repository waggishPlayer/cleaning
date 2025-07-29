require('dotenv').config();
const axios = require('axios');

const msg91ApiKey = process.env.MSG91_API_KEY;
const msg91WhatsappTemplateId = process.env.MSG91_WHATSAPP_TEMPLATE_ID;
const msg91WhatsappNumber = process.env.MSG91_WHATSAPP_NUMBER;

console.log('Testing MSG91 WhatsApp Configuration...');
console.log('API Key:', msg91ApiKey ? msg91ApiKey.substring(0, 10) + '...' : 'Missing');
console.log('WhatsApp Template ID:', msg91WhatsappTemplateId || 'Missing');
console.log('WhatsApp Number:', msg91WhatsappNumber || 'Missing');

if (!msg91ApiKey) {
  console.error('❌ Missing MSG91 credentials in environment variables');
  console.log('\n📋 To fix this:');
  console.log('1. Go to https://control.msg91.com/');
  console.log('2. Get your API Key from Settings → API Keys');
  console.log('3. Set up WhatsApp integration and get template ID');
  console.log('4. Update your .env file with:');
  console.log('   MSG91_API_KEY=your_api_key');
  console.log('   MSG91_WHATSAPP_TEMPLATE_ID=your_template_id (optional)');
  console.log('   MSG91_WHATSAPP_NUMBER=your_whatsapp_number (optional)');
  process.exit(1);
}

// Test phone number (replace with your number)
const testPhoneNumber = '919876543210'; // Must start with 91, no + symbol
// Example: If your number is +91 9876543210, use 919876543210

async function testWhatsAppOTP() {
  try {
    console.log('\n🧪 Testing WhatsApp OTP to:', testPhoneNumber);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔐 Generated OTP:', otp);
    
    const url = 'https://control.msg91.com/api/v5/whatsapp/send';
    const payload = {
      authkey: msg91ApiKey,
      mobiles: testPhoneNumber, // Must be format: 919876543210 (no + symbol)
      message: `Your verification code is: ${otp}. Do not share this code with anyone.`,
      sender: msg91WhatsappNumber || 'MSG91',
      ...(msg91WhatsappTemplateId && { template_id: msg91WhatsappTemplateId })
    };
    
    console.log('📤 Sending request to MSG91 WhatsApp API...');
    console.log('📋 Payload:', { ...payload, authkey: '[HIDDEN]' });
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': msg91ApiKey
      }
    });
    
    console.log('✅ MSG91 WhatsApp Response:', response.data);
    console.log('\n📱 Check your WhatsApp for the OTP message!');
    
  } catch (error) {
    console.error('❌ MSG91 WhatsApp Test Failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 SOLUTION: Invalid API Key');
      console.log('   - Check your MSG91_API_KEY in .env file');
      console.log('   - Get correct API key from MSG91 dashboard');
    }
    
    if (error.response?.status === 400) {
      console.log('\n💡 SOLUTION: Check WhatsApp setup or request format');
      console.log('   - Verify WhatsApp integration is enabled in MSG91');
      console.log('   - Check if template ID is valid (if using)');
      console.log('   - Ensure phone number format is correct');
    }
    
    if (error.response?.status === 403) {
      console.log('\n💡 SOLUTION: WhatsApp feature not enabled');
      console.log('   - Contact MSG91 support to enable WhatsApp API');
      console.log('   - Check your account permissions');
    }
  }
}

// Uncomment the line below to test (after setting up credentials)
testWhatsAppOTP();

console.log('\n🚀 To test WhatsApp OTP:');
console.log('1. Update .env with your real MSG91 credentials');
console.log('2. Enable WhatsApp API in your MSG91 account');
console.log('3. Replace testPhoneNumber with your actual number');
console.log('4. Uncomment the last line in this file');
console.log('5. Run: node test-msg91-whatsapp.js');
