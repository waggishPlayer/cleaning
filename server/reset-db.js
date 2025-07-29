require('dotenv').config();
const mongoose = require('mongoose');

async function resetDatabase() {
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
    
    // Drop all indexes except _id_
    console.log('\n🗑️ Dropping all indexes except _id_...');
    for (const index of indexes) {
      if (index.name !== '_id_') {
        try {
          await usersCollection.dropIndex(index.name);
          console.log(`✅ Dropped index: ${index.name}`);
        } catch (error) {
          console.log(`ℹ️ Could not drop ${index.name}: ${error.message}`);
        }
      }
    }
    
    // Delete all users
    console.log('\n🗑️ Deleting all users...');
    const deleteResult = await usersCollection.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} users`);
    
    // Show final state
    console.log('\n📋 Final indexes:');
    const finalIndexes = await usersCollection.indexes();
    finalIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    const finalUserCount = await usersCollection.countDocuments();
    console.log(`\n👥 Final user count: ${finalUserCount}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Database reset completed');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
  }
}

resetDatabase(); 