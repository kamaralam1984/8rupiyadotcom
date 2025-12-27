export interface Coordinates {
  latitude: number;
  longitude: number;
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

export async function getCoordinatesFromAddress(address: string): Promise<Coordinates | null> {
  // In production, use Google Geocoding API or similar
  // For now, return null and require manual coordinates
  return null;
}

export async function getCoordinatesFromIP(ip: string): Promise<Coordinates | null> {
  // In production, use IP geolocation service
  // For now, return null
  return null;
}

