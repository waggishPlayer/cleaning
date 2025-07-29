require('dotenv').config();
const mongoose = require('mongoose');

async function cleanupDatabase() {
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
    
    // Drop all email-related indexes
    console.log('\n🗑️ Dropping email indexes...');
    const indexNames = indexes.map(index => index.name);
    
    for (const indexName of indexNames) {
      if (indexName.includes('email')) {
        try {
          await usersCollection.dropIndex(indexName);
          console.log(`✅ Dropped index: ${indexName}`);
        } catch (error) {
          console.log(`ℹ️ Could not drop ${indexName}: ${error.message}`);
        }
      }
    }
    
    // Remove email field from all users with role 'user'
    console.log('\n🧹 Cleaning up user email fields...');
    const result = await usersCollection.updateMany(
      { role: 'user' },
      { $unset: { email: "" } }
    );
    console.log(`✅ Removed email field from ${result.modifiedCount} users`);
    
    // Show updated indexes
    console.log('\n📋 Updated indexes:');
    const updatedIndexes = await usersCollection.indexes();
    updatedIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    // Show user statistics
    const totalUsers = await usersCollection.countDocuments();
    const usersWithEmail = await usersCollection.countDocuments({ 
      email: { $exists: true, $ne: null } 
    });
    
    console.log('\n📊 User Statistics:');
    console.log(`  - Total users: ${totalUsers}`);
    console.log(`  - Users with email: ${usersWithEmail}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Database cleanup completed');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error.message);
  }
}

cleanupDatabase(); 