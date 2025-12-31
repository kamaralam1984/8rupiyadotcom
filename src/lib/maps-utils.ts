// Google Maps Utilities and Helper Functions

/**
 * Generate Google Maps URL for navigation
 */
export function getGoogleMapsUrl(
  destination: string,
  origin?: string,
  mode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'driving'
): string {
  const baseUrl = 'https://www.google.com/maps/dir/';
  
  if (origin) {
    return `${baseUrl}${encodeURIComponent(origin)}/${encodeURIComponent(destination)}/@?travelmode=${mode}`;
  }
  
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
}

/**
 * Generate Google Maps static map image URL
 */
export function getStaticMapUrl(
  center: { lat: number; lng: number },
  zoom: number = 15,
  width: number = 600,
  height: number = 400,
  markers?: Array<{ lat: number; lng: number; label?: string; color?: string }>
): string {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return '';
  }

  let url = `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=${zoom}&size=${width}x${height}&key=${apiKey}`;
  
  if (markers && markers.length > 0) {
    markers.forEach((marker, index) => {
      const label = marker.label || String.fromCharCode(65 + index); // A, B, C...
      const color = marker.color || 'red';
      url += `&markers=color:${color}%7Clabel:${label}%7C${marker.lat},${marker.lng}`;
    });
  }
  
  return url;
}

/**
 * Calculate crow-fly distance between two coordinates (Haversine formula)
 */
