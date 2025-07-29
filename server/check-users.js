require('dotenv').config();
const mongoose = require('mongoose');

async function checkUsers() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    console.log('📋 Current indexes:');
    const indexes = await usersCollection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    // Get all users
    const users = await usersCollection.find({}).toArray();
    console.log(`\n👥 Total users: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n📋 All users:');
      users.forEach((user, index) => {
        console.log(`\n  User ${index + 1}:`);
        console.log(`    - ID: ${user._id}`);
        console.log(`    - Name: ${user.name || 'N/A'}`);
        console.log(`    - Phone: ${user.phone || 'N/A'}`);
        console.log(`    - Email: ${user.email || 'N/A'}`);
        console.log(`    - Role: ${user.role || 'N/A'}`);
        console.log(`    - Has email field: ${user.hasOwnProperty('email')}`);
        console.log(`    - Email value: ${JSON.stringify(user.email)}`);
      });
    }
    
    // Check for users with email field
    const usersWithEmail = await usersCollection.find({ 
      email: { $exists: true } 
    }).toArray();
    
    console.log(`\n📧 Users with email field: ${usersWithEmail.length}`);
    if (usersWithEmail.length > 0) {
      usersWithEmail.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.phone}) - Email: ${user.email}`);
      });
    }
    
    // Check for users with null email
    const usersWithNullEmail = await usersCollection.find({ 
      email: null 
    }).toArray();
    
    console.log(`\n📧 Users with null email: ${usersWithNullEmail.length}`);
    if (usersWithNullEmail.length > 0) {
      usersWithNullEmail.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.phone})`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n✅ User check completed');
    
  } catch (error) {
    console.error('❌ User check failed:', error.message);
  }
}

checkUsers(); 