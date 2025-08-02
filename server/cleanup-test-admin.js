const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import User model
const User = require('./models/User');

const cleanupTestAdmin = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);

    // Delete test admin user
    const result = await User.deleteOne({ phone: '+919303228082' });
    
    if (result.deletedCount > 0) {
      console.log('✅ Test admin user cleaned up successfully');
    } else {
      console.log('ℹ️  No test admin user found to clean up');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up:', error.message);
    process.exit(1);
  }
};

// Run the cleanup
cleanupTestAdmin(); 