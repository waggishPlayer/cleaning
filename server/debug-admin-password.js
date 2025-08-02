const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import User model
const User = require('./models/User');

const debugAdminPassword = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);

    // Find the admin user
    const adminUser = await User.findOne({ phone: '+919303228082' }).select('+password');
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found!');
    console.log('📋 Admin Details:');
    console.log('   Name:', adminUser.name);
    console.log('   Phone:', adminUser.phone);
    console.log('   Role:', adminUser.role);
    console.log('   Password Hash:', adminUser.password);

    // Test different password combinations
    const testPasswords = [
      'sandesh29',
      'testpassword123',
      'admin123',
      'password',
      '123456',
      'admin',
      'sandesh',
      '29'
    ];

    console.log('\n🔐 Testing password combinations:');
    for (const testPassword of testPasswords) {
      const isMatch = await adminUser.comparePassword(testPassword);
      console.log(`   "${testPassword}": ${isMatch ? '✅ MATCH!' : '❌ No match'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the debug
debugAdminPassword(); 