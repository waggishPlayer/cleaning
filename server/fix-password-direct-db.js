const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

const fixPasswordDirectDB = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);

    // Create a fresh hash for the correct password
    const correctPassword = 'Sandesh29';
    const salt = await bcrypt.genSalt(12);
    const freshHash = await bcrypt.hash(correctPassword, salt);
    
    console.log('🔐 Creating fresh password hash...');
    console.log('   Password:', correctPassword);
    console.log('   Fresh Hash:', freshHash);
    console.log('   Hash Length:', freshHash.length);

    // Update the admin user's password directly in the database
    const result = await mongoose.connection.db.collection('users').updateOne(
      { phone: '+919303228082' },
      { $set: { password: freshHash } }
    );

    if (result.matchedCount === 0) {
      console.log('❌ Admin user not found');
      return;
    }

    if (result.modifiedCount === 0) {
      console.log('⚠️  Password was already set to the same value');
    } else {
      console.log('✅ Password updated directly in database!');
    }

    // Verify the password works by reading it back
    const adminUser = await mongoose.connection.db.collection('users').findOne({ phone: '+919303228082' });
    
    if (!adminUser) {
      console.log('❌ Could not find admin user after update');
      return;
    }

    console.log('\n📋 Updated Admin Details:');
    console.log('   Name:', adminUser.name);
    console.log('   Phone:', adminUser.phone);
    console.log('   Role:', adminUser.role);
    console.log('   Has Password:', !!adminUser.password);

    // Test password comparison
    const isMatch = await bcrypt.compare(correctPassword, adminUser.password);
    
    console.log('\n🔐 Password Verification:');
    console.log('   Test Password:', correctPassword);
    console.log('   Password Match:', isMatch ? '✅ Yes' : '❌ No');

    if (isMatch) {
      console.log('\n🎉 Success! You can now login with:');
      console.log('   Phone: +919303228082');
      console.log('   Password: Sandesh29');
    } else {
      console.log('\n❌ Password verification failed!');
      console.log('   Stored hash:', adminUser.password);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing password:', error.message);
    process.exit(1);
  }
};

// Run the fix
fixPasswordDirectDB(); 