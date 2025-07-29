require('dotenv').config();
const axios = require('axios');

const msg91ApiKey = process.env.MSG91_API_KEY;
const msg91WhatsappNumber = process.env.MSG91_WHATSAPP_NUMBER || '919203240991';
const testPhoneNumber = '919876543210'; // Replace with your actual number

console.log('🧪 Testing MSG91 WhatsApp Template Bulk API (as per agent guidance)');
console.log('='.repeat(70));
console.log('API Key:', msg91ApiKey ? msg91ApiKey.substring(0, 10) + '...' : 'Missing');
console.log('WhatsApp Business Number:', msg91WhatsappNumber);
console.log('Test Phone:', testPhoneNumber);

if (!msg91ApiKey) {
  console.error('❌ Missing MSG91_API_KEY in environment variables');
  process.exit(1);
}

const otp = Math.floor(100000 + Math.random() * 900000).toString();
console.log('🔐 Generated OTP:', otp);

// Test 1: WhatsApp Template Bulk API (Primary method)
async function testWhatsAppTemplateBulk() {
  try {
    console.log('\n📱 Test 1: WhatsApp Template Bulk API (Primary)');
    
    const url = 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/';
    const payload = {
      "integrated_number": msg91WhatsappNumber,
      "content_type": "template",
      "payload": {
        "messaging_product": "whatsapp",
        "type": "template",
        "template": {
          "name": "otp_template", // You may need to create this template in MSG91
          "language": {
            "code": "en"
          },
          "components": [
            {
              "type": "body",
              "parameters": [
                {
                  "type": "text",
                  "text": otp
                }
              ]
            }
          ]
        },
        "to": testPhoneNumber
      }
    };
    
    console.log('📤 Sending to:', url);
    console.log('📋 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': msg91ApiKey
      },
      timeout: 15000
    });
    
    console.log('✅ Template Bulk API Response:', response.data);
    return true;
    
  } catch (error) {
    console.error('❌ Template Bulk API Failed:', error.response?.data || error.message);
    
    if (error.response?.status === 400 && error.response?.data?.error?.includes('template')) {
      console.log('\n💡 Template Error Solution:');
      console.log('1. Go to MSG91 Dashboard → WhatsApp → Templates');
      console.log('2. Create a new template named "otp_template" with OTP content');
      console.log('3. Wait for Meta/WhatsApp approval');
      console.log('4. Or use the text message method below');
    }
    
    return false;
  }
}

// Test 2: WhatsApp Text Message Bulk API (Fallback)
async function testWhatsAppTextBulk() {
  try {
    console.log('\n📱 Test 2: WhatsApp Text Message Bulk API (Fallback)');
    
    const url = 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/';
    const payload = {
      "integrated_number": msg91WhatsappNumber,
      "content_type": "text",
      "payload": {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": testPhoneNumber,
        "type": "text",
        "text": {
          "preview_url": false,
          "body": `Your verification code is: ${otp}. Do not share this code with anyone. Valid for 5 minutes.`
        }
      }
    };
    
    console.log('📤 Sending to:', url);
    console.log('📋 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': msg91ApiKey
      },
      timeout: 15000
    });
    
    console.log('✅ Text Bulk API Response:', response.data);
    return true;
    
  } catch (error) {
    console.error('❌ Text Bulk API Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 3: Legacy WhatsApp OTP API (Third option)
async function testWhatsAppOTPLegacy() {
  try {
    console.log('\n📱 Test 3: Legacy WhatsApp OTP API');
    
    const url = 'https://control.msg91.com/api/v5/otp/whatsapp';
    const payload = {
      authkey: msg91ApiKey,
      mobile: testPhoneNumber,
      sender: msg91WhatsappNumber,
      message: `Your verification code is: ${otp}. Do not share this code with anyone.`
    };
    
    console.log('📤 Sending to:', url);
    console.log('📋 Payload:', { ...payload, authkey: '[HIDDEN]' });
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Legacy OTP API Response:', response.data);
    return true;
    
  } catch (error) {
    console.error('❌ Legacy OTP API Failed:', error.response?.data || error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Starting WhatsApp API Tests...\n');
  
  const results = {
    templateBulk: await testWhatsAppTemplateBulk(),
    textBulk: await testWhatsAppTextBulk(),
    legacyOtp: await testWhatsAppOTPLegacy()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));
  console.log('Template Bulk API:', results.templateBulk ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Text Bulk API:', results.textBulk ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Legacy OTP API:', results.legacyOtp ? '✅ SUCCESS' : '❌ FAILED');
  
  if (Object.values(results).some(r => r)) {
    console.log('\n🎉 SUCCESS! At least one WhatsApp method is working!');
    console.log('📱 Check your WhatsApp for the OTP message.');
    
    if (results.templateBulk) {
      console.log('\n✨ Template Bulk API is working - this is the preferred method!');
    } else if (results.textBulk) {
      console.log('\n✨ Text Bulk API is working - good fallback option!');
    } else if (results.legacyOtp) {
      console.log('\n✨ Legacy OTP API is working - consider upgrading to bulk API.');
    }
  } else {
    console.log('\n❌ All tests failed.');
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Verify your MSG91 API key is correct');
    console.log('2. Ensure WhatsApp API is enabled in your MSG91 account');
    console.log('3. Check if your WhatsApp Business number is verified');
    console.log('4. Contact MSG91 support: +91 8818888733');
    console.log('5. Share this test output with MSG91 support for debugging');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. If template method works, create proper OTP templates in MSG91');
  console.log('2. Update your backend to use the working endpoint');  
  console.log('3. Test with real phone numbers in production');
}

// Run the tests
runAllTests().catch(console.error);
