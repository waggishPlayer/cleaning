require('dotenv').config();
const axios = require('axios');

const msg91ApiKey = process.env.MSG91_API_KEY;
const testPhoneNumber = '919876543210'; // Replace with your actual number

console.log('Testing Final WhatsApp OTP Implementation...');
console.log('API Key:', msg91ApiKey ? msg91ApiKey.substring(0, 10) + '...' : 'Missing');

// Test the exact implementation from backend
async function testFinalWhatsAppOTP() {
  try {
    console.log('\n🧪 Testing Final WhatsApp OTP Implementation');
    
    const phone = '+919876543210'; // Simulate frontend input
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('📱 Input phone:', phone);
    console.log('🔐 Generated OTP:', otp);
    
    // Replicate backend phone cleaning logic
    let cleanPhone = phone.replace(/[^0-9]/g, ''); // Remove all non-digits
    
    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      cleanPhone = cleanPhone;
    } else if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    } else if (cleanPhone.startsWith('91') && cleanPhone.length > 12) {
      cleanPhone = cleanPhone.substring(0, 12);
    }
    
    console.log('🔧 Cleaned phone:', cleanPhone);
    
    const url = 'https://control.msg91.com/api/v5/otp';
    const payload = {
      authkey: msg91ApiKey,
      mobile: cleanPhone,
      otp: otp,
      channel: 'whatsapp',
      sender: 'MSG91'
    };
    
    console.log('📤 Sending to:', url);
    console.log('📋 Payload:', { ...payload, authkey: '[HIDDEN]' });
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': msg91ApiKey
      }
    });
    
    console.log('✅ Final WhatsApp OTP Response:', response.data);
    console.log('\n🎉 SUCCESS! Check your WhatsApp for the OTP!');
    console.log('📱 The OTP should arrive on WhatsApp for number:', cleanPhone);
    
    return true;
    
  } catch (error) {
    console.error('❌ Final WhatsApp OTP Failed:', error.response?.data || error.message);
    return false;
  }
}

testFinalWhatsAppOTP();