export function calculateCrowFlyDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { km: number; meters: number; miles: number } {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R * c;
  
  return {
    km: Math.round(km * 100) / 100,
    meters: Math.round(km * 1000),
    miles: Math.round(km * 0.621371 * 100) / 100,
  };
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} meters`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  return `${minutes} min`;
}

/**
 * Get travel mode emoji
 */
export function getTravelModeEmoji(mode: string): string {
  const emojis: Record<string, string> = {
    driving: '🚗',
    walking: '🚶',
    bicycling: '🚴',
    transit: '🚌',
    taxi: '🚕',
    auto: '🛺',
  };
  return emojis[mode] || '🗺️';
}

/**
 * Parse place types to readable format
 */
export function formatPlaceTypes(types: string[]): string[] {
  const typeMap: Record<string, string> = {
    restaurant: 'Restaurant',
    cafe: 'Cafe',
    bar: 'Bar',
    hospital: 'Hospital',
    pharmacy: 'Pharmacy',
    atm: 'ATM',
    bank: 'Bank',
    gas_station: 'Petrol Pump',
    parking: 'Parking',
    shopping_mall: 'Mall',
    store: 'Store',
    lodging: 'Hotel',
    police: 'Police Station',
    bus_station: 'Bus Stand',
    train_station: 'Railway Station',
    airport: 'Airport',
    school: 'School',
    university: 'University',
    gym: 'Gym',
    movie_theater: 'Cinema',
    park: 'Park',
    temple: 'Temple',
    mosque: 'Mosque',
    church: 'Church',
  };
  
  return types
    .filter(type => typeMap[type])
    .map(type => typeMap[type]);
}

/**
 * Get nearby taxi/auto stand contact numbers (placeholder - needs real data)
 */
export function getNearbyTaxiNumbers(city: string): Array<{ name: string; number: string; type: string }> {
  // This is a placeholder. In production, fetch from database or API
  const taxiData: Record<string, Array<{ name: string; number: string; type: string }>> = {
    patna: [
      { name: 'Patna Taxi Stand', number: '+91-612-2234567', type: 'Taxi' },
      { name: 'Auto Stand Fraser Road', number: '+91-9876543210', type: 'Auto' },
      { name: 'Ola Cab Support', number: '+91-33-4064-1000', type: 'Ola' },
      { name: 'Uber Support', number: '+91-800-4149-000', type: 'Uber' },
    ],
    delhi: [
      { name: 'Delhi Taxi Service', number: '+91-11-4166-6666', type: 'Taxi' },
      { name: 'Auto Stand CP', number: '+91-9876543211', type: 'Auto' },
      { name: 'Ola Cab Support', number: '+91-33-4064-1000', type: 'Ola' },
      { name: 'Uber Support', number: '+91-800-4149-000', type: 'Uber' },
    ],
    mumbai: [
      { name: 'Mumbai Taxi Stand', number: '+91-22-2345-6789', type: 'Taxi' },
      { name: 'Auto Stand Dadar', number: '+91-9876543212', type: 'Auto' },
      { name: 'Ola Cab Support', number: '+91-33-4064-1000', type: 'Ola' },
      { name: 'Uber Support', number: '+91-800-4149-000', type: 'Uber' },
    ],
  };
  
  return taxiData[city.toLowerCase()] || [
    { name: 'Ola Cab Support', number: '+91-33-4064-1000', type: 'Ola' },
    { name: 'Uber Support', number: '+91-800-4149-000', type: 'Uber' },
  ];
}

/**
 * Get landmark-based directions (Indian style)
 */
export function formatDirectionsIndianStyle(steps: Array<{ instruction: string; distance: string }>): string {
  if (!steps || steps.length === 0) return '';
  
  return steps
    .map((step, index) => `${index + 1}. ${step.instruction} (${step.distance})`)
    .join('\n');
}

/**
 * Estimate Ola/Uber fare (approximate)
 */
export function estimateRideShareFare(
  distanceKm: number,
  durationMin: number,
  cabType: 'mini' | 'sedan' | 'suv' | 'auto' = 'sedan'
): { ola: number; uber: number; auto?: number } {
  const rates = {
    mini: { base: 30, perKm: 8, perMin: 1 },
    sedan: { base: 50, perKm: 10, perMin: 1.5 },
    suv: { base: 80, perKm: 14, perMin: 2 },
    auto: { base: 25, perKm: 8, perMin: 0.5 },
  };
  
  const rate = rates[cabType];
  const baseFare = rate.base + (distanceKm * rate.perKm) + (durationMin * rate.perMin);
  
  return {
    ola: Math.round(baseFare * 0.95), // Ola slightly cheaper
    uber: Math.round(baseFare * 1.05), // Uber slightly expensive
    ...(cabType === 'auto' && { auto: Math.round(baseFare) }),
  };
}

/**
 * Get Indian city coordinates
 */
export function getCityCoordinates(city: string): { lat: number; lng: number } | null {
  const cities: Record<string, { lat: number; lng: number }> = {
    patna: { lat: 25.5941, lng: 85.1376 },
    delhi: { lat: 28.7041, lng: 77.1025 },
    mumbai: { lat: 19.0760, lng: 72.8777 },
    bangalore: { lat: 12.9716, lng: 77.5946 },
    kolkata: { lat: 22.5726, lng: 88.3639 },
    chennai: { lat: 13.0827, lng: 80.2707 },
    hyderabad: { lat: 17.3850, lng: 78.4867 },
    pune: { lat: 18.5204, lng: 73.8567 },
    ahmedabad: { lat: 23.0225, lng: 72.5714 },
    jaipur: { lat: 26.9124, lng: 75.7873 },
    lucknow: { lat: 26.8467, lng: 80.9462 },
    kanpur: { lat: 26.4499, lng: 80.3319 },
    nagpur: { lat: 21.1458, lng: 79.0882 },
    indore: { lat: 22.7196, lng: 75.8577 },
    bhopal: { lat: 23.2599, lng: 77.4126 },
    varanasi: { lat: 25.3176, lng: 82.9739 },
    gaya: { lat: 24.7955, lng: 84.9994 },
    ranchi: { lat: 23.3441, lng: 85.3096 },
    guwahati: { lat: 26.1445, lng: 91.7362 },
    chandigarh: { lat: 30.7333, lng: 76.7794 },
  };
  
  return cities[city.toLowerCase()] || null;
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`;
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Generate shareable location link
 */
export function getShareableLocationLink(lat: number, lng: number, label?: string): string {
  if (label) {
    return `https://maps.google.com/?q=${encodeURIComponent(label)}&ll=${lat},${lng}`;
  }
  return `https://maps.google.com/?q=${lat},${lng}`;
}

