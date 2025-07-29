require('dotenv').config();
const axios = require('axios');

const msg91ApiKey = process.env.MSG91_API_KEY;
const testPhoneNumber = '919203240991'; // Replace with your actual number for testing

console.log('🧪 Testing MSG91 WhatsApp API (After IP Whitelisting)');
console.log('='.repeat(60));
console.log('API Key:', msg91ApiKey ? msg91ApiKey.substring(0, 10) + '...' : 'Missing');
console.log('Test Phone:', testPhoneNumber);

if (!msg91ApiKey) {
  console.error('❌ Missing MSG91_API_KEY in environment variables');
  process.exit(1);
}

const otp = Math.floor(100000 + Math.random() * 900000).toString();
console.log('🔐 Generated OTP:', otp);

// Test with increased timeout and better error handling
async function testWhatsAppBulkAPI() {
  try {
    console.log('\n📱 Testing WhatsApp Bulk API (Method that had timeout)');
    
    const url = 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/';
    const payload = {
      "integrated_number": "919203240991",
      "content_type": "text",
      "payload": {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": testPhoneNumber,
        "type": "text",
        "text": {
          "preview_url": false,
          "body": `Your verification code is: ${otp}. Do not share this code with anyone.`
        }
      }
    };
    
    console.log('📤 Sending request...');
    console.log('⏱️ Using 30 second timeout...');
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': msg91ApiKey
      },
      timeout: 30000 // Increased timeout to 30 seconds
    });
    
    console.log('✅ WhatsApp Bulk API SUCCESS:', response.data);
    console.log('📱 Check your WhatsApp for the OTP message!');
    return true;
    
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timed out - MSG91 servers might be slow');
      console.log('💡 This could mean:');
      console.log('   - WhatsApp API is processing but taking time');
      console.log('   - Server load issues on MSG91 side');
      console.log('   - Check WhatsApp anyway - message might still arrive');
    } else {
      console.error('❌ WhatsApp Bulk API Failed:', error.response?.data || error.message);
    }
    return false;
  }
}

// Test the simple OTP endpoint with different payload structure
async function testSimpleOTPDifferentPayload() {
  try {
    console.log('\n📱 Testing Simple WhatsApp OTP (Different payload structure)');
    
    const url = 'https://control.msg91.com/api/v5/otp/whatsapp';
    
    // Try with minimal payload
    const payload = {
      "authkey": msg91ApiKey,
      "mobile": testPhoneNumber
    };
    
    console.log('📤 URL:', url);
    console.log('📋 Minimal Payload:', JSON.stringify({ ...payload, authkey: '[HIDDEN]' }));
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Simple OTP SUCCESS:', response.data);
    console.log('📱 Check your WhatsApp for the OTP message!');
    return true;
    
  } catch (error) {
    console.error('❌ Simple OTP Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test with form-data instead of JSON
async function testFormData() {
  try {
    console.log('\n📱 Testing with Form Data (instead of JSON)');
    
    const url = 'https://control.msg91.com/api/v5/otp/whatsapp';
    
    // Create form data
    const FormData = require('form-data');
    const form = new FormData();
    form.append('authkey', msg91ApiKey);
    form.append('mobile', testPhoneNumber);
    form.append('message', `Your verification code is: ${otp}. Do not share this code with anyone.`);
    
    console.log('📤 URL:', url);
    console.log('📋 Form Data - Mobile:', testPhoneNumber);
    
    const response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders()
      },
      timeout: 30000
    });
    
    console.log('✅ Form Data SUCCESS:', response.data);
    console.log('📱 Check your WhatsApp for the OTP message!');
    return true;
    
  } catch (error) {
    console.error('❌ Form Data Failed:', error.response?.data || error.message);
    return false;
  }
}

async function runPostWhitelistTests() {
  console.log('\n🚀 Running Post-Whitelist Tests...\n');
  
  const results = {
    bulkAPI: await testWhatsAppBulkAPI(),
    simpleOTP: await testSimpleOTPDifferentPayload(),
    formData: await testFormData()
  };
  
  console.log('\n📊 Post-Whitelist Test Results:');
  console.log('='.repeat(50));
  console.log('WhatsApp Bulk API:', results.bulkAPI ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Simple OTP API:', results.simpleOTP ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Form Data Method:', results.formData ? '✅ SUCCESS' : '❌ FAILED');
  
  const workingMethods = Object.entries(results).filter(([key, value]) => value);
  
  if (workingMethods.length > 0) {
    console.log('\n🎉 SUCCESS! Working methods found:');
    workingMethods.forEach(([method, _]) => {
      console.log(`✅ ${method}`);
    });
    console.log('\n📱 Check your WhatsApp for the OTP message!');
    console.log('\n✨ IP whitelisting worked! WhatsApp API is now accessible.');
  } else {
    console.log('\n❌ All post-whitelist tests failed.');
    console.log('\n🔧 Analysis:');
    console.log('- IP whitelisting may have helped (timeouts vs 401 errors)');
    console.log('- But authentication issues might still persist');
    console.log('- Contact MSG91 support with updated error information');
  }
}

runPostWhitelistTests().catch(console.error);
