# Google Distance Matrix API Setup

This guide explains how to set up Google Distance Matrix API for calculating distance and travel time between user location and shops.

## Features

- **Distance Calculation**: Shows distance in kilometers (KM) between user and shop
- **Travel Time**: Displays estimated travel time in minutes
- **Automatic Fallback**: Uses Haversine formula if API key is not configured

## Setup Steps

### 1. Enable Google Cloud Platform

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing (required for Distance Matrix API)

### 2. Enable Required APIs

Enable the following APIs in your Google Cloud project:

- ✅ **Distance Matrix API**
  - Go to [API Library](https://console.cloud.google.com/apis/library)
  - Search for "Distance Matrix API"
  - Click "Enable"

- ✅ **Maps JavaScript API** (if not already enabled)
  - Search for "Maps JavaScript API"
  - Click "Enable"

### 3. Create API Key

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. (Recommended) Restrict the API key:
   - Click on the API key to edit
   - Under "API restrictions", select "Restrict key"
   - Choose "Distance Matrix API" and "Maps JavaScript API"
   - Under "Application restrictions", you can restrict by HTTP referrer or IP

### 4. Add API Key to Environment Variables

Add the API key to your `.env.local` file:

```env
# Google Maps API Key (for Distance Matrix API)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

# OR use server-side only key
GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Note**: 
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is accessible on both client and server
- `GOOGLE_MAPS_API_KEY` is server-side only (more secure)

### 5. Restart Development Server

After adding the API key, restart your Next.js development server:

```bash
npm run dev
```

## API Endpoint

The distance and time calculation is handled by:

**Endpoint**: `/api/distance`

**Method**: `GET`

**Query Parameters**:
- `olat` - User latitude (origin)
- `olng` - User longitude (origin)
- `dlat` - Shop latitude (destination)
- `dlng` - Shop longitude (destination)

**Example Request**:
```
GET /api/distance?olat=25.5941&olng=85.1376&dlat=25.3176&dlng=82.9739
```

**Response**:
```json
{
  "distance": "234.5 km",
  "time": "4 hours 12 mins"
}
```

## Usage in Components

The `ShopCard` component automatically fetches distance and time when:
- User location is available (from browser geolocation)
- Shop has location coordinates

**Display Format**:
- 🔴 **Distance** (Red): Shows distance in KM
- 🔵 **Time** (Blue): Shows estimated travel time

## Fallback Behavior

If the Google Distance Matrix API key is not configured:
- The system automatically falls back to Haversine formula for distance calculation
- Time will show as "N/A"
- No errors will be displayed to users

## Pricing

Google Distance Matrix API pricing:
- **Free tier**: $200 credit per month
- **Per request**: $0.005 per element (1 origin + 1 destination = 1 element)
- See [Google Pricing](https://cloud.google.com/maps-platform/pricing) for details

## Troubleshooting

### API Key Not Working

1. Check if API key is correctly added to `.env.local`
2. Verify API key restrictions allow your domain/IP
3. Check if Distance Matrix API is enabled in Google Cloud Console
4. Verify billing is enabled on your Google Cloud project

### Distance/Time Not Showing

1. Ensure user location permission is granted
2. Check if shop has location coordinates in database
3. Check browser console for any errors
4. Verify API endpoint is accessible: `/api/distance`

### CORS Errors

If you see CORS errors, ensure:
- API key restrictions allow your domain
- You're using `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for client-side calls
- Or use server-side only `GOOGLE_MAPS_API_KEY` (recommended)

## Security Best Practices

1. **Restrict API Key**: Always restrict your API key to specific APIs and domains
2. **Use Server-Side Key**: Prefer `GOOGLE_MAPS_API_KEY` over `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. **Monitor Usage**: Set up billing alerts in Google Cloud Console
4. **Rate Limiting**: Consider implementing rate limiting for the `/api/distance` endpoint

## Support

For issues or questions:
- Check [Google Distance Matrix API Documentation](https://developers.google.com/maps/documentation/distance-matrix)
- Review [Google Cloud Console](https://console.cloud.google.com/) for API usage and errors

