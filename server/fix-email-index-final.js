require('dotenv').config();
const mongoose = require('mongoose');

async function fixEmailIndexFinal() {
  try {
    console.log('🔧 Connecting to MongoDB...');
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
      
      // Try to list all indexes including system indexes
      console.log('\n🔍 Checking for hidden indexes...');
      try {
        const allIndexes = await db.admin().listDatabases();
        console.log('Available databases:', allIndexes.databases.map(db => db.name));
      } catch (error) {
        console.log('Could not list databases:', error.message);
      }
    }
    
    // Check users again
    const users = await usersCollection.find({}).toArray();
    console.log(`\n👥 Total users: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n📋 Users found:');
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.phone}) - Role: ${user.role} - Email: ${user.email || 'N/A'}`);
      });
    }
    
    // Show final indexes
    console.log('\n📋 Final indexes:');
    const finalIndexes = await usersCollection.indexes();
    finalIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Email index fix completed');
    
  } catch (error) {
    console.error('❌ Email index fix failed:', error.message);
  }
}

fixEmailIndexFinal(); 