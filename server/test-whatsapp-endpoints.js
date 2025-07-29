require('dotenv').config();
const axios = require('axios');

const msg91ApiKey = process.env.MSG91_API_KEY;
const testPhoneNumber = '919876543210'; // Replace with your actual number

console.log('Testing Different MSG91 WhatsApp Endpoints...');
console.log('API Key:', msg91ApiKey ? msg91ApiKey.substring(0, 10) + '...' : 'Missing');

const otp = Math.floor(100000 + Math.random() * 900000).toString();
console.log('🔐 Generated OTP:', otp);

// Test 1: Try v5/whatsapp/send endpoint
async function testWhatsAppV5() {
  try {
    console.log('\n📱 Test 1: WhatsApp v5/whatsapp/send');
    
    const url = 'https://control.msg91.com/api/v5/whatsapp/send';
    const payload = {
      authkey: msg91ApiKey,
      mobiles: testPhoneNumber,
      message: `Your verification code is: ${otp}. Do not share this code with anyone.`,
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
    
    console.log('✅ Response:', response.data);
    return true;
    
  } catch (error) {
    console.error('❌ Test 1 Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 2: Try different WhatsApp endpoint
async function testWhatsAppAlternate() {
  try {
    console.log('\n📱 Test 2: WhatsApp alternate endpoint');
    
    const url = 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/';
    const payload = {
      authkey: msg91ApiKey,
      body: {
        type: 'text',
        text: `Your verification code is: ${otp}. Do not share this code with anyone.`
      },
      globalParams: [],
      contacts: [
        {
          mobiles: testPhoneNumber
        }
      ]
    };
    
    console.log('📤 Sending to:', url);
    console.log('📋 Payload:', { ...payload, authkey: '[HIDDEN]' });
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': msg91ApiKey
      }
    });
    
    console.log('✅ Response:', response.data);
    return true;
    
  } catch (error) {
    console.error('❌ Test 2 Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 3: Try form-data format
async function testWhatsAppFormData() {
  try {
    console.log('\n📱 Test 3: WhatsApp with form-data');
    
    const url = 'https://control.msg91.com/api/v5/whatsapp/send';
    
    // Try with URLSearchParams (form-data)
    const params = new URLSearchParams();
    params.append('authkey', msg91ApiKey);
    params.append('mobiles', testPhoneNumber);
    params.append('message', `Your verification code is: ${otp}. Do not share this code with anyone.`);
    params.append('sender', 'MSG91');
    
    console.log('📤 Sending to:', url);
    console.log('📋 Form Data - Mobile:', testPhoneNumber);
    
    const response = await axios.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log('✅ Response:', response.data);
    return true;
    
  } catch (error) {
    console.error('❌ Test 3 Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 4: Try with different phone format
async function testWhatsAppPhoneFormat() {
  try {
    console.log('\n📱 Test 4: WhatsApp with +91 format');
    
    const url = 'https://control.msg91.com/api/v5/whatsapp/send';
    const payload = {
      authkey: msg91ApiKey,
      mobiles: `+${testPhoneNumber}`, // Try with + prefix
      message: `Your verification code is: ${otp}. Do not share this code with anyone.`,
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
    
    console.log('✅ Response:', response.data);
    return true;
    
  } catch (error) {
    console.error('❌ Test 4 Failed:', error.response?.data || error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting WhatsApp API Tests...\n');
  
  const results = {
    test1: await testWhatsAppV5(),
    test2: await testWhatsAppAlternate(),
    test3: await testWhatsAppFormData(),
    test4: await testWhatsAppPhoneFormat()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('Test 1 (JSON):', results.test1 ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Test 2 (Alternate):', results.test2 ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Test 3 (Form Data):', results.test3 ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Test 4 (+91 Format):', results.test4 ? '✅ SUCCESS' : '❌ FAILED');
  
  if (Object.values(results).some(r => r)) {
    console.log('\n🎉 At least one test succeeded! Check your WhatsApp for the OTP.');
  } else {
    console.log('\n💡 All tests failed. Please contact MSG91 support to verify WhatsApp API status.');
  }
}

runAllTests();
