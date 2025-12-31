// Google APIs Integration for GOLU

/**
 * Translate text using Google Translate API
 */
export async function translateText(text: string, targetLanguage: string = 'hi'): Promise<{ translatedText: string; detectedLanguage: string }> {
  try {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Translate API key not configured');
      return { translatedText: text, detectedLanguage: 'en' };
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
      }),
    });

    const data = await response.json();

    if (data.data && data.data.translations && data.data.translations[0]) {
      return {
        translatedText: data.data.translations[0].translatedText,
        detectedLanguage: data.data.translations[0].detectedSourceLanguage || 'en',
      };
    }

    return { translatedText: text, detectedLanguage: 'en' };
  } catch (error) {
    console.error('Translation error:', error);
    return { translatedText: text, detectedLanguage: 'en' };
  }
}

/**
 * Detect language of text
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    
    if (!apiKey) {
      return 'hi'; // Default to Hindi
    }

    const url = `https://translation.googleapis.com/language/translate/v2/detect?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text }),
    });

    const data = await response.json();

    if (data.data && data.data.detections && data.data.detections[0] && data.data.detections[0][0]) {
      return data.data.detections[0][0].language;
    }

    return 'hi';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'hi';
  }
}

/**
 * Search using Google Custom Search API
 */
export async function googleSearch(query: string, num: number = 3): Promise<any[]> {
  try {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    if (!apiKey || !searchEngineId) {
      console.warn('Google Search API not configured');
      return [];
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=${num}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.items && Array.isArray(data.items)) {
      return data.items.map((item: any) => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link,
      }));
    }

    return [];
  } catch (error) {
    console.error('Google Search error:', error);
    return [];
  }
}

/**
 * Get location details using Google Maps Geocoding API (Enhanced)
 */
export async function getLocationDetails(place: string): Promise<any> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not configured');
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Geocoding failed:', data.status, data.error_message);
      return null;
    }

    if (data.results && data.results[0]) {
      const result = data.results[0];
      
      // Extract address components
      const components: any = {};
      result.address_components?.forEach((comp: any) => {
        if (comp.types.includes('locality')) components.city = comp.long_name;
        if (comp.types.includes('administrative_area_level_1')) components.state = comp.long_name;
        if (comp.types.includes('country')) components.country = comp.long_name;
        if (comp.types.includes('postal_code')) components.pincode = comp.long_name;
      });

      return {
        formattedAddress: result.formatted_address,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        placeId: result.place_id,
        locationType: result.geometry.location_type,
        viewport: result.geometry.viewport,
        addressComponents: components,
        types: result.types,
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Reverse geocoding - Get address from coordinates
 */
export async function reverseGeocode(lat: number, lng: number): Promise<any> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not configured');
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results[0]) {
      return {
        formattedAddress: data.results[0].formatted_address,
        placeId: data.results[0].place_id,
        addressComponents: data.results[0].address_components,
      };
    }

    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Calculate distance between two locations with multiple travel modes
 */
export async function calculateDistance(
  origin: { lat: number; lng: number } | string,
  destination: { lat: number; lng: number } | string,
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
): Promise<{ distance: string; duration: string; distanceValue: number; durationValue: number; fare?: any } | null> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not configured');
      return null;
    }

    // Format origin and destination
    const originStr = typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`;
    const destStr = typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(originStr)}&destinations=${encodeURIComponent(destStr)}&mode=${mode}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.rows && data.rows[0] && data.rows[0].elements && data.rows[0].elements[0]) {
      const element = data.rows[0].elements[0];
      if (element.status === 'OK') {
        return {
          distance: element.distance.text,
          duration: element.duration.text,
          distanceValue: element.distance.value,
          durationValue: element.duration.value,
          fare: element.fare || null, // For transit mode
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Distance calculation error:', error);
    return null;
  }
}

/**
 * Get directions/route between two locations
 */
export async function getDirections(
  origin: string,
  destination: string,
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving',
  alternatives: boolean = false
): Promise<any> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not configured');
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&alternatives=${alternatives}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.routes && data.routes.length > 0) {
      return {
        routes: data.routes.map((route: any) => ({
          summary: route.summary,
          distance: route.legs[0].distance.text,
          duration: route.legs[0].duration.text,
          distanceValue: route.legs[0].distance.value,
          durationValue: route.legs[0].duration.value,
          startAddress: route.legs[0].start_address,
          endAddress: route.legs[0].end_address,
          steps: route.legs[0].steps.map((step: any) => ({
            instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
            distance: step.distance.text,
            duration: step.duration.text,
            maneuver: step.maneuver,
          })),
          polyline: route.overview_polyline.points,
        })),
        status: data.status,
      };
    }

    return { routes: [], status: data.status, error: data.error_message };
  } catch (error) {
    console.error('Directions error:', error);
    return null;
  }
}

/**
 * Search nearby places
 */
export async function searchNearbyPlaces(
  location: { lat: number; lng: number },
  type: string,
  radius: number = 5000,
  keyword?: string
): Promise<any[]> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not configured');
      return [];
    }

    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=${type}&key=${apiKey}`;
    
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results) {
      return data.results.map((place: any) => ({
        placeId: place.place_id,
        name: place.name,
        address: place.vicinity,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        priceLevel: place.price_level,
        types: place.types,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        openNow: place.opening_hours?.open_now,
        photos: place.photos?.map((photo: any) => ({
          reference: photo.photo_reference,
          width: photo.width,
          height: photo.height,
        })),
      }));
    }

    return [];
  } catch (error) {
    console.error('Nearby search error:', error);
    return [];
  }
}

