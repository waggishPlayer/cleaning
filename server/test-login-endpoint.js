const axios = require('axios');

const testLoginEndpoint = async () => {
  try {
    console.log('🧪 Testing login endpoint...');
    
    // Test with the actual credentials that were used during registration
    const loginData = {
      phone: '+919303228082',
      password: 'sandesh29' // This should be the password you used during registration
    };
    
    console.log('📤 Sending login request with data:', {
      phone: loginData.phone,
      password: '***' // Hide password in logs
    });
    
    const response = await axios.post('http://localhost:5001/api/auth/login-password', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful! Response:', {
      success: response.data.success,
      message: response.data.message,
      user: {
        name: response.data.data?.user?.name,
        role: response.data.data?.user?.role,
        phone: response.data.data?.user?.phone
      }
    });
  } catch (error) {
    console.log('❌ Login failed:', error.response?.status, error.response?.statusText);
    console.log('📋 Error response:', error.response?.data);
    console.log('🔍 Full error:', error.message);
  }
};

testLoginEndpoint(); 