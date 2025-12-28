const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env.local file if it exists
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/8rupiya';

const ShopSchema = new mongoose.Schema({}, { strict: false, collection: 'shops' });
const Shop = mongoose.models.Shop || mongoose.model('Shop', ShopSchema);

async function deleteAllShops() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Count shops before deletion
    const count = await Shop.countDocuments();
    console.log(`\n📊 Total shops in database: ${count}`);

    if (count === 0) {
      console.log('No shops to delete.');
      await mongoose.disconnect();
      return;
    }

    // Delete all shops
    console.log('\n🗑️  Deleting all shops...');
    const result = await Shop.deleteMany({});
    
    console.log(`\n✅ Successfully deleted ${result.deletedCount} shops from database`);
    
    // Verify deletion
    const remainingCount = await Shop.countDocuments();
    console.log(`\n📊 Remaining shops: ${remainingCount}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
deleteAllShops();

