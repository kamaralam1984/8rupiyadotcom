import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop, { ShopStatus } from '@/models/Shop';
import Plan from '@/models/Plan';
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
  visitorCount?: number;
  likeCount?: number;
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
          $maxDistance: 1000000, // 1000km radius in meters
        },
      };
    } else if (city) {
      // If no location, filter by city
      mongoQuery.city = { $regex: city, $options: 'i' };
    }

    if (category) {
      mongoQuery.category = { $regex: category, $options: 'i' };
    }

    // Fetch shops with reasonable limit - OPTIMIZED: Only select needed fields
    let mongoShops;
    try {
      mongoShops = await Shop.find(mongoQuery)
        .select('name category address city location rating reviewCount visitorCount likeCount isFeatured planId images phone email status rankScore')
        .populate('planId', 'name price') // Only get name and price from plan
        .limit(hasValidCoords ? 200 : 50) // Reduced limit for faster queries
        .lean()
        .sort({ rankScore: -1, isPaid: -1, createdAt: -1 }); // Sort in DB for better performance
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

    // Process MongoDB shops - Filter out pending shops (extra safety check)
    const validShops = mongoShops.filter(shop => 
      shop.status === ShopStatus.ACTIVE || shop.status === ShopStatus.APPROVED
    );
    
    for (const shop of validShops) {
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
      
      // Generate random rating if rating is 0 or undefined (between 3.0 to 5.0)
      let shopRating = shop.rating || 0;
      if (shopRating === 0 || !shopRating) {
        // Generate random rating between 3.0 and 5.0
        // Use shop._id as seed for consistent random rating per shop
        const shopIdString = shop._id.toString();
        const seed = shopIdString.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const seededRandom = (seed: number) => {
          const x = Math.sin(seed) * 10000;
          return x - Math.floor(x);
        };
        shopRating = 3.0 + (seededRandom(seed) * 2.0); // Random between 3.0-5.0
        shopRating = Math.round(shopRating * 10) / 10; // Round to 1 decimal
      }
      
      // Generate random review count if 0 (between 5 to 100)
      let shopReviewCount = shop.reviewCount || 0;
      if (shopReviewCount === 0) {
        const shopIdString = shop._id.toString();
        const seed = shopIdString.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const seededRandom = (seed: number) => {
          const x = Math.sin(seed + 100) * 10000;
          return x - Math.floor(x);
        };
        shopReviewCount = Math.floor(5 + (seededRandom(seed) * 95)); // Random between 5-100
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
        rating: shopRating,
        reviewCount: shopReviewCount,
        visitorCount: shop.visitorCount || 0,
        likeCount: shop.likeCount || 0,
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
              visitorCount: 0, // Google places don't have visitor count
              likeCount: 0, // Google places don't have like count
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

    // 3. Sort: Distance first (0km se start), then paid shops within same distance range
    mergedShops.sort((a, b) => {
      // First priority: Distance (closer is better - 0km se start)
      // Handle undefined distances - shops with valid distance come first
      if (a.distance === undefined && b.distance === undefined) {
        // Both undefined - sort by paid status, then rank
        if (a.isPaid && !b.isPaid) return -1;
        if (!a.isPaid && b.isPaid) return 1;
        if (a.planPriority !== b.planPriority) {
          return b.planPriority - a.planPriority;
        }
        return b.rankScore - a.rankScore;
      }
      if (a.distance === undefined) return 1; // Put undefined distances at the end
      if (b.distance === undefined) return -1;
      
      // Round distance to nearest 0.5km for grouping (so shops within same range are grouped)
      const distanceA = Math.floor(a.distance * 2) / 2; // Round to 0.5km
      const distanceB = Math.floor(b.distance * 2) / 2;
      
      // If shops are in different distance ranges, sort by distance (closer first)
      if (distanceA !== distanceB) {
        return a.distance - b.distance;
      }
      
      // Same distance range - prioritize paid shops, then plan priority, then rank score
      if (a.isPaid && !b.isPaid) return -1;
      if (!a.isPaid && b.isPaid) return 1;
      
      if (a.planPriority !== b.planPriority) {
        return b.planPriority - a.planPriority;
      }
      
      if (a.rankScore !== b.rankScore) {
        return b.rankScore - a.rankScore;
      }
      
      // If everything is same, sort by exact distance
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

    // Cache for 15 minutes (aggressive caching for speed)
    await cacheSet(cacheKey, JSON.stringify(result), 900);

    // Add HTTP cache headers for browser caching
    const response = NextResponse.json(result);
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return response;
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
