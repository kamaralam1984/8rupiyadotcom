// Distance and Time Calculation Utilities

interface Location {
  lat: number;
  lng: number;
}

interface DistanceResult {
  distance: string; // e.g., "2.5 km"
  time: string;     // e.g., "10 min"
  distanceValue: number; // in km
  timeValue: number;     // in minutes
}

// Haversine formula to calculate straight-line distance between two points
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Convert degrees to radians
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Calculate estimated time from distance
// Assumes different speeds based on distance (city vs highway)
export function calculateTimeFromDistance(distanceKm: number): string {
  let timeInMinutes: number;
  
  if (distanceKm < 5) {
    // City traffic - 20 km/h average
    timeInMinutes = Math.round((distanceKm / 20) * 60);
  } else if (distanceKm < 20) {
    // Suburban - 35 km/h average
    timeInMinutes = Math.round((distanceKm / 35) * 60);
  } else {
    // Highway - 50 km/h average
    timeInMinutes = Math.round((distanceKm / 50) * 60);
  }
  
  if (timeInMinutes < 1) {
    return '< 1 min';
  } else if (timeInMinutes < 60) {
    return `${timeInMinutes} min`;
  } else {
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

// Format distance for display
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  } else {
    return `${Math.round(distanceKm)} km`;
  }
}

// Calculate distance and time locally
export function calculateDistanceAndTime(
  userLocation: Location,
  shopLocation: { coordinates: [number, number] }
): DistanceResult | null {
  if (!userLocation || !shopLocation?.coordinates) {
    return null;
  }

  const [shopLng, shopLat] = shopLocation.coordinates;

  // Validate coordinates
  if (
    isNaN(shopLng) || isNaN(shopLat) ||
    shopLng < -180 || shopLng > 180 ||
    shopLat < -90 || shopLat > 90 ||
    (shopLng === 0 && shopLat === 0) // Exclude 0,0 as likely invalid
  ) {
    return null;
  }

  const distanceKm = calculateHaversineDistance(
    userLocation.lat,
    userLocation.lng,
    shopLat,
    shopLng
  );

  return {
    distance: formatDistance(distanceKm),
    time: calculateTimeFromDistance(distanceKm),
    distanceValue: distanceKm,
    timeValue: parseFloat(calculateTimeFromDistance(distanceKm).replace(/[^\d.]/g, ''))
  };
}

// Google Distance Matrix API integration (for more accurate road distances)
export async function getGoogleDistanceMatrix(
  origin: Location,
  destination: Location,
  apiKey?: string
): Promise<DistanceResult | null> {
  if (!apiKey) {
    // Fallback to Haversine if no API key
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&mode=driving&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
      const element = data.rows[0].elements[0];
      const distanceMeters = element.distance.value;
      const durationSeconds = element.duration.value;

      const distanceKm = distanceMeters / 1000;
      const timeMinutes = Math.round(durationSeconds / 60);

      return {
        distance: formatDistance(distanceKm),
        time: timeMinutes < 60 
          ? `${timeMinutes} min` 
          : `${Math.floor(timeMinutes / 60)}h ${timeMinutes % 60}m`,
        distanceValue: distanceKm,
        timeValue: timeMinutes
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching Google Distance Matrix:', error);
    return null;
  }
}

// Enhanced distance calculation with Google API fallback
export async function calculateDistanceAndTimeEnhanced(
  userLocation: Location,
  shopLocation: { coordinates: [number, number] },
  useGoogleAPI: boolean = false,
  apiKey?: string
): Promise<DistanceResult | null> {
  // Try Google API first if enabled
  if (useGoogleAPI && apiKey) {
    const [shopLng, shopLat] = shopLocation.coordinates;
    const googleResult = await getGoogleDistanceMatrix(
      userLocation,
      { lat: shopLat, lng: shopLng },
      apiKey
    );

    if (googleResult) {
      return googleResult;
    }
  }

  // Fallback to Haversine
  return calculateDistanceAndTime(userLocation, shopLocation);
}

// Batch calculate distances for multiple shops
export function batchCalculateDistances(
  userLocation: Location,
  shops: Array<{ location?: { coordinates: [number, number] } }>
): Map<number, DistanceResult> {
  const results = new Map<number, DistanceResult>();

  shops.forEach((shop, index) => {
    if (shop.location?.coordinates) {
      const result = calculateDistanceAndTime(userLocation, shop.location);
      if (result) {
        results.set(index, result);
      }
    }
  });

  return results;
}

// Sort shops by distance
export function sortShopsByDistance<T extends { location?: { coordinates: [number, number] } }>(
  shops: T[],
  userLocation: Location
): T[] {
  return [...shops].sort((a, b) => {
    const distA = a.location?.coordinates 
      ? calculateDistanceAndTime(userLocation, a.location)?.distanceValue ?? Infinity
      : Infinity;
    const distB = b.location?.coordinates 
      ? calculateDistanceAndTime(userLocation, b.location)?.distanceValue ?? Infinity
      : Infinity;
    
    return distA - distB;
  });
}

