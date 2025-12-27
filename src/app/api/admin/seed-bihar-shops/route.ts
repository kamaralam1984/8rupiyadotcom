import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop, { ShopStatus } from '@/models/Shop';
import User, { UserRole } from '@/models/User';
import Plan from '@/models/Plan';

// Bihar districts with their approximate coordinates [lng, lat]
const biharDistricts = [
  { name: 'Patna', lat: 25.5941, lng: 85.1376 },
  { name: 'Gaya', lat: 24.7969, lng: 84.9924 },
  { name: 'Bhagalpur', lat: 25.2445, lng: 87.0051 },
  { name: 'Muzaffarpur', lat: 26.1209, lng: 85.3647 },
  { name: 'Purnia', lat: 25.7772, lng: 87.4752 },
  { name: 'Darbhanga', lat: 26.1529, lng: 85.8970 },
  { name: 'Bihar Sharif', lat: 25.1972, lng: 85.5239 },
  { name: 'Arrah', lat: 25.5560, lng: 84.6628 },
  { name: 'Begusarai', lat: 25.4180, lng: 86.1289 },
  { name: 'Katihar', lat: 25.5333, lng: 87.5833 },
  { name: 'Munger', lat: 25.3750, lng: 86.4700 },
  { name: 'Chapra', lat: 25.7800, lng: 84.7500 },
  { name: 'Sasaram', lat: 24.9500, lng: 84.0167 },
  { name: 'Hajipur', lat: 25.6833, lng: 85.2167 },
  { name: 'Dehri', lat: 24.9000, lng: 84.1833 },
  { name: 'Bettiah', lat: 26.8000, lng: 84.5000 },
  { name: 'Sitamarhi', lat: 26.6000, lng: 85.4833 },
  { name: 'Motihari', lat: 26.6500, lng: 84.9167 },
  { name: 'Siwan', lat: 26.2167, lng: 84.3667 },
  { name: 'Kishanganj', lat: 26.1000, lng: 87.9333 },
  { name: 'Jamalpur', lat: 25.3000, lng: 86.5000 },
  { name: 'Buxar', lat: 25.5667, lng: 83.9833 },
  { name: 'Jehanabad', lat: 25.2167, lng: 84.9833 },
  { name: 'Aurangabad', lat: 24.7500, lng: 84.3667 },
  { name: 'Lakhisarai', lat: 25.1667, lng: 86.0833 },
  { name: 'Nawada', lat: 24.8833, lng: 85.5333 },
  { name: 'Jamui', lat: 24.9167, lng: 86.2167 },
  { name: 'Sheikhpura', lat: 25.1333, lng: 85.8333 },
  { name: 'Sheohar', lat: 26.5167, lng: 85.2833 },
  { name: 'Araria', lat: 26.1500, lng: 87.5167 },
  { name: 'Madhepura', lat: 25.9167, lng: 86.7833 },
  { name: 'Supaul', lat: 26.1167, lng: 86.6000 },
  { name: 'Vaishali', lat: 25.9833, lng: 85.1333 },
  { name: 'East Champaran', lat: 26.6500, lng: 84.9167 },
  { name: 'West Champaran', lat: 26.8000, lng: 84.5000 },
  { name: 'Saran', lat: 25.7800, lng: 84.7500 },
  { name: 'Gopalganj', lat: 26.4667, lng: 84.4333 },
  { name: 'Samastipur', lat: 25.8500, lng: 85.7833 },
];

const categories = [
  'Retail',
  'Restaurant',
  'Electronics',
  'Clothing',
  'Grocery',
  'Pharmacy',
  'Hardware',
  'Jewelry',
  'Automobile',
  'Furniture',
];

const shopNames = {
  Retail: ['Super Mart', 'General Store', 'Convenience Store'],
  Restaurant: ['Spice Kitchen', 'Tasty Bites', 'Food Court'],
  Electronics: ['Tech Hub', 'Electro World', 'Gadget Store'],
  Clothing: ['Fashion Hub', 'Style Mart', 'Trendy Wear'],
  Grocery: ['Fresh Mart', 'Daily Needs', 'Grocery Store'],
  Pharmacy: ['Medi Care', 'Health Plus', 'Pharmacy'],
  Hardware: ['Tool Store', 'Hardware Shop', 'Build Mart'],
  Jewelry: ['Gold Palace', 'Jewelry Store', 'Ornaments'],
  Automobile: ['Auto Parts', 'Car Service', 'Vehicle Shop'],
  Furniture: ['Furniture World', 'Home Decor', 'Furniture Store'],
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Get or create a default admin user for shops
    let adminUser = await User.findOne({ role: UserRole.ADMIN });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin',
        email: 'admin@8rupiya.com',
        phone: '9999999999',
        password: '$2a$10$dummy', // Dummy password
        role: UserRole.ADMIN,
      });
    }

    // Get or create a default shopper user
    let shopperUser = await User.findOne({ role: UserRole.SHOPPER, email: 'shopper@8rupiya.com' });
    if (!shopperUser) {
      shopperUser = await User.create({
        name: 'Default Shopper',
        email: 'shopper@8rupiya.com',
        phone: '8888888888',
        password: '$2a$10$dummy',
        role: UserRole.SHOPPER,
      });
    }

    // Get a plan (if exists)
    const plan = await Plan.findOne({ name: 'Basic' });

    const shops = [];
    let categoryIndex = 0;

    for (const district of biharDistricts) {
      // Add 3 shops per district with different categories
      for (let i = 0; i < 3; i++) {
        const category = categories[categoryIndex % categories.length];
        const shopNameList = shopNames[category as keyof typeof shopNames] || ['Shop'];
        const shopName = `${shopNameList[i % shopNameList.length]} - ${district.name}`;
        const shopIndex = shops.length;

        const shop: any = {
          name: shopName,
          description: `${category} shop in ${district.name}, Bihar. Quality products and services.`,
          category: category,
          address: `Main Road, ${district.name}`,
          city: district.name,
          state: 'Bihar',
          pincode: '800001',
          location: {
            type: 'Point',
            coordinates: [district.lng, district.lat],
          },
          phone: `91${Math.floor(9000000000 + Math.random() * 999999999)}`,
          email: `shop${shopIndex}@${district.name.toLowerCase().replace(/\s+/g, '')}.com`,
          images: [],
          status: ShopStatus.APPROVED,
          shopperId: shopperUser._id,
          planId: plan?._id,
          planExpiry: plan ? new Date(Date.now() + plan.expiryDays * 24 * 60 * 60 * 1000) : undefined,
          rankScore: plan ? plan.rank : 10,
          isFeatured: i === 0, // First shop of each district is featured
          homepagePriority: plan ? plan.listingPriority : 1,
          rating: 4 + Math.random(), // Random rating between 4-5
          reviewCount: Math.floor(Math.random() * 100) + 10,
        };

        shops.push(shop);
        categoryIndex++;
      }
    }

    // Insert all shops
    const createdShops = await Shop.insertMany(shops);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${createdShops.length} shops from ${biharDistricts.length} districts of Bihar`,
      shops: createdShops.length,
      districts: biharDistricts.length,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        error: error.message,
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

