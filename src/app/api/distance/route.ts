import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const userLat = searchParams.get('olat');
  const userLng = searchParams.get('olng');
  const shopLat = searchParams.get('dlat');
  const shopLng = searchParams.get('dlng');

  try {

    // Validate inputs
    if (!userLat || !userLng || !shopLat || !shopLng) {
      return NextResponse.json(
        { error: 'Missing required parameters: olat, olng, dlat, dlng' },
        { status: 400 }
      );
    }

    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

    if (!googleMapsApiKey) {
      // Return calculated distance if API key not available
      const distance = calculateHaversineDistance(
        parseFloat(userLat),
        parseFloat(userLng),
        parseFloat(shopLat),
        parseFloat(shopLng)
      );
      return NextResponse.json({
        distance: `${distance.toFixed(1)} km`,
        time: 'N/A',
        error: 'API key not configured',
      });
    }

    // Call Google Distance Matrix API
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${userLat},${userLng}&destinations=${shopLat},${shopLng}&key=${googleMapsApiKey}&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.rows || !data.rows[0] || !data.rows[0].elements || !data.rows[0].elements[0]) {
      // Fallback to calculated distance
      const distance = calculateHaversineDistance(
        parseFloat(userLat),
        parseFloat(userLng),
        parseFloat(shopLat),
        parseFloat(shopLng)
      );
      return NextResponse.json({
        distance: `${distance.toFixed(1)} km`,
        time: 'N/A',
        error: 'Distance Matrix API error',
      });
    }

    const element = data.rows[0].elements[0];

    if (element.status !== 'OK') {
      // Fallback to calculated distance
      const distance = calculateHaversineDistance(
        parseFloat(userLat),
        parseFloat(userLng),
        parseFloat(shopLat),
        parseFloat(shopLng)
      );
      return NextResponse.json({
        distance: `${distance.toFixed(1)} km`,
        time: 'N/A',
        error: element.status,
      });
    }

    // Extract distance and duration
    const distanceText = element.distance?.text || 'N/A';
    const durationText = element.duration?.text || 'N/A';

    return NextResponse.json({
      distance: distanceText,
      time: durationText,
    });
  } catch (error: any) {
    // Silently handle errors and return fallback distance
    const distance = calculateHaversineDistance(
      parseFloat(userLat || '0'),
      parseFloat(userLng || '0'),
      parseFloat(shopLat || '0'),
      parseFloat(shopLng || '0')
    );
    return NextResponse.json({
      distance: `${distance.toFixed(1)} km`,
      time: 'N/A',
      error: 'Internal server error',
    });
  }
}

// Haversine formula for calculating distance between two points
function calculateHaversineDistance(
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

