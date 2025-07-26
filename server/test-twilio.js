require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

console.log('Testing Twilio Configuration...');
console.log('Account SID:', accountSid ? accountSid.substring(0, 10) + '...' : 'Missing');
console.log('Auth Token:', authToken ? 'Set (length: ' + authToken.length + ')' : 'Missing');
console.log('Phone Number:', twilioFrom || 'Missing');

if (!accountSid || !authToken || !twilioFrom) {
  console.error('❌ Missing Twilio credentials in environment variables');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

// Test sending SMS to your Indian number (after verifying it)
const testPhoneNumber = '+919203240991'; // Your Indian number

async function testSMS() {
  try {
    console.log('\n🧪 Testing SMS to:', testPhoneNumber);
    console.log('📤 From Twilio number:', twilioFrom);
    
    const message = await client.messages.create({
      body: 'Test SMS from your car washing app! Twilio is working correctly.',
      from: twilioFrom,
      to: testPhoneNumber
    });
    
    console.log('✅ SMS sent successfully!');
    console.log('Message SID:', message.sid);
    console.log('Status:', message.status);
    console.log('\n📱 Check your phone for the SMS!');
  } catch (error) {
    console.error('❌ Failed to send SMS:', error.message);
    if (error.code === 21211) {
      console.log('\n💡 SOLUTION: You need to verify +919203240991 in Twilio Console:');
      console.log('   1. Go to https://console.twilio.com/us1/develop/phone-numbers/verified-caller-ids');
      console.log('   2. Click "Add a new Caller ID"');
      console.log('   3. Enter +919203240991');
      console.log('   4. Verify with the code Twilio sends you');
    }
  }
}

// Uncomment the line below to test (after setting up credentials)
// testSMS();
