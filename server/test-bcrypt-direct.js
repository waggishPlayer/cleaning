const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import User model
const User = require('./models/User');

const testBcryptDirect = async () => {
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
    console.log('   Stored Hash:', adminUser.password);

    // Test bcrypt comparison directly
    const testPassword = 'Sandesh29';
    const directMatch = await bcrypt.compare(testPassword, adminUser.password);
    
    console.log('\n🔐 Direct bcrypt test:');
    console.log('   Test Password:', testPassword);
    console.log('   Direct bcrypt Match:', directMatch ? '✅ Yes' : '❌ No');

    // Test the comparePassword method
    const methodMatch = await adminUser.comparePassword(testPassword);
    console.log('   Method Match:', methodMatch ? '✅ Yes' : '❌ No');

    // Test creating a new hash and comparing
    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(testPassword, salt);
    console.log('   New Hash:', newHash);
    
    const newHashMatch = await bcrypt.compare(testPassword, newHash);
    console.log('   New Hash Match:', newHashMatch ? '✅ Yes' : '❌ No');

    if (directMatch) {
      console.log('\n🎉 Direct bcrypt works! The issue is with the comparePassword method.');
    } else {
      console.log('\n⚠️  Even direct bcrypt fails. The hash might be corrupted.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the test
testBcryptDirect(); 