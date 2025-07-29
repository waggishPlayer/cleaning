require('dotenv').config();
const axios = require('axios');

const msg91ApiKey = process.env.MSG91_API_KEY;
const testPhoneNumber = '919203240991'; // Replace with your actual number for testing

console.log('🧪 Testing MSG91 WhatsApp API (Based on Support Guidance)');
console.log('='.repeat(60));
console.log('API Key:', msg91ApiKey ? msg91ApiKey.substring(0, 10) + '...' : 'Missing');
console.log('Test Phone:', testPhoneNumber);

if (!msg91ApiKey) {
  console.error('❌ Missing MSG91_API_KEY in environment variables');
  process.exit(1);
}

const otp = Math.floor(100000 + Math.random() * 900000).toString();
console.log('🔐 Generated OTP:', otp);

// Test different ways to send the authkey as suggested by support
async function testMethod1_HeaderAuth() {
  try {
    console.log('\n📱 Method 1: Authkey in Header');
    
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
    
    console.log('📤 URL:', url);
    console.log('📋 Headers: authkey in header');
    console.log('📋 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': msg91ApiKey  // authkey in header
      },
      timeout: 15000
    });
    
    console.log('✅ Method 1 SUCCESS:', response.data);
    return true;
    
  } catch (error) {
    console.error('❌ Method 1 Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testMethod2_BodyAuth() {
  try {
    console.log('\n📱 Method 2: Authkey in Body');
    
    const url = 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/';
    const payload = {
      "authkey": msg91ApiKey,  // authkey in body
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
    
    console.log('📤 URL:', url);
    console.log('📋 Headers: Content-Type only');
    console.log('📋 Payload:', JSON.stringify({ ...payload, authkey: '[HIDDEN]' }, null, 2));
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Method 2 SUCCESS:', response.data);
    return true;
    
  } catch (error) {
    console.error('❌ Method 2 Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testMethod3_QueryParam() {
  try {
    console.log('\n📱 Method 3: Authkey as Query Parameter');
    
    const url = `https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/?authkey=${msg91ApiKey}`;
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
    
    console.log('📤 URL:', url.replace(msg91ApiKey, '[HIDDEN]'));
    console.log('📋 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Method 3 SUCCESS:', response.data);
    return true;
    
  } catch (error) {
    console.error('❌ Method 3 Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test the simple OTP endpoint they might have shown you
async function testMethod4_SimpleOTP() {
  try {
    console.log('\n📱 Method 4: Simple WhatsApp OTP Endpoint');
    
    const url = 'https://control.msg91.com/api/v5/otp/whatsapp';
    const payload = {
      "authkey": msg91ApiKey,
      "mobile": testPhoneNumber,
      "message": `Your verification code is: ${otp}. Do not share this code with anyone.`
    };
    
    console.log('📤 URL:', url);
    console.log('📋 Payload:', JSON.stringify({ ...payload, authkey: '[HIDDEN]' }, null, 2));
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Method 4 SUCCESS:', response.data);
    return true;
    
  } catch (error) {
    console.error('❌ Method 4 Failed:', error.response?.data || error.message);
    return false;
  }
}

// Run all test methods
async function runAllMethods() {
  console.log('\n🚀 Testing All Authentication Methods...\n');
  
  const results = {
    method1: await testMethod1_HeaderAuth(),
    method2: await testMethod2_BodyAuth(), 
    method3: await testMethod3_QueryParam(),
    method4: await testMethod4_SimpleOTP()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));
  console.log('Method 1 (Header Auth):', results.method1 ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Method 2 (Body Auth):', results.method2 ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Method 3 (Query Param):', results.method3 ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Method 4 (Simple OTP):', results.method4 ? '✅ SUCCESS' : '❌ FAILED');
  
  const workingMethods = Object.entries(results).filter(([key, value]) => value);
  
  if (workingMethods.length > 0) {
    console.log('\n🎉 SUCCESS! Working methods found:');
    workingMethods.forEach(([method, _]) => {
      console.log(`✅ ${method}`);
    });
    console.log('\n📱 Check your WhatsApp for the OTP message!');
  } else {
    console.log('\n❌ All methods failed.');
    console.log('\n🔧 Debug Information for MSG91 Support:');
    console.log('1. API Key Format:', msg91ApiKey ? `${msg91ApiKey.length} characters, starts with: ${msg91ApiKey.substring(0, 4)}` : 'Missing');
    console.log('2. All requests return 401 Unauthorized with apiError: 418');
    console.log('3. Same authkey works for regular SMS');
    console.log('4. Contact MSG91 support with this exact error information');
  }
}

// Run the tests
runAllMethods().catch(console.error);
