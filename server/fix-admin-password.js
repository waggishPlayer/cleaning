const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import User model
const User = require('./models/User');

const fixAdminPassword = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);

    // Find admin user by phone
    const adminUser = await User.findOne({ phone: '9303228082' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found with phone: 9303228082');
      process.exit(1);
    }

    console.log('✅ Admin user found!');
    console.log('📋 Current Admin Details:');
    console.log('   Name:', adminUser.name);
    console.log('   Email:', adminUser.email);
    console.log('   Phone:', adminUser.phone);
    console.log('   Role:', adminUser.role);

    // Hash the correct password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('sandesh29', salt);
    
    console.log('\n🔐 Updating password...');
    console.log('   New Password Hash Length:', hashedPassword.length);

    // Update the admin user's password
    adminUser.password = hashedPassword;
    await adminUser.save();

    console.log('✅ Password updated successfully!');

    // Verify the password works
    const isMatch = await bcrypt.compare('sandesh29', adminUser.password);
    console.log('\n🔐 Password Verification:');
    console.log('   Test Password: sandesh29');
    console.log('   Password Match:', isMatch ? '✅ Yes' : '❌ No');

    if (isMatch) {
      console.log('\n🎉 Success! You can now login with:');
      console.log('   Phone: 9303228082');
      console.log('   Password: sandesh29');
    } else {
      console.log('\n❌ Password verification failed!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing admin password:', error.message);
    process.exit(1);
  }
};

// Run the script
fixAdminPassword(); 