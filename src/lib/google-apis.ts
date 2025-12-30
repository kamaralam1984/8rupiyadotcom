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
 * Get location details using Google Maps Geocoding API
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

    if (data.results && data.results[0]) {
      const result = data.results[0];
      return {
        formattedAddress: result.formatted_address,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        placeId: result.place_id,
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Calculate distance between two locations
 */
export async function calculateDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{ distance: string; duration: string; distanceValue: number; durationValue: number } | null> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not configured');
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.rows && data.rows[0] && data.rows[0].elements && data.rows[0].elements[0]) {
      const element = data.rows[0].elements[0];
      if (element.status === 'OK') {
        return {
          distance: element.distance.text,
          duration: element.duration.text,
          distanceValue: element.distance.value,
          durationValue: element.duration.value,
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

