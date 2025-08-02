const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import User model
const User = require('./models/User');

const checkAdminUser = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);

    // Find admin user by phone
    const adminUser = await User.findOne({ phone: '9303228082' }).select('+password');
    
    if (!adminUser) {
      console.log('❌ Admin user not found with phone: 9303228082');
      
      // Check if there are any admin users
      const allAdmins = await User.find({ role: 'admin' });
      console.log(`\n📊 Found ${allAdmins.length} admin users:`);
      allAdmins.forEach(admin => {
        console.log(`   - Name: ${admin.name}, Phone: ${admin.phone}, Email: ${admin.email || 'N/A'}`);
      });
      
      process.exit(1);
    }

    console.log('✅ Admin user found!');
    console.log('📋 Admin Details:');
    console.log('   Name:', adminUser.name);
    console.log('   Email:', adminUser.email);
    console.log('   Phone:', adminUser.phone);
    console.log('   Role:', adminUser.role);
    console.log('   Status:', adminUser.isActive ? 'Active' : 'Inactive');
    console.log('   Has Password:', adminUser.password ? 'Yes' : 'No');
    
    if (adminUser.password) {
      console.log('   Password Length:', adminUser.password.length);
    }

    // Test password comparison
    const bcrypt = require('bcryptjs');
    const testPassword = 'sandesh29';
    const isMatch = await bcrypt.compare(testPassword, adminUser.password);
    
    console.log('\n🔐 Password Test:');
    console.log('   Test Password:', testPassword);
    console.log('   Password Match:', isMatch ? '✅ Yes' : '❌ No');
    
    if (!isMatch) {
      console.log('\n⚠️  Password mismatch! The stored password hash does not match "sandesh29"');
      console.log('   This could be because:');
      console.log('   1. The password was not hashed correctly during creation');
      console.log('   2. The password was changed after creation');
      console.log('   3. There was an error in the password hashing process');
    } else {
      console.log('\n✅ Password verification successful!');
      console.log('   You should be able to login with:');
      console.log('   Phone: 9303228082');
      console.log('   Password: sandesh29');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking admin user:', error.message);
    process.exit(1);
  }
};

// Run the script
checkAdminUser(); 