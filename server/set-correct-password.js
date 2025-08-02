const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import User model
const User = require('./models/User');

const setCorrectPassword = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);

    // Find the admin user
    const adminUser = await User.findOne({ phone: '+919303228082' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found!');
    console.log('📋 Current Admin Details:');
    console.log('   Name:', adminUser.name);
    console.log('   Phone:', adminUser.phone);
    console.log('   Role:', adminUser.role);

    // Set the correct password
    const correctPassword = 'Sandesh29';
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(correctPassword, salt);
    
    console.log('\n🔐 Setting correct password...');
    console.log('   Password:', correctPassword);
    console.log('   Hash Length:', hashedPassword.length);

    // Update the admin user's password
    adminUser.password = hashedPassword;
    await adminUser.save();

    console.log('✅ Password updated successfully!');

    // Verify the password works
    const isMatch = await adminUser.comparePassword(correctPassword);
    console.log('\n🔐 Password Verification:');
    console.log('   Test Password:', correctPassword);
    console.log('   Password Match:', isMatch ? '✅ Yes' : '❌ No');

    if (isMatch) {
      console.log('\n🎉 Success! You can now login with:');
      console.log('   Phone: +919303228082');
      console.log('   Password: Sandesh29');
    } else {
      console.log('\n❌ Password verification failed!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting correct password:', error.message);
    process.exit(1);
  }
};

// Run the fix
setCorrectPassword(); 