/**
 * IP-based Geolocation Utility
 * Get location data from IP address
 */

interface GeolocationData {
  country?: string;
  state?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Get location from IP address using ipapi.co (free tier: 1000 requests/day)
 */
export async function getLocationFromIP(ip: string): Promise<GeolocationData> {
  try {
    // Skip for localhost/private IPs
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return {
        country: 'India',
        state: 'Bihar',
        city: 'Patna',
        latitude: 25.5941,
        longitude: 85.1376
      };
    }

    // Use ipapi.co (free, no API key needed)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': '8rupiya.com'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }

    const data = await response.json();

    return {
      country: data.country_name || 'Unknown',
      state: data.region || undefined,
      city: data.city || undefined,
      latitude: data.latitude || undefined,
      longitude: data.longitude || undefined
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    // Return default India location on error
    return {
      country: 'India',
      city: 'Unknown'
    };
  }
}

/**
 * Alternative: Get location from IP using ip-api.com (free, no rate limit for non-commercial)
 */
export async function getLocationFromIPAlternative(ip: string): Promise<GeolocationData> {
  try {
    // Skip for localhost/private IPs
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return {
        country: 'India',
        state: 'Bihar',
        city: 'Patna',
        latitude: 25.5941,
        longitude: 85.1376
      };
    }

    // Use ip-api.com (free, good for development)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon`);

    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }

    const data = await response.json();

    if (data.status !== 'success') {
      throw new Error('Location lookup failed');
    }

    return {
      country: data.country || 'Unknown',
      state: data.regionName || undefined,
      city: data.city || undefined,
      latitude: data.lat || undefined,
      longitude: data.lon || undefined
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    return {
      country: 'India',
      city: 'Unknown'
    };
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIP(headers: Headers): string {
  // Try different headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Default fallback
  return '127.0.0.1';
}

