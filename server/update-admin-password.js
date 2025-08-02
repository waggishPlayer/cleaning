const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import User model
const User = require('./models/User');

const updateAdminPassword = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);

    // Find the admin user
    const adminUser = await User.findOne({ phone: '+919303228082' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found with phone: +919303228082');
      return;
    }

    console.log('✅ Admin user found!');
    console.log('📋 Admin Details:');
    console.log('   Name:', adminUser.name);
    console.log('   Phone:', adminUser.phone);
    console.log('   Role:', adminUser.role);
    console.log('   Email:', adminUser.email);

    // New password to set
    const newPassword = 'testpassword123';
    
    // Set the password directly and let the model's pre-save hook handle the hashing
    adminUser.password = newPassword;
    await adminUser.save();
    
    console.log('\n🔐 Password Update:');
    console.log('   New Password:', newPassword);
    console.log('   Password Updated Successfully ✅');
    
    // Verify the password was updated correctly
    const updatedAdmin = await User.findOne({ phone: '+919303228082' }).select('+password');
    const isMatch = await updatedAdmin.comparePassword(newPassword);
    
    console.log('\n🔍 Verification:');
    console.log('   Password Match:', isMatch ? '✅ Yes' : '❌ No');
    
    if (isMatch) {
      console.log('\n✅ Admin password has been updated successfully!');
      console.log('   You can now login with:');
      console.log('   Phone:', adminUser.phone);
      console.log('   Password:', newPassword);
    } else {
      console.log('\n❌ Something went wrong with the password update.');
    }

  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

// Run the function
updateAdminPassword();