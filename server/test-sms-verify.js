require('dotenv').config();
const axios = require('axios');

const msg91ApiKey = process.env.MSG91_API_KEY;
const testPhoneNumber = '9203240991'; // Your number without +91

console.log('🧪 Testing MSG91 Regular SMS API (to verify authkey works)');
console.log('='.repeat(60));
console.log('API Key:', msg91ApiKey ? msg91ApiKey.substring(0, 10) + '...' : 'Missing');
console.log('Test Phone:', testPhoneNumber);

if (!msg91ApiKey) {
  console.error('❌ Missing MSG91_API_KEY in environment variables');
  process.exit(1);
}

const otp = Math.floor(100000 + Math.random() * 900000).toString();
console.log('🔐 Generated OTP:', otp);

async function testRegularSMS() {
  try {
    console.log('\n📨 Testing Regular SMS API');
    
    const url = 'https://api.msg91.com/api/v2/sendsms';
    const payload = {
      sender: 'CAARVO',
      route: '4',
      country: '91',
      sms: [
        {
          message: `Your OTP is: ${otp}. Do not share this code.`,
          to: [testPhoneNumber]
        }
      ]
    };
    
    console.log('📤 URL:', url);
    console.log('📋 Headers: authkey in header');
    console.log('📋 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': msg91ApiKey
      },
      timeout: 15000
    });
    
    console.log('✅ SMS API SUCCESS:', response.data);
    console.log('\n📱 Check your phone for the SMS message!');
    console.log('\n✅ This proves your API key is valid!');
    console.log('❌ The issue is specifically with WhatsApp API access.');
    
    return true;
    
  } catch (error) {
    console.error('❌ SMS API Failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n❌ Your API key is invalid or expired');
    } else {
      console.log('\n⚠️ Other SMS API error - but this might still indicate API key issues');
    }
    
    return false;
  }
}

// Test OTP-specific SMS endpoint
async function testSMSOTP() {
  try {
    console.log('\n📨 Testing SMS OTP API');
    
    const url = 'https://control.msg91.com/api/v5/otp';
    const payload = {
      authkey: msg91ApiKey,
      mobile: testPhoneNumber,
      otp: otp,
      sender: 'CAARVO'
    };
    
    console.log('📤 URL:', url);
    console.log('📋 Payload:', JSON.stringify({ ...payload, authkey: '[HIDDEN]' }, null, 2));
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ SMS OTP API SUCCESS:', response.data);
    return true;
    
  } catch (error) {
    console.error('❌ SMS OTP API Failed:', error.response?.data || error.message);
    return false;
  }
}

async function runSMSTests() {
  console.log('\n🚀 Testing SMS APIs to verify authkey...\n');
  
  const results = {
    regularSMS: await testRegularSMS(),
    smsOTP: await testSMSOTP()
  };
  
  console.log('\n📊 SMS Test Results:');
  console.log('='.repeat(40));
  console.log('Regular SMS:', results.regularSMS ? '✅ SUCCESS' : '❌ FAILED');
  console.log('SMS OTP:', results.smsOTP ? '✅ SUCCESS' : '❌ FAILED');
  
  if (results.regularSMS || results.smsOTP) {
    console.log('\n✅ CONCLUSION: Your API key is VALID!');
    console.log('❌ WhatsApp API is NOT enabled for your account');
    console.log('\n📞 Contact MSG91 support again with this information:');
    console.log('   - API Key works for SMS ✅');
    console.log('   - WhatsApp API returns error 401/418 ❌');
    console.log('   - Specific error: "Unauthorized" with apiError: 418');
    console.log('   - Request WhatsApp API activation for your account');
  } else {
    console.log('\n❌ Your API key appears to have issues');
    console.log('   - Check if API key is correct in your .env file');
    console.log('   - Verify API key is active in MSG91 dashboard');
  }
}

runSMSTests().catch(console.error);
