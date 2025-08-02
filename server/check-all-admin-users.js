const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import User model
const User = require('./models/User');

const checkAllAdminUsers = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);

    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' }).select('+password');
    
    console.log(`📊 Found ${adminUsers.length} admin users:`);
    
    adminUsers.forEach((user, index) => {
      console.log(`\n👤 Admin User ${index + 1}:`);
      console.log('   Name:', user.name);
      console.log('   Phone:', user.phone);
      console.log('   Role:', user.role);
      console.log('   Email:', user.email);
      console.log('   Has Password:', !!user.password);
      console.log('   Password Hash:', user.password);
      console.log('   Created At:', user.createdAt);
    });

    // Test password for each admin user
    const bcrypt = require('bcryptjs');
    const testPassword = 'Sandesh29';
    
    console.log(`\n🔐 Testing password "${testPassword}" for each admin user:`);
    
    for (let i = 0; i < adminUsers.length; i++) {
      const user = adminUsers[i];
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`   Admin ${i + 1} (${user.phone}): ${isMatch ? '✅ MATCH!' : '❌ No match'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the check
checkAllAdminUsers(); 