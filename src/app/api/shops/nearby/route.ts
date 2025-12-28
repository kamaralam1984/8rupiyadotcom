import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop, { ShopStatus } from '@/models/Shop';
import { cacheGet, cacheSet } from '@/lib/redis';
import { calculateDistance } from '@/lib/location';
import { calculateRankScore, getPlanPriority } from '@/lib/ranking';
import { getNearbyPlacesFromGoogle, calculateDistance as googleDistance } from '@/lib/googlePlaces';

interface MergedShop {
  _id?: string;
  place_id?: string;
  name: string;
  description?: string;
  category: string;
  address: string;
  city: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  rating: number;
  reviewCount: number;
  distance?: number; // Optional - undefined if invalid/missing coordinates
  isFeatured: boolean;
  isPaid: boolean;
  planId?: any;
  planPriority: number;
  rankScore: number;
  source: 'mongodb' | 'google';
  images?: string[];
  phone?: string;
  email?: string;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const lat = latParam ? parseFloat(latParam) : null;
    const lng = lngParam ? parseFloat(lngParam) : null;
    const city = searchParams.get('city') || '';
    const category = searchParams.get('category') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const useGoogle = searchParams.get('google') !== 'false'; // Default true

    // Check if we have valid coordinates (not null, not NaN, and within valid range)
    // Note: We allow 0,0 as it's technically valid (Gulf of Guinea), but very unlikely for Indian users
    const hasValidCoords = lat !== null && lng !== null && 
                          !isNaN(lat) && !isNaN(lng) &&
                          lat >= -90 && lat <= 90 && 
                          lng >= -180 && lng <= 180;
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📍 Nearby API - Location check:', {
        latParam,
        lngParam,
        lat,
        lng,
        hasValidCoords,
        isZeroZero: lat === 0 && lng === 0,
      });
    }

    // Create cache key
    const cacheKey = `shops:nearby:${lat}:${lng}:${city}:${category}:${page}:${limit}:${useGoogle}`;

    // Try to get from cache
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const mergedShops: MergedShop[] = [];

    // 1. Get shops from MongoDB (only active shops for website)
    // PART-4: Always filter for shops with valid lat/lng to prevent 500 errors
    let mongoQuery: any = { 
      status: { $in: [ShopStatus.ACTIVE, ShopStatus.APPROVED] },
      $and: [
        {
          'location.coordinates': {
            $exists: true,
            $ne: null,
            $size: 2, // Must have exactly 2 coordinates [lng, lat]
          },
        },
        {
          'location.coordinates.0': { $nin: [null, 0] }, // longitude not null/0
        },
        {
          'location.coordinates.1': { $nin: [null, 0] }, // latitude not null/0
        },
      ],
    };

    // If we have valid coordinates, try to use $near (requires geospatial index)
    if (hasValidCoords) {
      mongoQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: 500000, // 500km radius in meters
        },
      };
    } else if (city) {
      // If no location, filter by city
      mongoQuery.city = { $regex: city, $options: 'i' };
    }

    if (category) {
      mongoQuery.category = { $regex: category, $options: 'i' };
    }

    // Fetch shops with reasonable limit
    let mongoShops;
    try {
      mongoShops = await Shop.find(mongoQuery)
        .populate('planId')
        .populate('shopperId', 'name email phone')
        .limit(hasValidCoords ? 500 : 100) // Limit to 100 if no location to prevent overload
        .lean();
    } catch (error: any) {
      // If $near query fails (no geospatial index), try without it
      if (error.message?.includes('index') || error.message?.includes('near')) {
        console.warn('Geospatial query failed, using regular query:', error.message);
        delete mongoQuery.location;
        // Coordinate filter already in $and, no need to add again
        mongoShops = await Shop.find(mongoQuery)
          .populate('planId')
          .populate('shopperId', 'name email phone')
          .limit(100)
          .lean();
      } else {
        throw error; // Re-throw if it's a different error
      }
    }

    // Process MongoDB shops
    for (const shop of mongoShops) {
      // Calculate distance only if we have valid coordinates and shop has coordinates
      let distance: number | undefined = undefined;
      if (hasValidCoords && shop.location?.coordinates && 
          Array.isArray(shop.location.coordinates) && 
          shop.location.coordinates.length === 2) {
        const shopLng = shop.location.coordinates[0];
        const shopLat = shop.location.coordinates[1];
        
        // Validate shop coordinates are valid numbers
        if (!isNaN(shopLng) && !isNaN(shopLat) &&
            shopLng >= -180 && shopLng <= 180 &&
            shopLat >= -90 && shopLat <= 90 &&
            shopLng !== 0 && shopLat !== 0) { // Exclude 0,0 as likely invalid
          // MongoDB stores coordinates as [longitude, latitude]
          // calculateDistance expects (lat1, lng1, lat2, lng2)
          distance = calculateDistance(lat!, lng!, shopLat, shopLng);
          
          // Debug logging in development
          if (process.env.NODE_ENV === 'development') {
            console.log(`📍 Distance calculated for ${shop.name}:`, {
              userLocation: { lat: lat!, lng: lng! },
              shopLocation: { lat: shopLat, lng: shopLng },
              distance: distance.toFixed(2) + ' km',
            });
          }
        } else {
          // Shop has invalid coordinates, keep distance as undefined
          if (process.env.NODE_ENV === 'development') {
            console.warn(`⚠️ Nearby API: Shop ${shop.name} (${shop._id}) has invalid coordinates: [${shopLng}, ${shopLat}]`);
          }
        }
      } else {
        // No user location or shop has no coordinates, keep distance as undefined
        if (process.env.NODE_ENV === 'development' && !hasValidCoords) {
          console.warn(`Nearby API: User location not available or invalid. Shop: ${shop.name}`);
        }
      }

      // Get plan priority (cache to avoid multiple DB calls for same plan)
      let planPriority = 0;
      try {
        if (shop.planId) {
          const planId = shop.planId._id || shop.planId;
          planPriority = await getPlanPriority(planId);
        }
      } catch (error) {
        console.error('Error getting plan priority:', error);
        planPriority = 0; // Default to 0 on error
      }
      
      const rankScore = calculateRankScore(shop, distance !== undefined ? distance : 0); // Use 0 for ranking if distance is undefined

      mergedShops.push({
        _id: shop._id.toString(),
        name: shop.name,
        description: shop.description,
        category: shop.category,
        address: shop.address,
        city: shop.city,
        location: shop.location,
        rating: shop.rating || 0,
        reviewCount: shop.reviewCount || 0,
        distance: distance !== undefined ? Math.round(distance * 100) / 100 : undefined, // Only set distance if valid, undefined if invalid
        isFeatured: shop.isFeatured || false,
        isPaid: !!shop.planId,
        planId: shop.planId,
        planPriority,
        rankScore: Math.round(rankScore * 100) / 100,
        source: 'mongodb',
        images: shop.images,
        phone: shop.phone,
        email: shop.email,
      });
    }

    // 2. Get shops from Google Places API (if enabled and coordinates provided)
    // Note: Google Places API has a maximum radius of 50km
    if (useGoogle && hasValidCoords) {
      try {
        const googlePlaces = await getNearbyPlacesFromGoogle({
          latitude: lat,
          longitude: lng,
          radius: 50000, // 50km (Google Places API maximum, in meters)
          type: category || 'establishment',
        });

        // Convert Google places to our format
        for (const place of googlePlaces) {
          // Check if this place already exists in MongoDB (by name and location)
          const existsInMongo = mergedShops.some(
            (s) =>
              s.name.toLowerCase() === place.name.toLowerCase() &&
              Math.abs(s.location.coordinates[1] - place.geometry.location.lat) < 0.001 &&
              Math.abs(s.location.coordinates[0] - place.geometry.location.lng) < 0.001
          );

          // Skip if already in MongoDB (avoid duplicates)
          if (!existsInMongo) {
            const distance = googleDistance(
              lat,
              lng,
              place.geometry.location.lat,
              place.geometry.location.lng
            );

            mergedShops.push({
              place_id: place.place_id,
              name: place.name,
              description: '',
              category: place.types?.[0]?.replace(/_/g, ' ') || 'Business',
              address: place.formatted_address,
              city: place.formatted_address.split(',')[place.formatted_address.split(',').length - 2]?.trim() || '',
              location: {
                type: 'Point',
                coordinates: [place.geometry.location.lng, place.geometry.location.lat],
              },
              rating: place.rating || 0,
              reviewCount: place.user_ratings_total || 0,
              distance: Math.round(distance * 100) / 100,
              isFeatured: false,
              isPaid: false, // Google places are not paid
              planPriority: 0,
              rankScore: (place.rating || 0) * 10 - distance, // Simple ranking for Google places
              source: 'google',
            });
          }
        }
      } catch (error) {
        console.error('Google Places API error:', error);
        // Continue without Google results
      }
    }

    // Log summary of distance calculation
    if (process.env.NODE_ENV === 'development') {
      const shopsWithDistance = mergedShops.filter(s => s.distance !== undefined).length;
      const shopsWithoutDistance = mergedShops.filter(s => s.distance === undefined).length;
      console.log(`📍 Nearby API Summary:`, {
        totalShops: mergedShops.length,
        shopsWithDistance,
        shopsWithoutDistance,
        hasValidUserLocation: hasValidCoords,
      });
    }

    // 3. Sort: Paid shops first, then by rank score
    mergedShops.sort((a, b) => {
      // First priority: Paid shops
      if (a.isPaid && !b.isPaid) return -1;
      if (!a.isPaid && b.isPaid) return 1;

      // Second priority: Plan priority (higher is better)
      if (a.planPriority !== b.planPriority) {
        return b.planPriority - a.planPriority;
      }

      // Third priority: Rank score (higher is better)
      if (a.rankScore !== b.rankScore) {
        return b.rankScore - a.rankScore;
      }

      // Fourth priority: Distance (closer is better)
      // Handle undefined distances - shops with valid distance come first
      if (a.distance === undefined && b.distance === undefined) return 0;
      if (a.distance === undefined) return 1; // Put undefined distances at the end
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });

    // 4. Paginate
    const paginatedShops = mergedShops.slice(skip, skip + limit);

    const result = {
      shops: paginatedShops,
      page,
      limit,
      total: mergedShops.length,
      sources: {
        mongodb: mongoShops.length,
        google: mergedShops.filter((s) => s.source === 'google').length,
      },
    };

    // Cache for 5 minutes
    await cacheSet(cacheKey, JSON.stringify(result), 300);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Nearby shops error:', error);
    console.error('Error stack:', error.stack);
    
    // Return more detailed error in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message || 'Internal server error'
      : 'Failed to load shops. Please try again.';
    
    return NextResponse.json({ 
      error: errorMessage,
      shops: [], // Return empty array so frontend doesn't break
      page: 1,
      limit: 20,
      total: 0,
      sources: { mongodb: 0, google: 0 }
    }, { status: 500 });
  }
}
