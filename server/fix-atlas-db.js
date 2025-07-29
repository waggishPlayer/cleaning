require('dotenv').config({ path: './config.prod.env' });
const mongoose = require('mongoose');

async function fixAtlasDatabase() {
  try {
    console.log('🔧 Connecting to MongoDB Atlas...');
    console.log('📋 Connection string:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    console.log('📋 Current indexes:');
    const indexes = await usersCollection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    // Check if email_1 index exists
    const emailIndex = indexes.find(index => index.name === 'email_1');
    if (emailIndex) {
      console.log('\n⚠️ Found email_1 index:', emailIndex);
      
      try {
        console.log('🗑️ Dropping email_1 index...');
        await usersCollection.dropIndex('email_1');
        console.log('✅ email_1 index dropped successfully');
      } catch (error) {
        console.error('❌ Error dropping email_1 index:', error.message);
      }
    } else {
      console.log('\nℹ️ email_1 index not found in current indexes');
    }
    
    // Check users
    const users = await usersCollection.find({}).toArray();
    console.log(`\n👥 Total users: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n📋 Users found:');
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.phone}) - Role: ${user.role} - Email: ${user.email || 'N/A'}`);
      });
      
      // Check for users with null email
      const usersWithNullEmail = users.filter(user => user.email === null);
      console.log(`\n📧 Users with null email: ${usersWithNullEmail.length}`);
      
      if (usersWithNullEmail.length > 0) {
        console.log('⚠️ Found users with null email - this is causing the duplicate key error');
        
        // Remove email field from users with null email
        console.log('\n🧹 Removing email field from users with null email...');
        const updateResult = await usersCollection.updateMany(
          { email: null },
          { $unset: { email: "" } }
        );
        console.log(`✅ Updated ${updateResult.modifiedCount} users`);
      }
    }
    
    // Show final indexes
    console.log('\n📋 Final indexes:');
    const finalIndexes = await usersCollection.indexes();
    finalIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Atlas database fix completed');
    
  } catch (error) {
    console.error('❌ Atlas database fix failed:', error.message);
  }
}

fixAtlasDatabase(); 