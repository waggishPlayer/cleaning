const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import User model
const User = require('./models/User');

const testAdminLogin = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);

    // Find the admin user that was just created
    const adminUser = await User.findOne({ phone: '+919303228082' }).select('+password');
    
    if (!adminUser) {
      console.log('❌ Admin user not found with phone: +919303228082');
      
      // List all users to see what's in the database
      const allUsers = await User.find({}).select('name phone role email');
      console.log('📋 All users in database:');
      allUsers.forEach(user => {
        console.log(`   - Name: ${user.name}, Phone: ${user.phone}, Role: ${user.role}, Email: ${user.email || 'N/A'}`);
      });
      return;
    }

    console.log('✅ Admin user found!');
    console.log('📋 Admin Details:');
    console.log('   Name:', adminUser.name);
    console.log('   Phone:', adminUser.phone);
    console.log('   Role:', adminUser.role);
    console.log('   Email:', adminUser.email);
    console.log('   Has Password:', !!adminUser.password);
    console.log('   Password Length:', adminUser.password ? adminUser.password.length : 0);

    // Test password comparison
    const testPassword = 'testpassword123'; // This should match what you used during registration
    const isMatch = await adminUser.comparePassword(testPassword);
    
    console.log('\n🔐 Password Test:');
    console.log('   Test Password:', testPassword);
    console.log('   Password Match:', isMatch ? '✅ Yes' : '❌ No');

    if (!isMatch) {
      console.log('\n⚠️  Password mismatch!');
      console.log('   This could be because:');
      console.log('   1. The password used during registration was different');
      console.log('   2. The password was not hashed correctly');
      console.log('   3. There was an error in the password hashing process');
    } else {
      console.log('\n✅ Password verification successful!');
      console.log('   You should be able to login with:');
      console.log('   Phone: +919303228082');
      console.log('   Password: testpassword123');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing admin login:', error.message);
    process.exit(1);
  }
};

// Run the test
testAdminLogin(); 