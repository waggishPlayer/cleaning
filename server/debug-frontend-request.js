const axios = require('axios');

const debugFrontendRequest = async () => {
  try {
    console.log('🧪 Testing the exact frontend request...');
    
    // Test with the exact format the frontend sends
    const loginData = {
      phone: '+919303228082',
      password: 'Sandesh29'
    };
    
    console.log('📤 Sending request to /auth/login-password with data:', {
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
    
    // Let me also check what's in the database
    console.log('\n🔍 Checking database for admin user...');
    try {
      const mongoose = require('mongoose');
      const dotenv = require('dotenv');
      dotenv.config({ path: './config.env' });
      
      await mongoose.connect(process.env.MONGODB_URI);
      const User = require('./models/User');
      
      const adminUser = await User.findOne({ phone: '+919303228082' }).select('+password');
      if (adminUser) {
        console.log('✅ Admin user found in database:');
        console.log('   Name:', adminUser.name);
        console.log('   Phone:', adminUser.phone);
        console.log('   Role:', adminUser.role);
        console.log('   Has Password:', !!adminUser.password);
        console.log('   Password Hash:', adminUser.password);
        
        // Test password comparison
        const bcrypt = require('bcryptjs');
        const isMatch = await bcrypt.compare('Sandesh29', adminUser.password);
        console.log('   Password Match:', isMatch ? '✅ Yes' : '❌ No');
      } else {
        console.log('❌ Admin user not found in database');
      }
      
      await mongoose.disconnect();
    } catch (dbError) {
      console.log('❌ Database check failed:', dbError.message);
    }
  }
};

debugFrontendRequest(); 