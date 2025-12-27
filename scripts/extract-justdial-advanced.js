/**
 * Advanced Justdial Business Data Extraction Script
 * Uses Cheerio for HTML parsing (more reliable)
 * 
 * Install dependencies:
 * npm install cheerio axios
 * 
 * Usage:
 * node scripts/extract-justdial-advanced.js --city "Patna" --area "Boring Road" --category "Restaurants" --limit 50
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  city: 'Patna',
  area: '',
  category: 'Restaurants',
  limit: 50,
  delay: 3000, // 3 seconds delay between requests
  outputFile: 'justdial-data.json',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
};

// Parse command line arguments
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

// HTTP client with proper headers
const httpClient = axios.create({
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
  },
});

// Delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Geocode address
async function geocodeAddress(address) {
  if (!config.googleMapsApiKey) {
    return geocodeWithOSM(address);
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${config.googleMapsApiKey}`;
    
    const response = await httpClient.get(url);
    const data = response.data;
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat.toString(),
        longitude: location.lng.toString(),
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error.message);
  }
  
  return { latitude: '', longitude: '' };
}

// Geocode using OpenStreetMap
async function geocodeWithOSM(address) {
  try {
    await delay(1000); // Rate limit: 1 request per second
    
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
    
    const response = await httpClient.get(url, {
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
    console.error('OSM Geocoding error:', error.message);
  }
  
  return { latitude: '', longitude: '' };
}

// Extract pincode
function extractPincode(address) {
  const pincodeRegex = /\b\d{6}\b/;
  const match = address.match(pincodeRegex);
  return match ? match[0] : '';
}

// Parse address components
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

// Extract businesses from Justdial search page
async function extractFromSearchPage(url) {
  try {
    console.log(`📡 Fetching: ${url}`);
    await delay(config.delay);
    
    const response = await httpClient.get(url);
    const $ = cheerio.load(response.data);
    
    // Debug: Save HTML for inspection
    if (process.env.DEBUG) {
      fs.writeFileSync('justdial-debug.html', response.data);
      console.log('💾 Debug: Saved HTML to justdial-debug.html');
    }
    
    const businesses = [];
    
    // Justdial HTML structure - Updated selectors
    // Try multiple selector patterns
    const selectors = [
      '.store-details',
      '.cntanr',
      '.resultbox',
      '.cntanr[data-id]',
      '.storebox',
      '[data-href*="justdial.com"]',
      '.rslts',
      '.rslt',
    ];
    
    let found = false;
    
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
        found = true;
        
        elements.each((index, element) => {
          try {
            const $el = $(element);
            
            // Extract business name - try multiple patterns
            const name = 
              $el.find('.lng_cont_name').first().text().trim() ||
              $el.find('.store-name').first().text().trim() ||
              $el.find('h3 a').first().text().trim() ||
              $el.find('h4 a').first().text().trim() ||
              $el.find('.jcn').first().text().trim() ||
              $el.find('[data-name]').first().attr('data-name') ||
              $el.find('a[href*="/"]').first().text().trim();
            
            if (!name) {
              // Debug: log element HTML if name not found
              if (process.env.DEBUG) {
                console.log('⚠️  No name found in element:', $el.html().substring(0, 200));
              }
              return;
            }
            
            // Extract address
            const address = 
              $el.find('.cont_sw_addr').first().text().trim() ||
              $el.find('.address').first().text().trim() ||
              $el.find('.mreinf').first().text().trim() ||
              $el.find('[data-address]').first().attr('data-address') ||
              $el.find('.cont_fl_addr').first().text().trim();
            
            // Extract phone
            const phone = 
              $el.find('a[href^="tel:"]').first().attr('href')?.replace('tel:', '') ||
              $el.find('.contact-info').first().text().trim() ||
              $el.find('.phone').first().text().trim() ||
              $el.find('[data-phone]').first().attr('data-phone') ||
              $el.find('.mobilesv').first().text().trim();
            
            // Extract rating
            const rating = 
              $el.find('.green-box').first().text().trim() ||
              $el.find('.rating').first().text().trim() ||
              $el.find('.star-rating').first().text().trim() ||
              $el.find('[data-rating]').first().attr('data-rating') ||
              $el.find('.rtng').first().text().trim();
            
            // Extract image
            const image = 
              $el.find('img').first().attr('src') ||
              $el.find('img').first().attr('data-src') ||
              $el.find('img').first().attr('data-lazy-src') ||
              $el.find('img').first().attr('data-original') ||
              '';
            
            // Extract website
            const website = 
              $el.find('a[href^="http"]').not('a[href*="justdial"]').first().attr('href') ||
              '';
            
            if (name && address) {
              businesses.push({
                shop_name: name,
                main_image_url: image,
                full_address: address,
                phone_number: phone,
                rating: rating,
                website_url: website,
              });
            }
          } catch (err) {
            console.error('Error parsing business:', err.message);
          }
        });
        
        break; // Use first working selector
      }
    }
    
    if (!found) {
      console.log('⚠️  No business elements found. Trying to find any links...');
      // Fallback: Try to find any business links
      $('a[href*="justdial.com"]').each((index, element) => {
        const $el = $(element);
        const href = $el.attr('href');
        const text = $el.text().trim();
        if (text && href && text.length > 5 && text.length < 100) {
          console.log(`Found potential business link: ${text} - ${href}`);
        }
      });
    }
    
    return businesses;
  } catch (error) {
    console.error('Error fetching page:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    return [];
  }
}

// Main extraction function
async function extractBusinesses() {
  console.log('\n🔍 Starting Justdial Business Extraction (Advanced)...\n');
  console.log('Configuration:');
  console.log(`  City: ${config.city}`);
  console.log(`  Area: ${config.area || 'All areas'}`);
  console.log(`  Category: ${config.category}`);
  console.log(`  Limit: ${config.limit}`);
  console.log(`  Output: ${config.outputFile}\n`);
  
  console.log('⚠️  WARNING: Web scraping may violate Terms of Service.');
  console.log('⚠️  Use responsibly with proper rate limiting.\n');
  
  const allBusinesses = [];
  const seenNames = new Set();
  
  try {
    // Build search URL
    const searchQuery = `${config.category} in ${config.area ? config.area + ', ' : ''}${config.city}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    
    // Justdial search URL format
    const baseUrl = 'https://www.justdial.com';
    const searchUrl = `${baseUrl}/search?q=${encodedQuery}`;
    
    // Extract from search results
    const businesses = await extractFromSearchPage(searchUrl);
    
    console.log(`📝 Processing ${businesses.length} businesses...\n`);
    
    for (const business of businesses) {
      if (seenNames.has(business.shop_name)) {
        continue;
      }
      
      seenNames.add(business.shop_name);
      
      // Parse address
      const addressParts = parseAddressComponents(business.full_address);
      
      // Geocode
      if (!business.latitude || !business.longitude) {
        console.log(`📍 Geocoding: ${business.shop_name}...`);
        const coords = await geocodeAddress(business.full_address);
        business.latitude = coords.latitude;
        business.longitude = coords.longitude;
      }
      
      // Build final object
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
      
      allBusinesses.push(businessData);
      console.log(`✅ [${allBusinesses.length}/${config.limit}] ${businessData.shop_name}`);
      
      if (allBusinesses.length >= config.limit) {
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Extraction error:', error.message);
  }
  
  // Save to file
  const outputPath = path.join(process.cwd(), config.outputFile);
  fs.writeFileSync(outputPath, JSON.stringify(allBusinesses, null, 2), 'utf8');
  
  console.log(`\n✅ Extraction complete!`);
  console.log(`📊 Total businesses: ${allBusinesses.length}`);
  console.log(`💾 Saved to: ${outputPath}\n`);
  
  return allBusinesses;
}

// Run if called directly
if (require.main === module) {
  extractBusinesses().catch(console.error);
}

module.exports = { extractBusinesses, geocodeAddress, parseAddressComponents };

