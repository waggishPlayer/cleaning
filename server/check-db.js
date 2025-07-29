require('dotenv').config();
const mongoose = require('mongoose');

async function checkDatabase() {
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
    
    // Check if users collection exists and has data
    const userCount = await usersCollection.countDocuments();
    console.log(`\n👥 Total users in database: ${userCount}`);
    
    if (userCount > 0) {
      // Show first few users
      const users = await usersCollection.find({}).limit(5).toArray();
      console.log('\n📋 Sample users:');
      users.forEach((user, index) => {
        console.log(`  User ${index + 1}:`);
        console.log(`    - ID: ${user._id}`);
        console.log(`    - Name: ${user.name || 'N/A'}`);
        console.log(`    - Phone: ${user.phone || 'N/A'}`);
        console.log(`    - Email: ${user.email || 'N/A'}`);
        console.log(`    - Role: ${user.role || 'N/A'}`);
        console.log('');
      });
    }
    
    // Check for any users with email fields
    const usersWithEmail = await usersCollection.countDocuments({ 
      email: { $exists: true, $ne: null } 
    });
    console.log(`📧 Users with email field: ${usersWithEmail}`);
    
    // Check for duplicate emails
    const duplicateEmails = await usersCollection.aggregate([
      { $match: { email: { $exists: true, $ne: null } } },
      { $group: { _id: "$email", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    if (duplicateEmails.length > 0) {
      console.log('\n⚠️ Duplicate emails found:');
      duplicateEmails.forEach(dup => {
        console.log(`  - Email: ${dup._id}, Count: ${dup.count}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkDatabase(); 