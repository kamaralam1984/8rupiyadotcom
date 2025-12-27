/**
 * Justdial HTML Inspector
 * Fetches a Justdial page and saves HTML for inspection
 * 
 * Usage:
 * node scripts/inspect-justdial.js --url "https://www.justdial.com/Patna/Restaurants"
 */

const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');

const url = process.argv.find(arg => arg.startsWith('--url'))?.split('=')[1] || 
            process.argv[process.argv.indexOf('--url') + 1] || 
            'https://www.justdial.com/Patna/Restaurants';

async function inspectPage() {
  try {
    console.log(`📡 Fetching: ${url}\n`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 30000,
    });
    
    const $ = cheerio.load(response.data);
    
    // Save full HTML
    fs.writeFileSync('justdial-inspect.html', response.data);
    console.log('✅ Saved full HTML to: justdial-inspect.html\n');
    
    // Find common business listing patterns
    console.log('🔍 Analyzing HTML structure...\n');
    
    // Check for common class names
    const commonClasses = [
      'store-details', 'cntanr', 'resultbox', 'storebox',
      'lng_cont_name', 'cont_sw_addr', 'green-box',
      'rslts', 'rslt', 'jcn', 'mreinf'
    ];
    
    console.log('📊 Found class names:');
    commonClasses.forEach(className => {
      const count = $(`.${className}`).length;
      if (count > 0) {
        console.log(`   .${className}: ${count} elements`);
      }
    });
    
    // Find all links
    console.log('\n📊 Business links found:');
    $('a[href*="justdial.com"]').slice(0, 10).each((index, el) => {
      const $el = $(el);
      const href = $el.attr('href');
      const text = $el.text().trim();
      if (text && text.length > 5 && text.length < 100) {
        console.log(`   ${index + 1}. ${text}`);
        console.log(`      ${href}`);
      }
    });
    
    // Find images
    console.log('\n📊 Images found:');
    $('img').slice(0, 5).each((index, el) => {
      const $el = $(el);
      const src = $el.attr('src') || $el.attr('data-src');
      const alt = $el.attr('alt');
      if (src) {
        console.log(`   ${index + 1}. ${alt || 'No alt'}`);
        console.log(`      ${src.substring(0, 80)}...`);
      }
    });
    
    console.log('\n💡 Next steps:');
    console.log('   1. Open justdial-inspect.html in browser');
    console.log('   2. Inspect elements (F12 → Elements)');
    console.log('   3. Find class names for business listings');
    console.log('   4. Update selectors in extract-justdial-advanced.js\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

inspectPage();

