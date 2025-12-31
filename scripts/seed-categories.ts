import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Category from '../src/models/Category';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/8rupiya';

// Category data with proper organization
const categories = [
  // 🛍️ RETAIL, GROCERY & DAILY NEEDS (1-120)
  { name: 'Grocery Store', icon: '🛒', section: 'Retail & Grocery', displayOrder: 1 },
  { name: 'Kirana Shop', icon: '🏪', section: 'Retail & Grocery', displayOrder: 2 },
  { name: 'Supermarket', icon: '🏬', section: 'Retail & Grocery', displayOrder: 3 },
  { name: 'Mini Mart', icon: '🏪', section: 'Retail & Grocery', displayOrder: 4 },
  { name: 'Department Store', icon: '🏢', section: 'Retail & Grocery', displayOrder: 5 },
  { name: 'General Store', icon: '🏪', section: 'Retail & Grocery', displayOrder: 6 },
  { name: 'Provision Store', icon: '🛒', section: 'Retail & Grocery', displayOrder: 7 },
  { name: 'Organic Food Store', icon: '🌱', section: 'Retail & Grocery', displayOrder: 8 },
  { name: 'Fruits Shop', icon: '🍎', section: 'Retail & Grocery', displayOrder: 9 },
  { name: 'Vegetable Shop', icon: '🥬', section: 'Retail & Grocery', displayOrder: 10 },
  { name: 'Fruit & Vegetable Market', icon: '🥕', section: 'Retail & Grocery', displayOrder: 11 },
  { name: 'Dairy Booth', icon: '🥛', section: 'Retail & Grocery', displayOrder: 12 },
  { name: 'Milk Shop', icon: '🥛', section: 'Retail & Grocery', displayOrder: 13 },
  { name: 'Paneer Shop', icon: '🧀', section: 'Retail & Grocery', displayOrder: 14 },
  { name: 'Butter & Cheese Store', icon: '🧈', section: 'Retail & Grocery', displayOrder: 15 },
  { name: 'Bakery', icon: '🍞', section: 'Retail & Grocery', displayOrder: 16 },
  { name: 'Cake Shop', icon: '🎂', section: 'Retail & Grocery', displayOrder: 17 },
  { name: 'Pastry Shop', icon: '🥐', section: 'Retail & Grocery', displayOrder: 18 },
  { name: 'Sweet Shop', icon: '🍬', section: 'Retail & Grocery', displayOrder: 19 },
  { name: 'Mithai Shop', icon: '🍡', section: 'Retail & Grocery', displayOrder: 20 },
  { name: 'Ice Cream Parlour', icon: '🍦', section: 'Retail & Grocery', displayOrder: 21 },
  { name: 'Chocolate Store', icon: '🍫', section: 'Retail & Grocery', displayOrder: 22 },
  { name: 'Candy Shop', icon: '🍭', section: 'Retail & Grocery', displayOrder: 23 },
  { name: 'Juice Center', icon: '🧃', section: 'Retail & Grocery', displayOrder: 24 },
  { name: 'Fresh Juice Bar', icon: '🍹', section: 'Retail & Grocery', displayOrder: 25 },
  { name: 'Dry Fruits Store', icon: '🥜', section: 'Retail & Grocery', displayOrder: 26 },
  { name: 'Nut Store', icon: '🌰', section: 'Retail & Grocery', displayOrder: 27 },
  { name: 'Spice Store', icon: '🌶️', section: 'Retail & Grocery', displayOrder: 28 },
  { name: 'Masala Shop', icon: '🧂', section: 'Retail & Grocery', displayOrder: 29 },
  { name: 'Edible Oil Store', icon: '🛢️', section: 'Retail & Grocery', displayOrder: 30 },
  { name: 'Ghee Store', icon: '🧈', section: 'Retail & Grocery', displayOrder: 31 },
  { name: 'Rice Shop', icon: '🍚', section: 'Retail & Grocery', displayOrder: 32 },
  { name: 'Atta Chakki', icon: '🌾', section: 'Retail & Grocery', displayOrder: 33 },
  { name: 'Flour Mill', icon: '⚙️', section: 'Retail & Grocery', displayOrder: 34 },
  { name: 'Grain Store', icon: '🌾', section: 'Retail & Grocery', displayOrder: 35 },
  { name: 'Dal & Pulses Store', icon: '🫘', section: 'Retail & Grocery', displayOrder: 36 },
  { name: 'Pickle Store', icon: '🥒', section: 'Retail & Grocery', displayOrder: 37 },
  { name: 'Papad Store', icon: '🫓', section: 'Retail & Grocery', displayOrder: 38 },
  { name: 'Frozen Food Store', icon: '🧊', section: 'Retail & Grocery', displayOrder: 39 },
  { name: 'Ready To Eat Food', icon: '🍱', section: 'Retail & Grocery', displayOrder: 40 },
  { name: 'Packaged Food Store', icon: '📦', section: 'Retail & Grocery', displayOrder: 41 },
  { name: 'Snacks Shop', icon: '🍿', section: 'Retail & Grocery', displayOrder: 42 },
  { name: 'Namkeen Store', icon: '🥨', section: 'Retail & Grocery', displayOrder: 43 },
  { name: 'Chips Shop', icon: '🥔', section: 'Retail & Grocery', displayOrder: 44 },
  { name: 'Soft Drink Store', icon: '🥤', section: 'Retail & Grocery', displayOrder: 45 },
  { name: 'Cold Drink Shop', icon: '🧃', section: 'Retail & Grocery', displayOrder: 46 },
  { name: 'Water Bottle Supplier', icon: '💧', section: 'Retail & Grocery', displayOrder: 47 },
  { name: 'Mineral Water Plant', icon: '🏭', section: 'Retail & Grocery', displayOrder: 48 },
  { name: 'Soda Shop', icon: '🥤', section: 'Retail & Grocery', displayOrder: 49 },
  { name: 'Ice Factory', icon: '🧊', section: 'Retail & Grocery', displayOrder: 50 },
  { name: 'Meat Shop', icon: '🥩', section: 'Retail & Grocery', displayOrder: 51 },
  { name: 'Chicken Shop', icon: '🍗', section: 'Retail & Grocery', displayOrder: 52 },
  { name: 'Fish Market', icon: '🐟', section: 'Retail & Grocery', displayOrder: 53 },
  { name: 'Seafood Store', icon: '🦞', section: 'Retail & Grocery', displayOrder: 54 },
  { name: 'Egg Shop', icon: '🥚', section: 'Retail & Grocery', displayOrder: 55 },
  { name: 'Poultry Farm', icon: '🐔', section: 'Retail & Grocery', displayOrder: 56 },
  { name: 'Mutton Shop', icon: '🐑', section: 'Retail & Grocery', displayOrder: 57 },
  { name: 'Butcher Shop', icon: '🔪', section: 'Retail & Grocery', displayOrder: 58 },
  { name: 'Paan Shop', icon: '🌿', section: 'Retail & Grocery', displayOrder: 59 },
  { name: 'Tobacco Shop', icon: '🚬', section: 'Retail & Grocery', displayOrder: 60 },
  { name: 'Cigarette Store', icon: '🚭', section: 'Retail & Grocery', displayOrder: 61 },
  { name: 'Hookah Shop', icon: '💨', section: 'Retail & Grocery', displayOrder: 62 },
  { name: 'Baby Food Store', icon: '🍼', section: 'Retail & Grocery', displayOrder: 63 },
  { name: 'Nutrition Store', icon: '💪', section: 'Retail & Grocery', displayOrder: 64 },
  { name: 'Health Food Shop', icon: '🥗', section: 'Retail & Grocery', displayOrder: 65 },
  { name: 'Diabetic Food Store', icon: '🩺', section: 'Retail & Grocery', displayOrder: 66 },
  { name: 'Vegan Food Store', icon: '🌱', section: 'Retail & Grocery', displayOrder: 67 },
  { name: 'Imported Grocery', icon: '✈️', section: 'Retail & Grocery', displayOrder: 68 },
  { name: 'Wholesale Grocery', icon: '📦', section: 'Retail & Grocery', displayOrder: 69 },
  { name: 'Retail Grocery', icon: '🛒', section: 'Retail & Grocery', displayOrder: 70 },
  { name: 'Online Grocery', icon: '💻', section: 'Retail & Grocery', displayOrder: 71 },
  { name: '24x7 Grocery Store', icon: '🕐', section: 'Retail & Grocery', displayOrder: 72 },
  { name: 'Budget Grocery', icon: '💰', section: 'Retail & Grocery', displayOrder: 73 },
  { name: 'Premium Grocery', icon: '⭐', section: 'Retail & Grocery', displayOrder: 74 },
  { name: 'Local Kirana', icon: '🏪', section: 'Retail & Grocery', displayOrder: 75 },
  { name: 'Village Grocery', icon: '🏘️', section: 'Retail & Grocery', displayOrder: 76 },
  { name: 'Farm Fresh Store', icon: '🚜', section: 'Retail & Grocery', displayOrder: 77 },
  { name: 'Farmer Market', icon: '👨‍🌾', section: 'Retail & Grocery', displayOrder: 78 },
  { name: 'Organic Farm Shop', icon: '🌾', section: 'Retail & Grocery', displayOrder: 79 },
  { name: 'Home Delivery Grocery', icon: '🚚', section: 'Retail & Grocery', displayOrder: 80 },

  // 🍽️ RESTAURANTS, FOOD SERVICES & CLOUD KITCHEN (121-240)
  { name: 'Restaurant', icon: '🍽️', section: 'Food & Dining', displayOrder: 121 },
  { name: 'Family Restaurant', icon: '👨‍👩‍👧‍👦', section: 'Food & Dining', displayOrder: 122 },
  { name: 'Fine Dining Restaurant', icon: '🍷', section: 'Food & Dining', displayOrder: 123 },
  { name: 'Budget Restaurant', icon: '💵', section: 'Food & Dining', displayOrder: 124 },
  { name: 'Luxury Restaurant', icon: '💎', section: 'Food & Dining', displayOrder: 125 },
  { name: 'Fast Food Center', icon: '🍔', section: 'Food & Dining', displayOrder: 126 },
  { name: 'Quick Service Restaurant', icon: '⚡', section: 'Food & Dining', displayOrder: 127 },
  { name: 'Cafe', icon: '☕', section: 'Food & Dining', displayOrder: 128 },
  { name: 'Coffee Shop', icon: '☕', section: 'Food & Dining', displayOrder: 129 },
  { name: 'Tea Shop', icon: '🫖', section: 'Food & Dining', displayOrder: 130 },
  { name: 'Chai Point', icon: '☕', section: 'Food & Dining', displayOrder: 131 },
  { name: 'Chinese Restaurant', icon: '🥡', section: 'Food & Dining', displayOrder: 132 },
  { name: 'South Indian Restaurant', icon: '🍛', section: 'Food & Dining', displayOrder: 133 },
  { name: 'North Indian Restaurant', icon: '🍛', section: 'Food & Dining', displayOrder: 134 },
  { name: 'Punjabi Restaurant', icon: '🍛', section: 'Food & Dining', displayOrder: 135 },
  { name: 'Gujarati Restaurant', icon: '🥘', section: 'Food & Dining', displayOrder: 136 },
  { name: 'Rajasthani Restaurant', icon: '🥘', section: 'Food & Dining', displayOrder: 137 },
  { name: 'Bengali Restaurant', icon: '🐟', section: 'Food & Dining', displayOrder: 138 },
  { name: 'Mughlai Restaurant', icon: '🍖', section: 'Food & Dining', displayOrder: 139 },
  { name: 'Biryani House', icon: '🍚', section: 'Food & Dining', displayOrder: 140 },
  { name: 'Kebab Shop', icon: '�串', section: 'Food & Dining', displayOrder: 141 },
  { name: 'Tandoori Restaurant', icon: '🔥', section: 'Food & Dining', displayOrder: 142 },
  { name: 'BBQ Restaurant', icon: '🍖', section: 'Food & Dining', displayOrder: 143 },
  { name: 'Grill Restaurant', icon: '🥩', section: 'Food & Dining', displayOrder: 144 },
  { name: 'Pizza Shop', icon: '🍕', section: 'Food & Dining', displayOrder: 145 },
  { name: 'Pizza Cafe', icon: '🍕', section: 'Food & Dining', displayOrder: 146 },
  { name: 'Burger Joint', icon: '🍔', section: 'Food & Dining', displayOrder: 147 },
  { name: 'Sandwich Shop', icon: '🥪', section: 'Food & Dining', displayOrder: 148 },
  { name: 'Roll Shop', icon: '🌯', section: 'Food & Dining', displayOrder: 149 },
  { name: 'Shawarma Shop', icon: '🥙', section: 'Food & Dining', displayOrder: 150 },
  { name: 'Momos Shop', icon: '🥟', section: 'Food & Dining', displayOrder: 151 },
  { name: 'Street Food Stall', icon: '🍜', section: 'Food & Dining', displayOrder: 152 },
  { name: 'Food Truck', icon: '🚚', section: 'Food & Dining', displayOrder: 153 },
  { name: 'Highway Dhaba', icon: '🛣️', section: 'Food & Dining', displayOrder: 154 },
  { name: 'Cloud Kitchen', icon: '☁️', section: 'Food & Dining', displayOrder: 155 },
  { name: 'Virtual Restaurant', icon: '💻', section: 'Food & Dining', displayOrder: 156 },
  { name: 'Tiffin Service', icon: '🍱', section: 'Food & Dining', displayOrder: 157 },
  { name: 'Catering Service', icon: '🎪', section: 'Food & Dining', displayOrder: 158 },
  { name: 'Vegan Restaurant', icon: '🌱', section: 'Food & Dining', displayOrder: 159 },
  { name: 'Italian Restaurant', icon: '🍝', section: 'Food & Dining', displayOrder: 160 },

  // 🏨 HOTELS, STAY & TRAVEL (241-320)
  { name: 'Hotel', icon: '🏨', section: 'Hotels & Travel', displayOrder: 241 },
  { name: 'Budget Hotel', icon: '🏨', section: 'Hotels & Travel', displayOrder: 242 },
  { name: 'Luxury Hotel', icon: '🏰', section: 'Hotels & Travel', displayOrder: 243 },
  { name: 'Business Hotel', icon: '💼', section: 'Hotels & Travel', displayOrder: 244 },
  { name: 'Family Hotel', icon: '👨‍👩‍👧‍👦', section: 'Hotels & Travel', displayOrder: 245 },
  { name: 'Couple Friendly Hotel', icon: '💑', section: 'Hotels & Travel', displayOrder: 246 },
  { name: 'Resort', icon: '🏖️', section: 'Hotels & Travel', displayOrder: 247 },
  { name: 'Guest House', icon: '🏠', section: 'Hotels & Travel', displayOrder: 248 },
  { name: 'Homestay', icon: '🏡', section: 'Hotels & Travel', displayOrder: 249 },
  { name: 'Hostel', icon: '🛏️', section: 'Hotels & Travel', displayOrder: 250 },
  { name: 'PG Accommodation', icon: '🏘️', section: 'Hotels & Travel', displayOrder: 251 },
  { name: 'Travel Agency', icon: '✈️', section: 'Hotels & Travel', displayOrder: 252 },
  { name: 'Tour Operator', icon: '🗺️', section: 'Hotels & Travel', displayOrder: 253 },
  { name: 'Taxi Service', icon: '🚕', section: 'Hotels & Travel', displayOrder: 254 },
  { name: 'Cab Booking', icon: '🚖', section: 'Hotels & Travel', displayOrder: 255 },
  { name: 'Car Rental', icon: '🚗', section: 'Hotels & Travel', displayOrder: 256 },
  { name: 'Bike Rental', icon: '🏍️', section: 'Hotels & Travel', displayOrder: 257 },

  // 🧴 BEAUTY, WELLNESS & FITNESS (321-420)
  { name: 'Beauty Parlour', icon: '💇', section: 'Beauty & Wellness', displayOrder: 321 },
  { name: 'Ladies Salon', icon: '💅', section: 'Beauty & Wellness', displayOrder: 322 },
  { name: 'Gents Salon', icon: '💈', section: 'Beauty & Wellness', displayOrder: 323 },
  { name: 'Unisex Salon', icon: '✂️', section: 'Beauty & Wellness', displayOrder: 324 },
  { name: 'Hair Salon', icon: '💇‍♀️', section: 'Beauty & Wellness', displayOrder: 325 },
  { name: 'Spa', icon: '🧖', section: 'Beauty & Wellness', displayOrder: 326 },
  { name: 'Massage Center', icon: '💆', section: 'Beauty & Wellness', displayOrder: 327 },
  { name: 'Yoga Center', icon: '🧘', section: 'Beauty & Wellness', displayOrder: 328 },
  { name: 'Meditation Center', icon: '🕉️', section: 'Beauty & Wellness', displayOrder: 329 },
  { name: 'Fitness Center', icon: '🏋️', section: 'Beauty & Wellness', displayOrder: 330 },
  { name: 'Gym', icon: '💪', section: 'Beauty & Wellness', displayOrder: 331 },
  { name: 'Zumba Studio', icon: '💃', section: 'Beauty & Wellness', displayOrder: 332 },
  { name: 'Weight Loss Center', icon: '⚖️', section: 'Beauty & Wellness', displayOrder: 333 },
  { name: 'Dietician', icon: '🥗', section: 'Beauty & Wellness', displayOrder: 334 },
  { name: 'Nutritionist', icon: '🍎', section: 'Beauty & Wellness', displayOrder: 335 },

  // 👗 FASHION, GARMENTS & ACCESSORIES (421-520)
  { name: 'Clothing Store', icon: '👔', section: 'Fashion & Apparel', displayOrder: 421 },
  { name: 'Garment Shop', icon: '👕', section: 'Fashion & Apparel', displayOrder: 422 },
  { name: 'Boutique', icon: '👗', section: 'Fashion & Apparel', displayOrder: 423 },
  { name: 'Mens Wear', icon: '👔', section: 'Fashion & Apparel', displayOrder: 424 },
  { name: 'Womens Wear', icon: '👗', section: 'Fashion & Apparel', displayOrder: 425 },
  { name: 'Kids Wear', icon: '👶', section: 'Fashion & Apparel', displayOrder: 426 },
  { name: 'Saree Shop', icon: '🥻', section: 'Fashion & Apparel', displayOrder: 427 },
  { name: 'Ethnic Wear', icon: '🥻', section: 'Fashion & Apparel', displayOrder: 428 },
  { name: 'Western Wear', icon: '👖', section: 'Fashion & Apparel', displayOrder: 429 },
  { name: 'Footwear Store', icon: '👞', section: 'Fashion & Apparel', displayOrder: 430 },
  { name: 'Shoe Store', icon: '👟', section: 'Fashion & Apparel', displayOrder: 431 },
  { name: 'Jewellery Store', icon: '💍', section: 'Fashion & Apparel', displayOrder: 432 },
  { name: 'Watch Store', icon: '⌚', section: 'Fashion & Apparel', displayOrder: 433 },
  { name: 'Bag Store', icon: '👜', section: 'Fashion & Apparel', displayOrder: 434 },
  { name: 'Sunglasses Shop', icon: '🕶️', section: 'Fashion & Apparel', displayOrder: 435 },
  { name: 'Tailor Shop', icon: '🧵', section: 'Fashion & Apparel', displayOrder: 436 },
  { name: 'Fabric Store', icon: '🧶', section: 'Fashion & Apparel', displayOrder: 437 },
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing categories (optional - remove if you want to keep existing)
    // await Category.deleteMany({});
    // console.log('🗑️  Cleared existing categories');

    // Insert categories
    let created = 0;
    let skipped = 0;

    for (const category of categories) {
      try {
        // Check if category already exists
        const existing = await Category.findOne({ name: category.name });
        
        if (existing) {
          console.log(`⏭️  Skipped: ${category.name} (already exists)`);
          skipped++;
          continue;
        }

        // Create new category
        await Category.create({
          name: category.name,
          icon: category.icon,
          description: `${category.name} in ${category.section}`,
          displayOrder: category.displayOrder,
          isActive: true,
        });
        
        console.log(`✅ Created: ${category.name}`);
        created++;
      } catch (error: any) {
        if (error.code === 11000) {
          console.log(`⏭️  Skipped: ${category.name} (duplicate)`);
          skipped++;
        } else {
          console.error(`❌ Error creating ${category.name}:`, error.message);
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Created: ${created} categories`);
    console.log(`⏭️  Skipped: ${skipped} categories`);
    console.log(`📝 Total: ${categories.length} categories processed`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

// Run seed function
seedCategories();

