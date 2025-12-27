/**
 * Import Justdial JSON data to MongoDB
 * 
 * Usage:
 * node scripts/import-justdial-to-mongodb.js --file justdial-data.json
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    }
  });
}

// Shop Schema (matches your existing Shop model)
const ShopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  address: { type: String, required: true },
  area: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  images: [String],
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  status: { type: String, default: 'pending' },
  isFeatured: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false },
}, { timestamps: true });

// Create index for geospatial queries
ShopSchema.index({ location: '2dsphere' });

const Shop = mongoose.models.Shop || mongoose.model('Shop', ShopSchema);

async function importToMongoDB(jsonFile) {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env.local');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Read JSON file
    const filePath = path.join(process.cwd(), jsonFile);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const businesses = JSON.parse(fileContent);

    console.log(`📊 Found ${businesses.length} businesses to import\n`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const business of businesses) {
      try {
        // Check if shop already exists (by name and address)
        const existing = await Shop.findOne({
          name: business.shop_name,
          address: business.full_address,
        });

        if (existing) {
          console.log(`⏭️  Skipped (duplicate): ${business.shop_name}`);
          skipped++;
          continue;
        }

        // Validate required fields
        if (!business.shop_name || !business.full_address || !business.city) {
          console.log(`⚠️  Skipped (missing data): ${business.shop_name || 'Unknown'}`);
          skipped++;
          continue;
        }

        // Prepare location coordinates
        let coordinates = [0, 0];
        if (business.longitude && business.latitude) {
          coordinates = [
            parseFloat(business.longitude),
            parseFloat(business.latitude),
          ];
        }

        // Create shop document
        const shop = new Shop({
          name: business.shop_name,
          category: business.category || 'Business',
          address: business.full_address,
          area: business.area || '',
          city: business.city,
          state: business.state || 'Bihar',
          pincode: business.pincode || '',
          location: {
            type: 'Point',
            coordinates: coordinates,
          },
          images: business.main_image_url ? [business.main_image_url] : [],
          phone: business.phone_number || '',
          website: business.website_url || '',
          rating: parseFloat(business.rating) || 0,
          reviewCount: 0,
          status: 'pending', // Will need admin approval
          isFeatured: false,
          isPaid: false,
        });

        await shop.save();
        imported++;
        console.log(`✅ [${imported}/${businesses.length}] Imported: ${shop.name}`);
      } catch (error) {
        errors++;
        console.error(`❌ Error importing ${business.shop_name}:`, error.message);
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Imported: ${imported}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📦 Total: ${businesses.length}\n`);

    await mongoose.disconnect();
    console.log('🎉 Import complete!\n');
  } catch (error) {
    console.error('❌ Import error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Parse arguments
const jsonFile = process.argv.find(arg => arg.startsWith('--file'))?.split('=')[1] || 
                 process.argv[process.argv.indexOf('--file') + 1] || 
                 'justdial-data.json';

if (require.main === module) {
  importToMongoDB(jsonFile);
}

module.exports = { importToMongoDB };

