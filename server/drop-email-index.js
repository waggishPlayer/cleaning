require('dotenv').config();
const mongoose = require('mongoose');

async function dropEmailIndex() {
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
    
    // Drop the email_1 index specifically
    try {
      console.log('\n🗑️ Dropping email_1 index...');
      await usersCollection.dropIndex('email_1');
      console.log('✅ email_1 index dropped successfully');
    } catch (error) {
      console.error('❌ Error dropping email_1 index:', error.message);
    }
    
    // Also try to drop any other email-related indexes
    const emailIndexes = indexes.filter(index => 
      index.name.includes('email') || 
      (index.key && index.key.email)
    );
    
    for (const index of emailIndexes) {
      if (index.name !== 'email_1') { // Already tried to drop this one
        try {
          console.log(`🗑️ Dropping ${index.name} index...`);
          await usersCollection.dropIndex(index.name);
          console.log(`✅ ${index.name} index dropped successfully`);
        } catch (error) {
          console.log(`ℹ️ Could not drop ${index.name}: ${error.message}`);
        }
      }
    }
    
    console.log('\n📋 Updated indexes:');
    const updatedIndexes = await usersCollection.indexes();
    updatedIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Email index cleanup completed');
    
  } catch (error) {
    console.error('❌ Email index cleanup failed:', error.message);
  }
}

dropEmailIndex(); 