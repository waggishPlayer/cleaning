const axios = require('axios');

const testAdminRegistrationEndpoint = async () => {
  try {
    console.log('🧪 Testing admin registration endpoint...');
    
    const testData = {
      name: 'Test Admin User',
      phone: '+919303228082',
      password: 'testpassword123'
    };
    
    console.log('📤 Sending request with data:', testData);
    
    const response = await axios.post('http://localhost:5001/api/admin/register-admin', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success! Response:', response.data);
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.statusText);
    console.log('📋 Error response:', error.response?.data);
    console.log('🔍 Full error:', error.message);
  }
};

testAdminRegistrationEndpoint(); 