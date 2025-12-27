/**
 * Justdial Business Data Extraction Script
 * 
 * ⚠️ IMPORTANT LEGAL NOTICE:
 * - This script is for educational/development purposes only
 * - Web scraping may violate Justdial's Terms of Service
 * - Always check and respect robots.txt
 * - Use rate limiting to avoid overloading servers
 * - Consider using official APIs if available
 * - Get proper authorization before scraping
 * 
 * Usage:
 * node scripts/extract-justdial.js --city "Patna" --area "Boring Road" --category "Restaurants" --limit 50
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  city: 'Patna',
  area: '',
  category: 'Restaurants',
  limit: 50,
  delay: 2000, // 2 seconds delay between requests (be respectful)
  outputFile: 'justdial-data.json',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '', // For geocoding
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

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...options.headers,
      },
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data, headers: res.headers });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Geocode address using Google Maps API
async function geocodeAddress(address) {
  if (!config.googleMapsApiKey) {
    console.log('⚠️  Google Maps API key not provided. Using OpenStreetMap...');
    return geocodeWithOSM(address);
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${config.googleMapsApiKey}`;
    
    const response = await makeRequest(url);
    const data = JSON.parse(response.data);
    
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

// Geocode using OpenStreetMap Nominatim (free, no API key needed)
async function geocodeWithOSM(address) {
  try {
    // Add delay to respect rate limits (1 request per second)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
    
    const response = await makeRequest(url, {
      headers: {
        'User-Agent': '8rupiya-business-extractor/1.0',
      },
    });
    
    const data = JSON.parse(response.data);
    
    if (data.length > 0) {
      return {
        latitude: data[0].lat,
        longitude: data[0].lon,
      };
    }
  } catch (error) {
    console.error('OSM Geocoding error:', error.message);
  }
  
  return { latitude: '', longitude: '' };
}

// Extract pincode from address
function extractPincode(address) {
  const pincodeRegex = /\b\d{6}\b/;
  const match = address.match(pincodeRegex);
  return match ? match[0] : '';
}

// Parse area, city, state from address
function parseAddressComponents(fullAddress) {
  const parts = fullAddress.split(',').map(p => p.trim());
  
  let area = '';
  let city = config.city || '';
  let state = 'Bihar';
  let pincode = extractPincode(fullAddress);
  
  // Try to extract area (usually first part before city)
  if (parts.length > 1) {
    area = parts[0];
  }
  
  // Try to find city in address
  const cityKeywords = ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'];
  for (const keyword of cityKeywords) {
    if (fullAddress.includes(keyword)) {
      city = keyword;
      break;
    }
  }
  
  return { area, city, state, pincode };
}

// Extract business data from Justdial HTML (simplified parser)
function extractBusinessData(html) {
  const businesses = [];
  
  // This is a simplified example - Justdial's HTML structure may vary
  // You'll need to inspect their actual HTML and adjust selectors
  
  // Example regex patterns (adjust based on actual HTML structure)
  const nameRegex = /<span[^>]*class="[^"]*lng_cont_name[^"]*"[^>]*>([^<]+)<\/span>/gi;
  const addressRegex = /<span[^>]*class="[^"]*cont_sw_addr[^"]*"[^>]*>([^<]+)<\/span>/gi;
  const phoneRegex /<a[^>]*href="tel:([^"]+)"[^>]*>([^<]+)<\/a>/gi;
  const ratingRegex = /<span[^>]*class="[^"]*green-box[^"]*"[^>]*>([^<]+)<\/span>/gi;
  
  // Note: This is a placeholder - actual implementation requires
  // inspecting Justdial's HTML structure and using proper parsing
  
  return businesses;
}

// Main extraction function
async function extractBusinesses() {
  console.log('\n🔍 Starting Justdial Business Extraction...\n');
  console.log('Configuration:');
  console.log(`  City: ${config.city}`);
  console.log(`  Area: ${config.area || 'All areas'}`);
  console.log(`  Category: ${config.category}`);
  console.log(`  Limit: ${config.limit}`);
  console.log(`  Output: ${config.outputFile}\n`);
  
  console.log('⚠️  WARNING: Web scraping may violate Terms of Service.');
  console.log('⚠️  This script includes rate limiting. Use responsibly.\n');
  
  const businesses = [];
  const seenNames = new Set();
  
  try {
    // Build Justdial search URL
    // Note: Justdial's URL structure may vary - adjust as needed
    const searchQuery = `${config.category} in ${config.area ? config.area + ', ' : ''}${config.city}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    
    // Example URL structure (adjust based on actual Justdial URLs)
    const baseUrl = 'https://www.justdial.com';
    const searchUrl = `${baseUrl}/search?q=${encodedQuery}`;
    
    console.log(`📡 Fetching: ${searchUrl}\n`);
    
    // Make request with delay
    await new Promise(resolve => setTimeout(resolve, config.delay));
    
    const response = await makeRequest(searchUrl);
    
    if (response.statusCode !== 200) {
      console.error(`❌ Error: HTTP ${response.statusCode}`);
      return;
    }
    
    // Parse HTML and extract businesses
    // Note: This requires proper HTML parsing library like cheerio
    // For now, this is a template structure
    
    console.log('📝 Extracting business data...\n');
    
    // Placeholder: Extract businesses from HTML
    // You'll need to use cheerio or similar library for actual parsing
    const extracted = extractBusinessData(response.data);
    
    for (const business of extracted) {
      if (seenNames.has(business.shop_name)) {
        continue; // Skip duplicates
      }
      
      seenNames.add(business.shop_name);
      
      // Parse address components
      const addressParts = parseAddressComponents(business.full_address);
      
      // Geocode if coordinates not available
      if (!business.latitude || !business.longitude) {
        console.log(`📍 Geocoding: ${business.shop_name}...`);
        const coords = await geocodeAddress(business.full_address);
        business.latitude = coords.latitude;
        business.longitude = coords.longitude;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
      }
      
      // Build final business object
      const businessData = {
        shop_name: business.shop_name || '',
        main_image_url: business.main_image_url || '',
        full_address: business.full_address || '',
        area: addressParts.area || business.area || '',
        city: addressParts.city || business.city || config.city,
        state: addressParts.state || 'Bihar',
        pincode: addressParts.pincode || business.pincode || '',
        latitude: business.latitude || '',
        longitude: business.longitude || '',
        phone_number: business.phone_number || '',
        category: business.category || config.category,
        rating: business.rating || '',
        website_url: business.website_url || '',
      };
      
      businesses.push(businessData);
      console.log(`✅ Extracted: ${businessData.shop_name}`);
      
      if (businesses.length >= config.limit) {
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Extraction error:', error.message);
  }
  
  // Save to file
  const outputPath = path.join(process.cwd(), config.outputFile);
  fs.writeFileSync(outputPath, JSON.stringify(businesses, null, 2));
  
  console.log(`\n✅ Extraction complete!`);
  console.log(`📊 Total businesses extracted: ${businesses.length}`);
  console.log(`💾 Saved to: ${outputPath}\n`);
  
  return businesses;
}

// Run extraction
if (require.main === module) {
  extractBusinesses().catch(console.error);
}

module.exports = { extractBusinesses, geocodeAddress, parseAddressComponents };

