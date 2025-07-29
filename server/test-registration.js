require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testRegistration() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Connected to MongoDB');
    
    // Test creating a user
    console.log('\n🧪 Testing user creation...');
    
    try {
      const testUser = await User.create({
        name: 'Test User',
        phone: '+919876543211',
        password: 'testpass123',
        role: 'user',
        email: undefined
      });
      
      console.log('✅ User created successfully:', testUser.toJSON());
      
      // Clean up - delete the test user
      await User.findByIdAndDelete(testUser._id);
      console.log('🧹 Test user cleaned up');
      
    } catch (error) {
      console.error('❌ User creation failed:', error.message);
      console.error('Error details:', error);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRegistration(); 