/**
 * Get place details by place ID
 */
export async function getPlaceDetails(placeId: string): Promise<any> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not configured');
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,opening_hours,website,rating,reviews,photos,geometry,types&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      const place = data.result;
      return {
        name: place.name,
        address: place.formatted_address,
        phone: place.formatted_phone_number,
        website: place.website,
        rating: place.rating,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        openingHours: place.opening_hours?.weekday_text,
        isOpen: place.opening_hours?.open_now,
        reviews: place.reviews?.slice(0, 5).map((review: any) => ({
          author: review.author_name,
          rating: review.rating,
          text: review.text,
          time: review.time,
        })),
        photos: place.photos?.map((photo: any) => ({
          reference: photo.photo_reference,
          width: photo.width,
          height: photo.height,
        })),
        types: place.types,
      };
    }

    return null;
  } catch (error) {
    console.error('Place details error:', error);
    return null;
  }
}

/**
 * Get photo URL from photo reference
 */
export function getPlacePhotoUrl(photoReference: string, maxWidth: number = 400): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return '';
  
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
}

/**
 * Autocomplete place search
 */
export async function autocompletePlaces(input: string, location?: { lat: number; lng: number }): Promise<any[]> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not configured');
      return [];
    }

    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;
    
    if (location) {
      url += `&location=${location.lat},${location.lng}&radius=50000`;
    }
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.predictions) {
      return data.predictions.map((prediction: any) => ({
        description: prediction.description,
        placeId: prediction.place_id,
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text,
        types: prediction.types,
      }));
    }

    return [];
  } catch (error) {
    console.error('Autocomplete error:', error);
    return [];
  }
}

/**
 * Get estimated taxi/cab fare (using distance and local rates)
 */
export async function estimateCabFare(
  origin: string,
  destination: string,
  cabType: 'mini' | 'sedan' | 'suv' = 'sedan'
): Promise<any> {
  try {
    // First get distance and duration
    const distanceData = await calculateDistance(origin, destination, 'driving');
    
    if (!distanceData) {
      return null;
    }

    // Fare calculation (approximate Indian rates)
    const rates = {
      mini: { base: 50, perKm: 10, perMin: 1 },
      sedan: { base: 80, perKm: 13, perMin: 1.5 },
      suv: { base: 120, perKm: 16, perMin: 2 },
    };

    const rate = rates[cabType];
    const distanceKm = distanceData.distanceValue / 1000;
    const durationMin = distanceData.durationValue / 60;

    const estimatedFare = Math.round(
      rate.base + (distanceKm * rate.perKm) + (durationMin * rate.perMin)
    );

    return {
      distance: distanceData.distance,
      duration: distanceData.duration,
      cabType,
      estimatedFare,
      currency: 'INR',
      fareBreakdown: {
        baseFare: rate.base,
        distanceFare: Math.round(distanceKm * rate.perKm),
        timeFare: Math.round(durationMin * rate.perMin),
      },
    };
  } catch (error) {
    console.error('Fare estimation error:', error);
    return null;
  }
}

/**
 * Get weather information (using OpenWeatherMap API as Google doesn't have direct weather API)
 */
export async function getWeather(city: string): Promise<any> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenWeather API key not configured');
      return null;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.main && data.weather) {
      return {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        city: data.name,
      };
    }

    return null;
  } catch (error) {
    console.error('Weather API error:', error);
    return null;
  }
}

/**
 * Get news headlines (using News API)
 */
export async function getNewsHeadlines(category: string = 'general', country: string = 'in'): Promise<any[]> {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    
    if (!apiKey) {
      console.warn('News API key not configured');
      return [];
    }

    const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.articles && Array.isArray(data.articles)) {
      return data.articles.slice(0, 5).map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
      }));
    }

    return [];
  } catch (error) {
    console.error('News API error:', error);
    return [];
  }
}

