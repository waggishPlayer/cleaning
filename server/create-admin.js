const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import User model
const User = require('./models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'admin@caarvo.com' },
        { phone: '9303228082' }
      ]
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', {
        name: existingAdmin.name,
        email: existingAdmin.email,
        phone: existingAdmin.phone,
        role: existingAdmin.role
      });
      process.exit(0);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('sandesh29', salt);

    // Create admin user
    const adminUser = await User.create({
      name: 'Sandesh Agrawal',
      email: 'admin@caarvo.com', // Using a default email since email is required
      password: hashedPassword,
      phone: '9303228082',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Admin user created successfully!');
    console.log('📋 Admin Details:');
    console.log('   Name:', adminUser.name);
    console.log('   Email:', adminUser.email);
    console.log('   Phone:', adminUser.phone);
    console.log('   Role:', adminUser.role);
    console.log('   Status:', adminUser.isActive ? 'Active' : 'Inactive');
    console.log('\n🔑 Login Credentials:');
    console.log('   Phone: 9303228082');
    console.log('   Password: sandesh29');
    console.log('\n💡 You can now login to the admin dashboard using these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Run the script
createAdminUser(); 