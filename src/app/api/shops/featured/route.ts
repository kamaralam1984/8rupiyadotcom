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
  distance?: number;
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
    const type = searchParams.get('type') || 'best'; // 'best', 'featured', or 'premium'
    const useGoogle = searchParams.get('google') !== 'false';

    // Check if we have valid coordinates
    const hasValidCoords = lat !== null && lng !== null && 
                          !isNaN(lat) && !isNaN(lng) &&
                          lat >= -90 && lat <= 90 && 
                          lng >= -180 && lng <= 180;

    // Create cache key
    const cacheKey = `shops:featured:${type}:${lat}:${lng}:${city}:${category}:${useGoogle}`;

    // Try to get from cache
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const mergedShops: MergedShop[] = [];

    // 1. Get shops from MongoDB
    let mongoQuery: any = { 
      status: { $in: [ShopStatus.ACTIVE, ShopStatus.APPROVED] },
      $and: [
        {
          'location.coordinates': {
            $exists: true,
            $ne: null,
            $size: 2,
          },
        },
        {
          'location.coordinates.0': { $nin: [null, 0] },
        },
        {
          'location.coordinates.1': { $nin: [null, 0] },
        },
      ],
    };

    // For featured type, filter by isFeatured
    if (type === 'featured') {
      mongoQuery.isFeatured = true;
    }
    
    // For premium type, filter by isPremium flag (admin can set) or has planId
    if (type === 'premium') {
      mongoQuery.$or = [
        { isPremium: true },
        { planId: { $exists: true, $ne: null } }
      ];
    }
    
    // Filter by category if provided
    if (category) {
      mongoQuery.category = { $regex: category, $options: 'i' };
    }

    // If we have valid coordinates, use $near (0km to 20000km range)
    if (hasValidCoords) {
      mongoQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: 20000000, // 20000km radius (0km to 20000km)
        },
      };
    } else if (city) {
      mongoQuery.city = { $regex: city, $options: 'i' };
    }

    // Fetch shops
    let mongoShops;
    try {
      mongoShops = await Shop.find(mongoQuery)
        .populate('planId')
        .populate('shopperId', 'name email phone')
        .limit(hasValidCoords ? 200 : 100)
        .lean();
    } catch (error: any) {
      if (error.message?.includes('index') || error.message?.includes('near')) {
        delete mongoQuery.location;
        mongoShops = await Shop.find(mongoQuery)
          .populate('planId')
          .populate('shopperId', 'name email phone')
          .limit(100)
          .lean();
      } else {
        throw error;
      }
    }

    // Process MongoDB shops
    for (const shop of mongoShops) {
      let distance: number | undefined = undefined;
      if (hasValidCoords && shop.location?.coordinates && 
          Array.isArray(shop.location.coordinates) && 
          shop.location.coordinates.length === 2) {
        const shopLng = shop.location.coordinates[0];
        const shopLat = shop.location.coordinates[1];
        
        if (!isNaN(shopLng) && !isNaN(shopLat) &&
            shopLng >= -180 && shopLng <= 180 &&
            shopLat >= -90 && shopLat <= 90 &&
            shopLng !== 0 && shopLat !== 0) {
          distance = calculateDistance(lat!, lng!, shopLat, shopLng);
        }
      }

      // Get plan priority
      let planPriority = 0;
      try {
        if (shop.planId) {
          const planId = shop.planId._id || shop.planId;
          planPriority = await getPlanPriority(planId);
        }
      } catch (error) {
        planPriority = 0;
      }
      
      // Generate random rating if needed
      let shopRating = shop.rating || 0;
      if (shopRating === 0 || !shopRating) {
        const shopIdString = shop._id.toString();
        const seed = shopIdString.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const seededRandom = (seed: number) => {
          const x = Math.sin(seed) * 10000;
          return x - Math.floor(x);
        };
        shopRating = 3.0 + (seededRandom(seed) * 2.0);
        shopRating = Math.round(shopRating * 10) / 10;
      }
      
      // Generate random review count if needed
      let shopReviewCount = shop.reviewCount || 0;
      if (shopReviewCount === 0) {
        const shopIdString = shop._id.toString();
        const seed = shopIdString.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const seededRandom = (seed: number) => {
          const x = Math.sin(seed + 100) * 10000;
          return x - Math.floor(x);
        };
        shopReviewCount = Math.floor(5 + (seededRandom(seed) * 95));
      }
      
      const rankScore = calculateRankScore(shop, distance !== undefined ? distance : 0);

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
        distance: distance !== undefined ? Math.round(distance * 100) / 100 : undefined,
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

    // 2. Get shops from Google Places API (if enabled)
    if (useGoogle && hasValidCoords) {
      try {
        const googlePlaces = await getNearbyPlacesFromGoogle({
          latitude: lat,
          longitude: lng,
          radius: 50000, // 50km
          type: 'establishment',
        });

        for (const place of googlePlaces) {
          const existsInMongo = mergedShops.some(
            (s) =>
              s.name.toLowerCase() === place.name.toLowerCase() &&
              Math.abs(s.location.coordinates[1] - place.geometry.location.lat) < 0.001 &&
              Math.abs(s.location.coordinates[0] - place.geometry.location.lng) < 0.001
          );

          if (!existsInMongo) {
            const distance = googleDistance(
              lat,
              lng,
              place.geometry.location.lat,
              place.geometry.location.lng
            );

            // Only add Google places within 20000km range
            if (distance <= 20000) {
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
              visitorCount: 0,
              likeCount: 0,
              distance: Math.round(distance * 100) / 100,
              isFeatured: false,
              isPaid: false,
              planPriority: 0,
              rankScore: (place.rating || 0) * 10 - distance,
              source: 'google',
            });
            }
          }
        }
      } catch (error) {
        console.error('Google Places API error:', error);
      }
    }

    // 3. Filter shops by distance (0km to 20000km) - nearby system
    const MAX_DISTANCE_KM = 20000;
    const filteredShops = mergedShops.filter((shop) => {
      // If shop has distance, it must be within 20000km
      if (shop.distance !== undefined) {
        return shop.distance <= MAX_DISTANCE_KM;
      }
      // If no distance (no user location), include all shops
      return true;
    });

    // 4. Sort based on type
    if (type === 'best') {
      // ⚡ Best Shops Near You: Sort by DISTANCE only (0km to 20000km)
      filteredShops.sort((a, b) => {
        // Handle undefined distances - shops with valid distance come first
        if (a.distance === undefined && b.distance === undefined) return 0;
        if (a.distance === undefined) return 1; // Put undefined distances at the end
        if (b.distance === undefined) return -1;
        // Sort by distance: 0km first, then ascending order (closer = better)
        if (a.distance === 0 && b.distance !== 0) return -1;
        if (a.distance !== 0 && b.distance === 0) return 1;
        return a.distance - b.distance;
      });
    } else if (type === 'featured') {
      // ⚡ Featured Shops: Sort by RATING (highest first), but still use nearby system (0-20000km)
      filteredShops.sort((a, b) => {
        // First priority: Rating (highest first)
        if (a.rating !== b.rating) {
          return b.rating - a.rating;
        }
        // Second priority: Review count (more reviews = better)
        if (a.reviewCount !== b.reviewCount) {
          return b.reviewCount - a.reviewCount;
        }
        // Third priority: Distance (closer is better) - for nearby system
        if (a.distance === undefined && b.distance === undefined) return 0;
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        if (a.distance === 0 && b.distance !== 0) return -1;
        if (a.distance !== 0 && b.distance === 0) return 1;
        return a.distance - b.distance;
      });
    } else {
      // Premium or other types: Original sorting logic
      filteredShops.sort((a, b) => {
      // First priority: Paid shops
      if (a.isPaid && !b.isPaid) return -1;
      if (!a.isPaid && b.isPaid) return 1;

      // Second priority: Plan priority
      if (a.planPriority !== b.planPriority) {
        return b.planPriority - a.planPriority;
      }

        // Third priority: Rank score
      if (a.rankScore !== b.rankScore) {
        return b.rankScore - a.rankScore;
      }

        // Fourth priority: Distance (closer is better)
      if (a.distance === undefined && b.distance === undefined) return 0;
        if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      if (a.distance === 0 && b.distance !== 0) return -1;
      if (a.distance !== 0 && b.distance === 0) return 1;
      return a.distance - b.distance;
    });
    }

    // 5. Return exactly 10 shops (from filtered and sorted list)
    const result = {
      shops: filteredShops.slice(0, 10),
      total: filteredShops.length,
      type,
      sources: {
        mongodb: mongoShops.length,
        google: filteredShops.filter((s) => s.source === 'google').length,
      },
    };

    // Cache for 5 minutes
    await cacheSet(cacheKey, JSON.stringify(result), 300);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Featured shops API error:', error);
    
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'best';
    
    return NextResponse.json({ 
      error: process.env.NODE_ENV === 'development' 
        ? error.message || 'Internal server error'
        : 'Failed to load shops. Please try again.',
      shops: [],
      total: 0,
      type,
      sources: { mongodb: 0, google: 0 }
    }, { status: 500 });
  }
}

