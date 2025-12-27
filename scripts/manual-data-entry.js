/**
 * Manual Business Data Entry Script
 * Alternative to web scraping - manually enter business data
 * 
 * Usage:
 * node scripts/manual-data-entry.js
 * 
 * This will create a JSON file that you can import to MongoDB
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function geocodeAddress(address) {
  try {
    const axios = require('axios');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': '8rupiya-business-extractor/1.0',
      },
    });
    
    if (response.data.length > 0) {
      return {
        latitude: response.data[0].lat,
        longitude: response.data[0].lon,
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error.message);
  }
  
  return { latitude: '', longitude: '' };
}

function extractPincode(address) {
  const pincodeRegex = /\b\d{6}\b/;
  const match = address.match(pincodeRegex);
  return match ? match[0] : '';
}

async function addBusiness() {
  console.log('\n📝 Enter Business Details:\n');
  
  const shop_name = await question('Shop Name: ');
  if (!shop_name.trim()) {
    console.log('❌ Shop name is required');
    return null;
  }
  
  const full_address = await question('Full Address: ');
  if (!full_address.trim()) {
    console.log('❌ Address is required');
    return null;
  }
  
  const city = await question('City (default: Patna): ') || 'Patna';
  const state = await question('State (default: Bihar): ') || 'Bihar';
  const category = await question('Category (default: Business): ') || 'Business';
  const phone_number = await question('Phone Number (optional): ') || '';
  const rating = await question('Rating (optional): ') || '';
  const website_url = await question('Website URL (optional): ') || '';
  const main_image_url = await question('Image URL (optional): ') || '';
  
  // Parse address
  const parts = full_address.split(',').map(p => p.trim());
  const area = parts.length > 1 ? parts[0] : '';
  const pincode = extractPincode(full_address);
  
  // Geocode
  console.log('\n📍 Geocoding address...');
  const coords = await geocodeAddress(full_address);
  
  const business = {
    shop_name: shop_name.trim(),
    main_image_url: main_image_url.trim(),
    full_address: full_address.trim(),
    area: area,
    city: city.trim(),
    state: state.trim(),
    pincode: pincode,
    latitude: coords.latitude,
    longitude: coords.longitude,
    phone_number: phone_number.trim(),
    category: category.trim(),
    rating: rating.trim(),
    website_url: website_url.trim(),
  };
  
  return business;
}

async function main() {
  console.log('🏪 Manual Business Data Entry\n');
  console.log('Enter business details one by one.');
  console.log('Press Enter without input to finish.\n');
  
  const businesses = [];
  let continueEntry = true;
  
  while (continueEntry) {
    const business = await addBusiness();
    
    if (business) {
      businesses.push(business);
      console.log(`\n✅ Business added: ${business.shop_name}`);
    }
    
    const more = await question('\nAdd another business? (y/n): ');
    continueEntry = more.toLowerCase() === 'y' || more.toLowerCase() === 'yes';
  }
  
  // Save to file
  const outputFile = 'manual-business-data.json';
  const outputPath = path.join(process.cwd(), outputFile);
  fs.writeFileSync(outputPath, JSON.stringify(businesses, null, 2), 'utf8');
  
  console.log(`\n✅ Saved ${businesses.length} businesses to ${outputFile}`);
  console.log(`💾 Import to MongoDB: node scripts/import-justdial-to-mongodb.js --file ${outputFile}\n`);
  
  rl.close();
}

main().catch(console.error);

