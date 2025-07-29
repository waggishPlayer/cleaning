require('dotenv').config();
const mongoose = require('mongoose');

async function fixEmailIndex() {
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
    
    // Drop the email index if it exists
    try {
      console.log('🗑️ Dropping email_1 index...');
      await usersCollection.dropIndex('email_1');
      console.log('✅ Email index dropped successfully');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️ Email index does not exist (already dropped)');
      } else {
        console.error('❌ Error dropping email index:', error.message);
      }
    }
    
    console.log('📋 Updated indexes:');
    const updatedIndexes = await usersCollection.indexes();
    updatedIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    await mongoose.disconnect();
    console.log('✅ Database fix completed');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
  }
}

fixEmailIndex();
