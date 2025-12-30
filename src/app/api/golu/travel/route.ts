import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Travel assistant using Google Maps API
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { origin, destination } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      // Fallback response without API
      return NextResponse.json({
        success: true,
        route: {
          distance: 'N/A',
          duration: 'N/A',
          mode: 'driving',
        },
        cab: {
          olaEstimate: 'API key not configured',
          uberEstimate: 'API key not configured',
          localTaxis: [
            { name: 'Local Taxi Service', phone: '1800-XXX-XXXX' },
          ],
        },
        message: 'Google Maps API key not configured. Please add GOOGLE_MAPS_API_KEY to .env.local',
      });
    }

    // Get distance and duration from Google Maps Distance Matrix API
    const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      origin
    )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    const distanceResponse = await fetch(distanceUrl);
    const distanceData = await distanceResponse.json();

    if (distanceData.status !== 'OK' || !distanceData.rows[0].elements[0].distance) {
      return NextResponse.json({
        error: 'Could not calculate route',
        details: distanceData.status,
      }, { status: 400 });
    }

    const element = distanceData.rows[0].elements[0];
    const distance = element.distance.text;
    const duration = element.duration.text;
    const distanceValue = element.distance.value / 1000; // in km

    // Estimate cab prices (approximate for India)
    const olaMin = Math.round(distanceValue * 10);
    const olaMax = Math.round(distanceValue * 15);
    const uberMin = Math.round(distanceValue * 12);
    const uberMax = Math.round(distanceValue * 18);

    return NextResponse.json({
      success: true,
      route: {
        origin,
        destination,
        distance,
        duration,
        distanceKm: distanceValue,
      },
      cab: {
        olaEstimate: `₹${olaMin} - ₹${olaMax}`,
        uberEstimate: `₹${uberMin} - ₹${uberMax}`,
        rapido: `₹${Math.round(distanceValue * 8)}`,
        localTaxis: [
          { name: 'Ola Cabs', phone: '1800-419-4141' },
          { name: 'Uber', phone: '1800-208-4141' },
          { name: 'Rapido', phone: '080-6812-6812' },
        ],
      },
      maps: {
        googleMapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
          origin
        )}&destination=${encodeURIComponent(destination)}`,
      },
    });
  } catch (error) {
    console.error('Error in travel API:', error);
    return NextResponse.json(
      { error: 'Failed to get travel information' },
      { status: 500 }
    );
  }
}

