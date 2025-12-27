# Justdial Extraction Troubleshooting Guide

## Problem: 0 Businesses Extracted

### Why This Happens:

1. **JavaScript Rendering**: Justdial uses JavaScript to load content dynamically
2. **HTML Structure Changed**: Justdial may have updated their HTML structure
3. **Anti-Scraping**: Justdial may be blocking automated requests
4. **Incorrect Selectors**: CSS selectors don't match actual HTML

## Solutions:

### Solution 1: Use Puppeteer (Recommended)

Puppeteer uses a real browser, so it can handle JavaScript:

```bash
# Install Puppeteer
npm install puppeteer

# Run with Puppeteer
node scripts/extract-justdial-puppeteer.js --city "Patna" --category "Restaurants" --limit 5
```

### Solution 2: Inspect HTML Manually

1. **Open Justdial in Browser:**
   - Go to: https://www.justdial.com/Patna/Restaurants
   - Open Developer Tools (F12)
   - Go to Elements tab

2. **Find Business Listings:**
   - Right-click on a business name → Inspect
   - Note the class names and structure
   - Look for patterns like:
     - Container class (e.g., `.cntanr`, `.store-details`)
     - Name class (e.g., `.lng_cont_name`, `.jcn`)
     - Address class (e.g., `.cont_sw_addr`, `.mreinf`)

3. **Update Selectors:**
   - Open `scripts/extract-justdial-advanced.js`
   - Update selectors in `extractFromSearchPage` function
   - Test again

### Solution 3: Use Browser Extension

1. **Install Web Scraper Extension:**
   - Chrome: "Web Scraper" extension
   - Firefox: "Scraper" extension

2. **Create Scraper:**
   - Navigate to Justdial search page
   - Use extension to define selectors
   - Export data as JSON

### Solution 4: Manual Data Entry

For small datasets, manual entry might be faster:
- Use admin panel to add shops
- Or use MongoDB import with prepared JSON

## Debugging Steps:

### Step 1: Check HTML Structure

```bash
# Save HTML for inspection
node scripts/inspect-justdial.js --url "https://www.justdial.com/Patna/Restaurants"
```

Then open `justdial-inspect.html` in browser and inspect.

### Step 2: Test with Small Limit

```bash
# Test with just 1 business
node scripts/extract-justdial-advanced.js --city "Patna" --category "Restaurants" --limit 1
```

### Step 3: Check Network Requests

1. Open Justdial in browser
2. F12 → Network tab
3. Look for API endpoints that return JSON
4. Use those endpoints if available

### Step 4: Verify URL Format

Justdial URL format might be:
- `https://www.justdial.com/{City}/{Category}`
- `https://www.justdial.com/search?q={query}`
- `https://www.justdial.com/{City}/{Category}/nct-{number}`

Try different URL formats.

## Alternative: Use Google Places API

Instead of scraping Justdial, use Google Places API:

```javascript
// Example using Google Places API
const places = await fetch(
  `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+Patna&key=${API_KEY}`
);
```

## Quick Fix Checklist:

- [ ] Installed Puppeteer: `npm install puppeteer`
- [ ] Tried Puppeteer script
- [ ] Inspected HTML manually
- [ ] Updated selectors in script
- [ ] Checked for API endpoints
- [ ] Verified URL format
- [ ] Tested with small limit

## Need Help?

1. Check `justdial-debug.html` file (if generated)
2. Inspect actual Justdial page HTML
3. Update selectors based on real HTML structure
4. Consider using Puppeteer for JavaScript-heavy sites

