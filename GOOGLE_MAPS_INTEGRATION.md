# 🗺️ Enhanced Google Maps Integration

Complete Google Maps API integration for 8Rupiya platform with advanced features.

---

## 📋 Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Core Features](#core-features)
3. [API Functions](#api-functions)
4. [Usage Examples](#usage-examples)
5. [Utility Functions](#utility-functions)
6. [GOLU Integration](#golu-integration)

---

## 🔧 Setup & Configuration

### Environment Variables

Add to `.env.local`:

```env
# Google Maps API Key (Required)
GOOGLE_MAPS_API_KEY=your_actual_api_key_here

# Public key for client-side (optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_public_key_here
```

### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - ✅ Maps JavaScript API
   - ✅ Geocoding API
   - ✅ Distance Matrix API
   - ✅ Directions API
   - ✅ Places API
   - ✅ Maps Static API
4. Create API key with restrictions
5. Add to `.env.local`

---

## 🚀 Core Features

### 1. **Geocoding & Reverse Geocoding**
```typescript
// Get location details from address
const location = await getLocationDetails('Patna Railway Station');

// Get address from coordinates
const address = await reverseGeocode(25.5941, 85.1376);
```

### 2. **Distance & Duration Calculation**
```typescript
// Calculate distance with multiple travel modes
const distance = await calculateDistance(
  'Patna',
  'Gandhi Maidan',
  'driving' // or 'walking', 'bicycling', 'transit'
);
```

### 3. **Turn-by-Turn Directions**
```typescript
// Get detailed route with steps
const route = await getDirections(
  'Fraser Road, Patna',
  'Patna Junction',
  'walking',
  true // alternatives
);
```

### 4. **Nearby Places Search**
```typescript
// Find nearby restaurants
const places = await searchNearbyPlaces(
  { lat: 25.5941, lng: 85.1376 },
  'restaurant',
  5000, // radius in meters
  'biryani' // optional keyword
);
```

### 5. **Place Details**
```typescript
// Get complete place information
const details = await getPlaceDetails('ChIJ...');
```

### 6. **Autocomplete**
```typescript
// Search suggestions as user types
const suggestions = await autocompletePlaces(
  'Patna station',
  { lat: 25.5941, lng: 85.1376 }
);
```

### 7. **Cab Fare Estimation**
```typescript
// Estimate taxi/cab fare
const fare = await estimateCabFare(
  'Patna Junction',
  'Patliputra',
  'sedan' // or 'mini', 'suv'
);
```

---

## 📚 API Functions Reference

### `getLocationDetails(place: string)`

**Purpose:** Convert address to coordinates and get detailed location info

**Parameters:**
- `place` (string): Address or place name

**Returns:**
```typescript
{
  formattedAddress: string,
  latitude: number,
  longitude: number,
  placeId: string,
  locationType: string,
  viewport: object,
  addressComponents: {
    city?: string,
    state?: string,
    country?: string,
    pincode?: string
  },
  types: string[]
}
```

**Example:**
```typescript
const location = await getLocationDetails('Gandhi Maidan, Patna');
console.log(location.latitude, location.longitude);
```

---

### `reverseGeocode(lat: number, lng: number)`

**Purpose:** Get address from coordinates

**Parameters:**
- `lat` (number): Latitude
- `lng` (number): Longitude

**Returns:**
```typescript
{
  formattedAddress: string,
  placeId: string,
  addressComponents: array
}
```

**Example:**
```typescript
const address = await reverseGeocode(25.5941, 85.1376);
console.log(address.formattedAddress);
```

---

### `calculateDistance(origin, destination, mode)`

**Purpose:** Calculate distance and duration between two points

**Parameters:**
- `origin` (string | {lat, lng}): Starting point
- `destination` (string | {lat, lng}): End point
- `mode` ('driving' | 'walking' | 'bicycling' | 'transit'): Travel mode

**Returns:**
```typescript
{
  distance: string, // "5.2 km"
  duration: string, // "15 mins"
  distanceValue: number, // 5200 (meters)
  durationValue: number, // 900 (seconds)
  fare?: object // for transit
}
```

**Example:**
```typescript
const dist = await calculateDistance(
  'Patna Junction',
  'Gandhi Maidan',
  'driving'
);
console.log(dist.distance, dist.duration);
```

---

### `getDirections(origin, destination, mode, alternatives)`

**Purpose:** Get turn-by-turn directions with route details

**Parameters:**
- `origin` (string): Start address
- `destination` (string): End address
- `mode` ('driving' | 'walking' | 'bicycling' | 'transit'): Travel mode
- `alternatives` (boolean): Show alternative routes

**Returns:**
```typescript
{
  routes: [{
    summary: string,
    distance: string,
    duration: string,
    startAddress: string,
    endAddress: string,
    steps: [{
      instruction: string,
      distance: string,
      duration: string,
      maneuver: string
    }],
    polyline: string // encoded route path
  }],
  status: string
}
```

**Example:**
```typescript
const route = await getDirections(
  'Fraser Road',
  'Patna Junction',
  'walking',
  false
);

route.routes[0].steps.forEach((step, i) => {
  console.log(`${i + 1}. ${step.instruction} (${step.distance})`);
});
```

---

### `searchNearbyPlaces(location, type, radius, keyword)`

**Purpose:** Find nearby places of specific type

**Parameters:**
- `location` ({lat, lng}): Center point
- `type` (string): Place type (restaurant, atm, hospital, etc.)
- `radius` (number): Search radius in meters (default: 5000)
- `keyword` (string): Optional search keyword

**Returns:**
```typescript
[{
  placeId: string,
  name: string,
  address: string,
  rating: number,
  userRatingsTotal: number,
  priceLevel: number,
  types: string[],
  location: {lat, lng},
  openNow: boolean,
  photos: [{
    reference: string,
    width: number,
    height: number
  }]
}]
```

**Example:**
```typescript
const restaurants = await searchNearbyPlaces(
  { lat: 25.5941, lng: 85.1376 },
  'restaurant',
  2000,
  'biryani'
);

restaurants.forEach(place => {
  console.log(`${place.name} - Rating: ${place.rating}/5`);
});
```

---

### `getPlaceDetails(placeId: string)`

**Purpose:** Get comprehensive details about a specific place

**Parameters:**
- `placeId` (string): Google Place ID

**Returns:**
```typescript
{
  name: string,
  address: string,
  phone: string,
  website: string,
  rating: number,
  location: {lat, lng},
  openingHours: string[],
  isOpen: boolean,
  reviews: [{
    author: string,
    rating: number,
    text: string,
    time: number
  }],
  photos: array,
  types: string[]
}
```

**Example:**
```typescript
const details = await getPlaceDetails('ChIJdR6eCk7Ei...');
console.log(details.name, details.phone, details.rating);
```

---

### `autocompletePlaces(input, location)`

**Purpose:** Get place suggestions as user types

**Parameters:**
- `input` (string): User's search query
- `location` ({lat, lng}): Optional location for bias

**Returns:**
```typescript
[{
  description: string,
  placeId: string,
  mainText: string,
  secondaryText: string,
  types: string[]
}]
```

**Example:**
```typescript
const suggestions = await autocompletePlaces('Patna station');
suggestions.forEach(s => console.log(s.description));
```

---

### `estimateCabFare(origin, destination, cabType)`

**Purpose:** Estimate taxi/cab fare for a journey

**Parameters:**
- `origin` (string): Start location
- `destination` (string): End location
- `cabType` ('mini' | 'sedan' | 'suv'): Vehicle type

**Returns:**
```typescript
{
  distance: string,
  duration: string,
  cabType: string,
  estimatedFare: number,
  currency: string,
  fareBreakdown: {
    baseFare: number,
    distanceFare: number,
    timeFare: number
  }
}
```

**Example:**
```typescript
const fare = await estimateCabFare(
  'Patna Junction',
  'Patliputra',
  'sedan'
);
console.log(`Estimated fare: ₹${fare.estimatedFare}`);
```

---

## 🛠️ Utility Functions

### Map URLs

```typescript
import { getGoogleMapsUrl, getStaticMapUrl, getShareableLocationLink } from '@/lib/maps-utils';

// Navigation URL
const navUrl = getGoogleMapsUrl('Patna Station', 'Fraser Road', 'walking');

// Static map image
const mapImage = getStaticMapUrl(
  { lat: 25.5941, lng: 85.1376 },
  15, // zoom
  600, // width
  400  // height
);

// Shareable link
const shareLink = getShareableLocationLink(25.5941, 85.1376, 'My Shop');
```

### Distance Calculations

```typescript
import { calculateCrowFlyDistance, formatDistance, formatDuration } from '@/lib/maps-utils';

// Crow-fly distance (straight line)
const crowFly = calculateCrowFlyDistance(25.5941, 85.1376, 25.6093, 85.1260);
console.log(crowFly.km); // 1.75 km

// Format for display
const distText = formatDistance(1750); // "1.8 km"
const timeText = formatDuration(900); // "15 min"
```

### Helper Functions

```typescript
import {
  getTravelModeEmoji,
  formatPlaceTypes,
  getNearbyTaxiNumbers,
  getCityCoordinates,
  formatCoordinates,
  isValidCoordinates
} from '@/lib/maps-utils';

// Travel mode emoji
const emoji = getTravelModeEmoji('driving'); // 🚗

// Readable place types
const types = formatPlaceTypes(['restaurant', 'cafe']);
// ['Restaurant', 'Cafe']

// City coordinates
const coords = getCityCoordinates('patna');
// { lat: 25.5941, lng: 85.1376 }

// Taxi numbers
const taxis = getNearbyTaxiNumbers('patna');
// [{ name: 'Patna Taxi Stand', number: '+91-...', type: 'Taxi' }]
```

---

## 🤖 GOLU AI Integration

### Travel Assistant Commands

**User:** "Golu Patna station jaana hai"

**GOLU Response:**
```
🗺️ Patna Station ke liye route:

📍 Current Location: Fraser Road, Patna
🎯 Destination: Patna Junction
🚗 Distance: 5.2 km
⏱️ Time: 15 minutes

💰 Estimated Fare:
- Mini: ₹80
- Sedan: ₹110
- SUV: ₹150

🚕 Nearby Taxi Numbers:
📞 Patna Taxi Stand: +91-612-2234567
📞 Ola Support: +91-33-4064-1000

🗺️ [Open in Google Maps]
```

### Implementation in GOLU

```typescript
// In src/app/api/golu/chat/route.ts

if (category === CommandCategory.TRAVEL) {
  const destination = extractDestination(query);
  const userCity = userProfile?.city || 'Patna';
  
  // Get directions
  const route = await getDirections(userCity, destination, 'driving');
  
  // Estimate fares
  const fare = await estimateCabFare(userCity, destination, 'sedan');
  
  // Get taxi numbers
  const taxiNumbers = getNearbyTaxiNumbers(userCity);
  
  // Format response
  const response = `
    🗺️ ${destination} ke liye route:
    
    📍 From: ${userCity}
    🎯 To: ${destination}
    🚗 Distance: ${route.routes[0].distance}
    ⏱️ Time: ${route.routes[0].duration}
    
    💰 Estimated Fare:
    - Mini: ₹${fare.fareBreakdown.baseFare}
    - Sedan: ₹${fare.estimatedFare}
    
    🚕 Taxi Numbers:
    ${taxiNumbers.map(t => `📞 ${t.name}: ${t.number}`).join('\n')}
  `;
}
```

---

## 📱 Frontend Integration Examples

### Shop Location Map

```typescript
import { getStaticMapUrl } from '@/lib/maps-utils';

function ShopCard({ shop }: { shop: Shop }) {
  const mapUrl = getStaticMapUrl(
    { lat: shop.location.lat, lng: shop.location.lng },
    15,
    400,
    300,
    [{ lat: shop.location.lat, lng: shop.location.lng, label: 'S', color: 'red' }]
  );
  
  return (
    <div>
      <img src={mapUrl} alt="Shop Location" />
      <a href={getGoogleMapsUrl(shop.address)} target="_blank">
        Get Directions
      </a>
    </div>
  );
}
```

### Nearby Shops Finder

```typescript
import { searchNearbyPlaces } from '@/lib/google-apis';

async function findNearbyShops(userLocation: {lat: number, lng: number}) {
  const nearbyShops = await searchNearbyPlaces(
    userLocation,
    'store',
    5000,
    '8rupiya'
  );
  
  return nearbyShops.map(shop => ({
    name: shop.name,
    distance: calculateCrowFlyDistance(
      userLocation.lat,
      userLocation.lng,
      shop.location.lat,
      shop.location.lng
    ).km,
    rating: shop.rating
  }));
}
```

---

## 🎯 Use Cases

### 1. **Shop Discovery**
```typescript
// Find nearest shop of specific category
const location = getUserLocation(); // { lat, lng }
const shops = await searchNearbyPlaces(location, 'electronics', 10000);
```

### 2. **Delivery Distance**
```typescript
// Calculate delivery distance
const distance = await calculateDistance(
  shopAddress,
  customerAddress,
  'driving'
);

const deliveryCharge = distance.distanceValue > 5000 ? 50 : 0;
```

### 3. **Agent Route Planning**
```typescript
// Plan route for agent visiting multiple shops
const route = await getDirections(
  'Agent Home',
  'Shop 1',
  'driving',
  true // show alternatives
);
```

### 4. **Location Verification**
```typescript
// Verify shop address during registration
const locationDetails = await getLocationDetails(shopAddress);

if (locationDetails.addressComponents.city !== expectedCity) {
  throw new Error('Invalid city');
}
```

---

## ⚙️ Configuration Options

### Rate Limits

Google Maps API has rate limits. Monitor usage:

- **Free tier:** 28,500 requests/month
- **Paid:** Pay per request after limit

### Caching Strategy

```typescript
// Cache location data to reduce API calls
const cache = new Map();

async function getCachedLocation(address: string) {
  if (cache.has(address)) {
    return cache.get(address);
  }
  
  const location = await getLocationDetails(address);
  cache.set(address, location);
  
  return location;
}
```

### Error Handling

```typescript
try {
  const location = await getLocationDetails(userAddress);
  
  if (!location) {
    // API key issue or invalid address
    return fallbackResponse();
  }
  
  // Process location...
} catch (error) {
  console.error('Maps API error:', error);
  // Show user-friendly error
}
```

---

## 📊 Supported Place Types

- `restaurant` - Restaurants
- `cafe` - Cafes
- `hospital` - Hospitals
- `pharmacy` - Pharmacies
- `atm` - ATMs
- `bank` - Banks
- `gas_station` - Petrol Pumps
- `parking` - Parking lots
- `shopping_mall` - Malls
- `store` - Stores
- `lodging` - Hotels
- `bus_station` - Bus Stations
- `train_station` - Railway Stations
- `airport` - Airports
- `school` - Schools
- `gym` - Gyms
- `movie_theater` - Cinemas
- `temple` / `mosque` / `church` - Religious places

---

## 🔐 Security Best Practices

1. **API Key Restrictions:**
   - Restrict by HTTP referrer (websites)
   - Restrict by IP address (servers)
   - Set API quotas

2. **Server-Side Only:**
   - Keep `GOOGLE_MAPS_API_KEY` server-side only
   - Use `NEXT_PUBLIC_` prefix only for client maps

3. **Input Validation:**
   ```typescript
   function validateCoordinates(lat: number, lng: number) {
     if (!isValidCoordinates(lat, lng)) {
       throw new Error('Invalid coordinates');
     }
   }
   ```

---

## 🎉 Summary

**Enhanced Features:**
```
✅ Forward & Reverse Geocoding
✅ Multi-mode Distance Calculation
✅ Turn-by-Turn Directions
✅ Nearby Places Search
✅ Place Details & Reviews
✅ Autocomplete Suggestions
✅ Cab Fare Estimation
✅ Static Map Images
✅ Shareable Links
✅ Indian City Support
✅ Taxi Number Database
✅ Utility Helpers
✅ GOLU Integration Ready
```

**Perfect for:**
- Shop location management
- Delivery distance calculation
- Agent route planning
- Customer navigation
- GOLU travel assistant
- Nearby shop discovery

---

## 🚀 Next Steps

1. Add your Google Maps API key to `.env.local`
2. Enable required APIs in Google Cloud Console
3. Test functions in development
4. Integrate with GOLU for travel commands
5. Add to shop registration for location input
6. Implement nearby shop search on homepage

**Happy Mapping! 🗺️**

