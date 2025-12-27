# Justdial Business Data Extraction Guide

## ⚠️ Important Legal Notice

**Before using these scripts:**
- Web scraping may violate Justdial's Terms of Service
- Always check and respect `robots.txt`
- Use rate limiting to avoid overloading servers
- Consider using official APIs if available
- Get proper authorization before scraping
- These scripts are for educational/development purposes only

## 📋 Setup Instructions

### Step 1: Install Dependencies

```bash
npm install cheerio axios
```

### Step 2: Configure Environment

Add to `.env.local`:
```env
MONGODB_URI=your_mongodb_connection_string
GOOGLE_MAPS_API_KEY=your_google_maps_api_key  # Optional, for geocoding
```

### Step 3: Run Extraction

**Basic Script (no dependencies):**
```bash
node scripts/extract-justdial.js --city "Patna" --area "Boring Road" --category "Restaurants" --limit 50
```

**Advanced Script (with Cheerio - recommended):**
```bash
node scripts/extract-justdial-advanced.js --city "Patna" --area "Boring Road" --category "Restaurants" --limit 50
```

### Step 4: Import to MongoDB

```bash
node scripts/import-justdial-to-mongodb.js --file justdial-data.json
```

## 📝 Command Line Options

- `--city`: City name (default: "Patna")
- `--area`: Area/locality (optional)
- `--category`: Business category (default: "Restaurants")
- `--limit`: Number of businesses to extract (default: 50)
- `--output`: Output JSON file name (default: "justdial-data.json")

## 🔧 Customization

### Adjusting HTML Selectors

Justdial's HTML structure may change. To update selectors:

1. Open Justdial search page in browser
2. Inspect HTML (F12 → Elements)
3. Find class names for:
   - Business name
   - Address
   - Phone number
   - Rating
   - Image
4. Update selectors in `extract-justdial-advanced.js`

### Example Selector Updates

```javascript
// In extractFromSearchPage function, update these:
const name = $el.find('.lng_cont_name').first().text().trim();
const address = $el.find('.cont_sw_addr').first().text().trim();
// ... etc
```

## 📊 Output Format

The script generates JSON in this format:

```json
[
  {
    "shop_name": "Restaurant Name",
    "main_image_url": "https://...",
    "full_address": "Address, Area, City, State - Pincode",
    "area": "Area Name",
    "city": "City Name",
    "state": "Bihar",
    "pincode": "800001",
    "latitude": "25.5941",
    "longitude": "85.1376",
    "phone_number": "+91-1234567890",
    "category": "Restaurants",
    "rating": "4.5",
    "website_url": "https://..."
  }
]
```

## 🗺️ Geocoding

The script automatically geocodes addresses:

1. **Google Maps API** (if API key provided):
   - More accurate
   - Requires API key
   - Has usage limits

2. **OpenStreetMap Nominatim** (fallback):
   - Free, no API key needed
   - Rate limit: 1 request/second
   - Less accurate but sufficient

## 🚨 Troubleshooting

### No businesses extracted?

1. **Check HTML structure:**
   - Justdial may have changed their HTML
   - Inspect page and update selectors

2. **Check rate limiting:**
   - Increase delay between requests
   - Justdial may be blocking requests

3. **Check network:**
   - Ensure internet connection
   - Check if Justdial is accessible

### Geocoding not working?

1. **Google Maps API:**
   - Verify API key is correct
   - Check API quota/limits
   - Enable Geocoding API in Google Cloud Console

2. **OpenStreetMap:**
   - Wait 1 second between requests
   - Check if address is valid

### Import errors?

1. **MongoDB connection:**
   - Verify MONGODB_URI is correct
   - Check MongoDB is running

2. **Data validation:**
   - Ensure required fields are present
   - Check data format matches schema

## 📚 Alternative Approaches

### 1. Manual Data Entry
- More accurate
- Time-consuming
- Better quality control

### 2. Official APIs
- Check if Justdial offers API
- More reliable
- May require payment

### 3. Data Providers
- Purchase business listings
- Guaranteed quality
- Legal compliance

## ✅ Best Practices

1. **Rate Limiting:**
   - Use delays between requests (3+ seconds)
   - Don't overload servers

2. **Error Handling:**
   - Handle network errors gracefully
   - Log errors for debugging

3. **Data Validation:**
   - Validate extracted data
   - Remove duplicates
   - Clean addresses

4. **Respect ToS:**
   - Check robots.txt
   - Use reasonable request rates
   - Don't scrape personal data

## 🔄 Workflow

1. **Extract:** Run extraction script
2. **Review:** Check generated JSON file
3. **Clean:** Remove duplicates, fix errors
4. **Import:** Import to MongoDB
5. **Verify:** Check data in database
6. **Approve:** Admin approves shops in panel

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify HTML selectors are correct
3. Test with small limit first (--limit 5)
4. Review generated JSON file

---

**Remember:** Always use web scraping responsibly and legally!

