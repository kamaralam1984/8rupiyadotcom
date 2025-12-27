interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  photos?: Array<{
    photo_reference: string;
  }>;
  price_level?: number;
}

interface NearbySearchParams {
  latitude: number;
  longitude: number;
  radius?: number; // in meters
  type?: string; // e.g., 'store', 'restaurant', 'establishment'
  keyword?: string;
}

export async function getNearbyPlacesFromGoogle(
  params: NearbySearchParams
): Promise<GooglePlace[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Places API key not configured');
    return [];
  }

  try {
    const { latitude, longitude, radius = 5000, type = 'establishment', keyword } = params;
    
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    url.searchParams.append('location', `${latitude},${longitude}`);
    url.searchParams.append('radius', radius.toString());
    url.searchParams.append('type', type);
    if (keyword) {
      url.searchParams.append('keyword', keyword);
    }
    url.searchParams.append('key', apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status === 'OK' && data.results) {
      return data.results.map((place: any) => ({
        place_id: place.place_id,
        name: place.name,
        formatted_address: place.vicinity || place.formatted_address,
        geometry: {
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          },
        },
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        types: place.types,
        photos: place.photos,
        price_level: place.price_level,
      }));
    }

    return [];
  } catch (error) {
    console.error('Google Places API error:', error);
    return [];
  }
}

export function calculateDistance(
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

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

