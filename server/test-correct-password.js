const axios = require('axios');

const testCorrectPassword = async () => {
  try {
    console.log('🧪 Testing login with correct password...');
    
    const loginData = {
      phone: '+919303228082',
      password: 'Sandesh29' // Correct password with capital S
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

testCorrectPassword(); 