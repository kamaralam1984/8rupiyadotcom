# Google Places API Setup

## Steps to Get Google Places API Key

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create a Project:**
   - Click "Select a project" → "New Project"
   - Enter project name: "8rupiya"
   - Click "Create"

3. **Enable Places API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Places API"
   - Click "Enable"

4. **Create API Key:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key

5. **Restrict API Key (Recommended):**
   - Click on the created API key
   - Under "API restrictions", select "Restrict key"
   - Choose "Places API"
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain: `localhost:3000/*` (for development)
   - Add production domain: `yourdomain.com/*`
   - Click "Save"

6. **Add to .env.local:**
   ```env
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

## Features Enabled

✅ **Browser Location:** Automatically gets user's GPS location
✅ **Google Places Integration:** Fetches nearby shops from Google
✅ **Data Merging:** Combines MongoDB shops + Google Places
✅ **Paid Priority:** Paid shops always show on top
✅ **Smart Ranking:** Plan priority → Rank score → Distance

## How It Works

1. **Browser Location:**
   - User grants location permission
   - GPS coordinates are sent to API

2. **Dual Data Source:**
   - MongoDB: Your registered shops
   - Google Places: Nearby businesses from Google

3. **Merging Logic:**
   - Removes duplicates (same name + location)
   - Combines both sources into one list

4. **Sorting Priority:**
   1. Paid shops (MongoDB with plans) - TOP
   2. Plan priority (higher plans first)
   3. Rank score (calculated score)
   4. Distance (closer shops first)

## API Usage

The Google Places API has usage limits:
- **Free Tier:** $200 credit/month
- **Nearby Search:** $32 per 1000 requests
- **Recommended:** Enable billing alerts

## Testing

1. Open browser console
2. Check for location permission
3. Verify API calls in Network tab
4. Check console logs for shop counts:
   ```
   Loaded 20 shops (MongoDB: 5, Google: 15)
   ```

## Troubleshooting

### Error: "This API project is not authorized"
- Enable Places API in Google Cloud Console

### Error: "API key not valid"
- Check API key in .env.local
- Verify key restrictions allow your domain

### No Google shops showing
- Check API key is correct
- Verify Places API is enabled
- Check browser console for errors

### Location not working
- Check browser permissions
- Verify HTTPS (required for geolocation in production)
- Check browser console for errors

