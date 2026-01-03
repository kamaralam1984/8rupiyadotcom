/**
 * Script to fix Review collection unique index
 * Run this once to drop the old unique index and create a sparse one
 * 
 * Usage: node src/scripts/fix-review-index.js
 * Or run in MongoDB shell:
 * db.reviews.dropIndex("shopId_1_userId_1")
 * db.reviews.createIndex({ shopId: 1, userId: 1 }, { unique: true, sparse: true })
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function fixReviewIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('reviews');

    // List all indexes
    const indexes = await collection.indexes();
    console.log('📋 Current indexes:', indexes.map(idx => idx.name));

    // Drop the old unique index if it exists
    try {
      await collection.dropIndex('shopId_1_userId_1');
      console.log('✅ Dropped old unique index: shopId_1_userId_1');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️  Index shopId_1_userId_1 does not exist, skipping...');
      } else {
        throw err;
      }
    }

    // Create sparse unique index (only applies when userId exists)
    await collection.createIndex(
      { shopId: 1, userId: 1 },
      { unique: true, sparse: true, name: 'shopId_1_userId_1' }
    );
    console.log('✅ Created sparse unique index: shopId_1_userId_1');

    // Verify
    const newIndexes = await collection.indexes();
    console.log('📋 New indexes:', newIndexes.map(idx => idx.name));

    console.log('✅ Index fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing index:', error);
    process.exit(1);
  }
}

fixReviewIndex();

