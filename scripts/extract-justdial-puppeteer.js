/**
 * Justdial Business Data Extraction using Puppeteer (Handles JavaScript)
 * 
 * Install: npm install puppeteer
 * 
 * Usage:
 * node scripts/extract-justdial-puppeteer.js --city "Patna" --category "Restaurants" --limit 50
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  city: 'Patna',
  area: '',
  category: 'Restaurants',
  limit: 50,
  delay: 3000,
  outputFile: 'justdial-data.json',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
};

// Parse arguments
process.argv.forEach((arg, index) => {
  if (arg === '--city' && process.argv[index + 1]) {
    config.city = process.argv[index + 1];
  }
  if (arg === '--area' && process.argv[index + 1]) {
    config.area = process.argv[index + 1];
  }
  if (arg === '--category' && process.argv[index + 1]) {
    config.category = process.argv[index + 1];
  }
  if (arg === '--limit' && process.argv[index + 1]) {
    config.limit = parseInt(process.argv[index + 1]);
  }
  if (arg === '--output' && process.argv[index + 1]) {
    config.outputFile = process.argv[index + 1];
  }
});

// Geocode using OpenStreetMap
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

// Extract pincode
function extractPincode(address) {
  const pincodeRegex = /\b\d{6}\b/;
  const match = address.match(pincodeRegex);
  return match ? match[0] : '';
}

// Parse address
function parseAddressComponents(fullAddress) {
  const parts = fullAddress.split(',').map(p => p.trim());
  let area = '';
  let city = config.city || '';
  let state = 'Bihar';
  let pincode = extractPincode(fullAddress);
  
  if (parts.length > 1) {
    area = parts[0];
  }
  
  const cityKeywords = ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Purnia', 'Katihar'];
  for (const keyword of cityKeywords) {
    if (fullAddress.includes(keyword)) {
      city = keyword;
      break;
    }
  }
  
  return { area, city, state, pincode };
}

// Main extraction
async function extractBusinesses() {
  console.log('\n🔍 Starting Justdial Extraction (Puppeteer)...\n');
  console.log('Configuration:');
  console.log(`  City: ${config.city}`);
  console.log(`  Area: ${config.area || 'All areas'}`);
  console.log(`  Category: ${config.category}`);
  console.log(`  Limit: ${config.limit}\n`);
  
  let browser;
  const businesses = [];
  const seenNames = new Set();
  
  try {
    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Build URL - Try different URL formats
    let url;
    if (config.area) {
      // Format: /City/Area/Category
      url = `https://www.justdial.com/${config.city}/${config.area}/${config.category}`;
    } else {
      // Format: /City/Category
      url = `https://www.justdial.com/${config.city}/${config.category}`;
    }
    
    console.log(`📡 Navigating to: ${url}\n`);
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
    });
    
    // Navigate and wait for content
    try {
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    } catch (error) {
      console.log('⚠️  Navigation error, trying alternative URL...');
      // Try alternative URL format
      const altUrl = `https://www.justdial.com/${config.city}/${config.category}/nct-10000000`;
      await page.goto(altUrl, { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    }
    
    // Wait for business listings to load
    console.log('⏳ Waiting for content to load...');
    await page.waitForTimeout(5000);
    
    // Try to find business listings
    const businessesData = await page.evaluate(() => {
      const results = [];
      
      // Try multiple selector patterns
      const selectors = [
        '.cntanr',
        '.store-details',
        '.resultbox',
        '[data-href*="justdial.com"]',
        '.rslts .rslt',
      ];
      
      let elements = [];
      for (const selector of selectors) {
        elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} elements with: ${selector}`);
          break;
        }
      }
      
      elements.forEach((el, index) => {
        try {
          // Extract name
          const nameEl = el.querySelector('.lng_cont_name, .store-name, h3 a, h4 a, .jcn');
          const name = nameEl ? nameEl.textContent.trim() : '';
          
          // Extract address
          const addrEl = el.querySelector('.cont_sw_addr, .address, .mreinf, [data-address]');
          const address = addrEl ? addrEl.textContent.trim() : '';
          
          // Extract phone
          const phoneEl = el.querySelector('a[href^="tel:"], .mobilesv');
          const phone = phoneEl ? (phoneEl.getAttribute('href')?.replace('tel:', '') || phoneEl.textContent.trim()) : '';
          
          // Extract rating
          const ratingEl = el.querySelector('.green-box, .rtng, [data-rating]');
          const rating = ratingEl ? ratingEl.textContent.trim() : '';
          
          // Extract image
          const imgEl = el.querySelector('img');
          const image = imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '') : '';
          
          // Extract website
          const websiteEl = el.querySelector('a[href^="http"]:not([href*="justdial"])');
          const website = websiteEl ? websiteEl.getAttribute('href') : '';
          
          if (name && address) {
            results.push({
              shop_name: name,
              main_image_url: image,
              full_address: address,
              phone_number: phone,
              rating: rating,
              website_url: website,
            });
          }
        } catch (err) {
          console.error('Error parsing element:', err);
        }
      });
      
      return results;
    });
    
    console.log(`📝 Found ${businessesData.length} businesses in HTML\n`);
    
    // Process businesses
    for (const business of businessesData) {
      if (seenNames.has(business.shop_name)) continue;
      seenNames.add(business.shop_name);
      
      const addressParts = parseAddressComponents(business.full_address);
      
      // Geocode
      if (!business.latitude || !business.longitude) {
        console.log(`📍 Geocoding: ${business.shop_name}...`);
        const coords = await geocodeAddress(business.full_address);
        business.latitude = coords.latitude;
        business.longitude = coords.longitude;
      }
      
      const businessData = {
        shop_name: business.shop_name || '',
        main_image_url: business.main_image_url || '',
        full_address: business.full_address || '',
        area: addressParts.area || '',
        city: addressParts.city || config.city,
        state: addressParts.state || 'Bihar',
        pincode: addressParts.pincode || '',
        latitude: business.latitude || '',
        longitude: business.longitude || '',
        phone_number: business.phone_number || '',
        category: business.category || config.category,
        rating: business.rating || '',
        website_url: business.website_url || '',
      };
      
      businesses.push(businessData);
      console.log(`✅ [${businesses.length}/${config.limit}] ${businessData.shop_name}`);
      
      if (businesses.length >= config.limit) break;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Save
  const outputPath = path.join(process.cwd(), config.outputFile);
  fs.writeFileSync(outputPath, JSON.stringify(businesses, null, 2), 'utf8');
  
  console.log(`\n✅ Extraction complete!`);
  console.log(`📊 Total: ${businesses.length}`);
  console.log(`💾 Saved to: ${outputPath}\n`);
  
  return businesses;
}

// Run
if (require.main === module) {
  extractBusinesses().catch(console.error);
}

module.exports = { extractBusinesses };

