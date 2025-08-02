const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

const fixAdminPasswordDirect = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);

    // Hash the password directly
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('sandesh29', salt);
    
    console.log('🔐 Generated password hash:');
    console.log('   Hash Length:', hashedPassword.length);
    console.log('   Hash Preview:', hashedPassword.substring(0, 20) + '...');

    // Update the admin user's password directly in the database
    const result = await mongoose.connection.db.collection('users').updateOne(
      { phone: '9303228082' },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      console.log('❌ Admin user not found with phone: 9303228082');
      process.exit(1);
    }

    if (result.modifiedCount === 0) {
      console.log('⚠️  Password was already set to the same value');
    } else {
      console.log('✅ Password updated successfully!');
    }

    // Verify the password works by reading it back
    const adminUser = await mongoose.connection.db.collection('users').findOne({ phone: '9303228082' });
    
    if (!adminUser) {
      console.log('❌ Could not find admin user after update');
      process.exit(1);
    }

    console.log('\n📋 Updated Admin Details:');
    console.log('   Name:', adminUser.name);
    console.log('   Phone:', adminUser.phone);
    console.log('   Role:', adminUser.role);
    console.log('   Has Password:', adminUser.password ? 'Yes' : 'No');

    // Test password comparison
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
      console.log('   Stored hash:', adminUser.password);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing admin password:', error.message);
    process.exit(1);
  }
};

// Run the script
fixAdminPasswordDirect(); 