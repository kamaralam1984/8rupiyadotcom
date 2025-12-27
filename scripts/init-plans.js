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

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true, default: 365 },
  expiryDays: { type: Number, default: 365 },
  maxPhotos: { type: Number, required: true, default: 1 },
  maxOffers: { type: Number, required: true, default: 0 },
  pageLimit: { type: Number, default: 0 },
  pageHosting: { type: Number, required: true, default: 0 },
  slotType: { type: String },
  seoEnabled: { type: Boolean, required: true, default: false },
  priority: { type: Number, required: true, default: 0 },
  listingPriority: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  homepageVisibility: { type: Boolean, default: false },
  featuredTag: { type: Boolean, default: false },
  position: { 
    type: String, 
    enum: ['normal', 'left', 'right', 'hero', 'banner'], 
    default: 'normal' 
  },
  photos: { type: Number, default: 1 },
  slots: { type: Number, default: 0 },
  seo: { type: Boolean, default: false },
  offers: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Plan = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);

const plans = [
  {
    name: 'Basic Plan',
    price: 100,
    duration: 365,
    expiryDays: 365,
    maxPhotos: 1,
    maxOffers: 0,
    pageLimit: 0,
    pageHosting: 0,
    slotType: undefined,
    seoEnabled: false,
    priority: 1,
    listingPriority: 1,
    rank: 1,
    homepageVisibility: false,
    featuredTag: false,
    position: 'normal',
    photos: 1,
    slots: 0,
    seo: false,
    offers: 0,
    isActive: true,
  },
  {
    name: 'Standard Plan',
    price: 200,
    duration: 365,
    expiryDays: 365,
    maxPhotos: 2,
    maxOffers: 1,
    pageLimit: 0,
    pageHosting: 0,
    slotType: undefined,
    seoEnabled: false,
    priority: 2,
    listingPriority: 2,
    rank: 2,
    homepageVisibility: false,
    featuredTag: false,
    position: 'normal',
    photos: 2,
    slots: 0,
    seo: false,
    offers: 1,
    isActive: true,
  },
  {
    name: 'Premium Plan',
    price: 2000,
    duration: 365,
    expiryDays: 365,
    maxPhotos: 5,
    maxOffers: 3,
    pageLimit: 1,
    pageHosting: 1,
    slotType: undefined,
    seoEnabled: true,
    priority: 3,
    listingPriority: 3,
    rank: 3,
    homepageVisibility: true,
    featuredTag: false,
    position: 'right',
    photos: 5,
    slots: 0,
    seo: true,
    offers: 3,
    isActive: true,
  },
  {
    name: 'Gold Plan',
    price: 3000,
    duration: 365,
    expiryDays: 365,
    maxPhotos: 8,
    maxOffers: 5,
    pageLimit: 2,
    pageHosting: 2,
    slotType: undefined,
    seoEnabled: true,
    priority: 4,
    listingPriority: 4,
    rank: 4,
    homepageVisibility: true,
    featuredTag: true,
    position: 'hero',
    photos: 8,
    slots: 0,
    seo: true,
    offers: 5,
    isActive: true,
  },
  {
    name: 'Platinum Plan',
    price: 4000,
    duration: 365,
    expiryDays: 365,
    maxPhotos: 12,
    maxOffers: 8,
    pageLimit: 3,
    pageHosting: 3,
    slotType: undefined,
    seoEnabled: true,
    priority: 5,
    listingPriority: 5,
    rank: 5,
    homepageVisibility: true,
    featuredTag: true,
    position: 'hero',
    photos: 12,
    slots: 0,
    seo: true,
    offers: 8,
    isActive: true,
  },
  {
    name: 'Diamond Plan',
    price: 5000,
    duration: 365,
    expiryDays: 365,
    maxPhotos: 20,
    maxOffers: 10,
    pageLimit: 5,
    pageHosting: 5,
    slotType: 'Banner',
    seoEnabled: true,
    priority: 6,
    listingPriority: 6,
    rank: 6,
    homepageVisibility: true,
    featuredTag: true,
    position: 'banner',
    photos: 20,
    slots: 0,
    seo: true,
    offers: 10,
    isActive: true,
  },
];

async function initPlans() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing plans...');
    await Plan.deleteMany({});
    console.log('✅ Existing plans cleared');

    console.log('📝 Creating new plans...');
    const createdPlans = await Plan.insertMany(plans);
    console.log(`✅ Successfully created ${createdPlans.length} plans:`);
    
    createdPlans.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.name} - ₹${plan.price}/year`);
    });

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    console.log('\n🎉 Plans initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing plans:', error);
    process.exit(1);
  }
}

initPlans();

