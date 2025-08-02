const axios = require('axios');

const testFrontendFormat = async () => {
  try {
    console.log('🧪 Testing login with frontend phone format...');
    
    // Test with the exact format the frontend sends
    const loginData = {
      phone: '+919303228082', // This is what the frontend sends
      password: 'Sandesh29'
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
      },
      hasToken: !!response.data.data?.token
    });
    
    console.log('\n🎉 Login works with frontend format!');
  } catch (error) {
    console.log('❌ Login failed:', error.response?.status, error.response?.statusText);
    console.log('📋 Error response:', error.response?.data);
    console.log('🔍 Full error:', error.message);
    
    // Also test without the +91 prefix
    console.log('\n🧪 Testing without +91 prefix...');
    try {
      const loginDataWithoutPrefix = {
        phone: '9303228082', // Without +91
        password: 'Sandesh29'
      };
      
      const response2 = await axios.post('http://localhost:5001/api/auth/login-password', loginDataWithoutPrefix, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Login successful without prefix!');
    } catch (error2) {
      console.log('❌ Login also failed without prefix:', error2.response?.data);
    }
  }
};

testFrontendFormat(); 