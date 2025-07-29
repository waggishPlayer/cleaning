require('dotenv').config();
const axios = require('axios');

const msg91ApiKey = process.env.MSG91_API_KEY;
const phone = '918305234864';
const otp = '555666';

console.log('🧪 Debug WhatsApp API Integration');
console.log('API Key:', msg91ApiKey ? msg91ApiKey.substring(0, 10) + '...' : 'Missing');
console.log('Phone:', phone);
console.log('OTP:', otp);

async function testWhatsAppAPI() {
  try {
    const payload = {
      "integrated_number": "919203240991",
      "content_type": "template",
      "payload": {
        "messaging_product": "whatsapp",
        "type": "template",
        "template": {
          "name": "otp",
          "language": {
            "code": "en",
            "policy": "deterministic"
          },
          "namespace": "b870bc3c_9fa6_4bf8_b4b2_82078187366a",
          "to_and_components": [
            {
              "to": [phone],
              "components": {
                "body_1": {
                  "type": "text",
                  "value": otp
                },
                "button_1": {
                  "subtype": "url",
                  "type": "text",
                  "value": otp
                }
              }
            }
          ]
        }
      }
    };

    console.log('\n📤 Sending payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'authkey': msg91ApiKey
        },
        timeout: 15000
      }
    );

    console.log('✅ SUCCESS:', response.data);
    console.log('📱 Check your WhatsApp for OTP:', otp);
    
  } catch (error) {
    console.error('❌ ERROR:', error.response?.data || error.message);
  }
}

testWhatsAppAPI();
