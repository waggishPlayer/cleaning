const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import User model
const User = require('./models/User');

const testAdminRegistration = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);

    // Test data
    const testData = {
      name: 'Test Admin',
      phone: '+919303228082',
      password: 'testpassword123',
      role: 'admin',
      isActive: true
    };

    console.log('🧪 Testing admin registration with data:', {
      name: testData.name,
      phone: testData.phone,
      role: testData.role
    });

    // Test creating admin user directly
    try {
      const adminUser = await User.create(testData);
      console.log('✅ Admin user created successfully!');
      console.log('📋 Created user:', {
        name: adminUser.name,
        phone: adminUser.phone,
        role: adminUser.role,
        email: adminUser.email,
        hasPassword: !!adminUser.password
      });
    } catch (error) {
      console.log('❌ Error creating admin user:', error.message);
      console.log('🔍 Error details:', error);
    }

    // Clean up - delete test user
    await User.deleteOne({ phone: testData.phone });
    console.log('🧹 Test user cleaned up');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error in test:', error.message);
    process.exit(1);
  }
};

// Run the test
testAdminRegistration(); 