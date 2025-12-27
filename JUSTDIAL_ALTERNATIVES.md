# Justdial Extraction - Alternative Solutions

## Problem: Web Scraping Not Working

Justdial uses:
- JavaScript to load content dynamically
- Anti-scraping measures
- Complex HTML structure
- May block automated requests

## ✅ Alternative Solutions:

### Solution 1: Manual Data Entry (Recommended for Small Datasets)

**Interactive Entry:**
```bash
node scripts/manual-data-entry.js
```

**Bulk Import from JSON:**
1. Create/edit `bulk-import-template.json`
2. Add your business data
3. Import: `node scripts/import-justdial-to-mongodb.js --file bulk-import-template.json`

### Solution 2: Use Google Places API (Better Alternative)

Google Places API provides structured business data:

```javascript
// Example: Get restaurants in Patna
const response = await fetch(
  `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+Patna&key=${API_KEY}`
);
```

**Advantages:**
- Official API (legal)
- Structured data
- Includes coordinates
- More reliable

### Solution 3: Use Admin Panel

1. Login to admin panel
2. Go to Shops → Add New Shop
3. Enter business details manually
4. Approve shops

### Solution 4: CSV Import

1. Create CSV file with business data
2. Convert to JSON
3. Import to MongoDB

## 📝 Quick Manual Entry Template

Create a JSON file with this structure:

```json
[
  {
    "shop_name": "Business Name",
    "full_address": "Complete Address, Area, City, State - Pincode",
    "city": "Patna",
    "state": "Bihar",
    "category": "Restaurants",
    "phone_number": "+91-XXXXXXXXXX",
    "rating": "4.5"
  }
]
```

Then import:
```bash
node scripts/import-justdial-to-mongodb.js --file your-data.json
```

## 🔧 If You Still Want to Scrape:

1. **Use Browser Extension:**
   - Install "Web Scraper" (Chrome)
   - Manually scrape a few pages
   - Export as JSON

2. **Use Selenium/Playwright:**
   - More powerful than Puppeteer
   - Better for complex sites

3. **Hire a Developer:**
   - Custom scraping solution
   - Handle anti-scraping measures

## 💡 Recommendation:

For Bihar businesses, I recommend:
1. **Manual entry** for important/verified businesses
2. **Google Places API** for bulk data
3. **Admin panel** for ongoing additions

This ensures:
- ✅ Data quality
- ✅ Legal compliance
- ✅ Better accuracy
- ✅ No blocking issues

