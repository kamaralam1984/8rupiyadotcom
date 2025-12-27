const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env.local file
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

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true },
  icon: { type: String },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

CategorySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

// Generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const categories = [
  {
    name: 'Retail',
    slug: 'retail',
    description: 'General retail stores',
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Restaurant',
    slug: 'restaurant',
    description: 'Restaurants and food outlets',
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronics and gadgets',
    displayOrder: 3,
    isActive: true,
  },
  {
    name: 'Clothing',
    slug: 'clothing',
    description: 'Clothing and fashion stores',
    displayOrder: 4,
    isActive: true,
  },
  {
    name: 'Grocery',
    slug: 'grocery',
    description: 'Grocery and supermarket',
    displayOrder: 5,
    isActive: true,
  },
  {
    name: 'Pharmacy',
    slug: 'pharmacy',
    description: 'Pharmacy and medical stores',
    displayOrder: 6,
    isActive: true,
  },
  {
    name: 'Hardware',
    slug: 'hardware',
    description: 'Hardware and tools',
    displayOrder: 7,
    isActive: true,
  },
  {
    name: 'Jewelry',
    slug: 'jewelry',
    description: 'Jewelry and accessories',
    displayOrder: 8,
    isActive: true,
  },
  {
    name: 'Automobile',
    slug: 'automobile',
    description: 'Automobile and vehicle services',
    displayOrder: 9,
    isActive: true,
  },
  {
    name: 'Furniture',
    slug: 'furniture',
    description: 'Furniture and home decor',
    displayOrder: 10,
    isActive: true,
  },
  {
    name: 'Beauty & Salon',
    slug: 'beauty-salon',
    description: 'Beauty parlors and salons',
    displayOrder: 11,
    isActive: true,
  },
  {
    name: 'Education',
    slug: 'education',
    description: 'Educational institutions and coaching',
    displayOrder: 12,
    isActive: true,
  },
];

async function initCategories() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing categories...');
    await Category.deleteMany({});
    console.log('✅ Existing categories cleared');

    console.log('📝 Creating new categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Successfully created ${createdCategories.length} categories:`);
    
    createdCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name}${cat.description ? ` - ${cat.description}` : ''}`);
    });

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    console.log('\n🎉 Categories initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing categories:', error);
    process.exit(1);
  }
}

initCategories();

