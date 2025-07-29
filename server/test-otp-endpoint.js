require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const msg91ApiKey = process.env.MSG91_API_KEY;

app.post('/test-otp', async (req, res) => {
  try {
    console.log('🧪 Testing MSG91 OTP endpoint...');
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone required' });
    }

    // Clean phone number
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    } else if (!cleanPhone.startsWith('91')) {
      cleanPhone = '91' + cleanPhone.substring(cleanPhone.length - 10);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('📱 Sending to:', cleanPhone);
    console.log('🔐 OTP:', otp);

    const url = 'https://api.msg91.com/api/v2/sendsms';
    const payload = {
      sender: 'SENDERID',
      route: '4',
      country: '91',
      sms: [
        {
          message: `Your OTP is: ${otp}. Do not share this code.`,
          to: [cleanPhone]
        }
      ]
    };

    console.log('⏰ Sending request at:', new Date().toISOString());
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': msg91ApiKey
      },
      timeout: 10000
    });

    console.log('✅ Response received at:', new Date().toISOString());
    console.log('📋 MSG91 Response:', response.data);

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      data: response.data,
      otp: otp // For testing only
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('⏰ Error occurred at:', new Date().toISOString());
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        success: false, 
        message: 'Request timeout - MSG91 API is taking too long',
        error: 'timeout'
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP',
      error: error.response?.data || error.message
    });
  }
});

const PORT = 5555;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📱 Test with: curl -X POST http://localhost:${PORT}/test-otp -H "Content-Type: application/json" -d '{"phone": "+919876543210"}'`);
});
