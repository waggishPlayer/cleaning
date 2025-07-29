require('dotenv').config();
const mongoose = require('mongoose');

async function fixDatabase() {
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
    
    // Drop any other email-related indexes
    try {
      console.log('🗑️ Dropping email index...');
      await usersCollection.dropIndex('email');
      console.log('✅ Email index dropped successfully');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️ Email index does not exist (already dropped)');
      } else {
        console.error('❌ Error dropping email index:', error.message);
      }
    }
    
    // Clean up users with problematic email fields
    console.log('🧹 Cleaning up users with problematic email fields...');
    const result = await usersCollection.updateMany(
      { 
        role: 'user',
        email: { $exists: true, $ne: null }
      },
      { 
        $unset: { email: "" }
      }
    );
    console.log(`✅ Cleaned up ${result.modifiedCount} users with email fields`);
    
    // Ensure phone field is required and unique
    console.log('📱 Ensuring phone field is properly indexed...');
    try {
      await usersCollection.createIndex({ phone: 1 }, { unique: true });
      console.log('✅ Phone index created/updated successfully');
    } catch (error) {
      console.log('ℹ️ Phone index already exists or error:', error.message);
    }
    
    console.log('📋 Updated indexes:');
    const updatedIndexes = await usersCollection.indexes();
    updatedIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    // Show some user statistics
    const totalUsers = await usersCollection.countDocuments();
    const usersWithEmail = await usersCollection.countDocuments({ email: { $exists: true, $ne: null } });
    const usersWithoutEmail = await usersCollection.countDocuments({ 
      $or: [
        { email: { $exists: false } },
        { email: null }
      ]
    });
    
    console.log('\n📊 User Statistics:');
    console.log(`  - Total users: ${totalUsers}`);
    console.log(`  - Users with email: ${usersWithEmail}`);
    console.log(`  - Users without email: ${usersWithoutEmail}`);
    
    await mongoose.disconnect();
    console.log('✅ Database fix completed');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
  }
}

fixDatabase(); 