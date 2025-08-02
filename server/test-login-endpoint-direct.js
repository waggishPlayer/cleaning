const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

async function testLoginEndpoint() {
  try {
    console.log('🔍 Testing admin login endpoint directly');
    
    const loginData = {
      phone: '+919303228082',
      password: 'testpassword123'
    };
    
    console.log('📤 Sending login request with:', {
      phone: loginData.phone,
      passwordLength: loginData.password.length
    });
    
    // Make the request to the login endpoint
    const response = await axios.post('http://localhost:5001/api/auth/login-password', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('📋 Response data:', {
      success: response.data.success,
      message: response.data.message,
      user: response.data.data?.user ? {
        name: response.data.data.user.name,
        role: response.data.data.user.role,
        phone: response.data.data.user.phone
      } : null,
      hasToken: !!response.data.data?.token
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Login failed:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    
    // Log more details about the error
    if (error.response) {
      console.log('📋 Error response details:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      });
    } else if (error.request) {
      console.log('📋 Error request details:', {
        method: error.request.method,
        path: error.request.path,
        host: error.request.host
      });
    }
    
    throw error;
  }
}

// Run the test
testLoginEndpoint()
  .then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  })
  .catch(() => {
    console.log('❌ Test failed');
    process.exit(1);
  });