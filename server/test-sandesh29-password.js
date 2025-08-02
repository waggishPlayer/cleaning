const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import User model
const User = require('./models/User');

const testSandesh29Password = async () => {
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

    // Test the correct password
    const correctPassword = 'Sandesh29';
    const isMatch = await adminUser.comparePassword(correctPassword);
    
    console.log('\n🔐 Testing correct password:');
    console.log('   Password:', correctPassword);
    console.log('   Password Match:', isMatch ? '✅ MATCH!' : '❌ No match');

    if (isMatch) {
      console.log('\n🎉 Success! You can login with:');
      console.log('   Phone: +919303228082');
      console.log('   Password: Sandesh29');
    } else {
      console.log('\n⚠️  Password still doesn\'t match!');
      console.log('   This suggests the password was not saved correctly during registration.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the test
testSandesh29Password(); 