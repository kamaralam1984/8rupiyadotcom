'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import NavbarAirbnb from './NavbarAirbnb';
// ⚡ ULTRA-FAST: Lazy load heavy components for faster initial load
const FeaturedShopsSlider = dynamic(() => import('./FeaturedShopsSlider'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />,
});
const HeroFeaturedBusinesses = dynamic(() => import('./HeroFeaturedBusinesses'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />,
});
const AdSlider = dynamic(() => import('./AdSlider'), {
  ssr: false,
});
const ShopSection = dynamic(() => import('./ShopSection'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />,
});
const FlashSpotlight = dynamic(() => import('./FlashSpotlight'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />,
});
const DiscoverSection = dynamic(() => import('./DiscoverSection'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />,
});
const BusinessesGrid = dynamic(() => import('./BusinessesGrid'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />,
});
const FooterMinimal = dynamic(() => import('./FooterMinimal'), {
  ssr: false,
});
const SEODynamicContent = dynamic(() => import('./SEODynamicContent'), {
  ssr: false,
});
const SEOKeywordsSection = dynamic(() => import('./SEOKeywordsSection'), {
  ssr: false,
});
const NearShop = dynamic(() => import('./NearShop'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />,
});
// Dynamic import for ShopPopup
const ShopPopup = dynamic(() => import('./ShopPopup'), {
  ssr: false,
});

interface Shop {
  _id?: string;
  place_id?: string; // For Google Places shops
  name: string;
  shopName?: string;
  category: string;
  address: string;
  city: string;
  area?: string;
  pincode?: string;
  images?: string[];
  photos?: string[];
  photoUrl?: string;
  rating: number;
  reviewCount: number;
  distance?: number;
  isFeatured: boolean;
  isPaid?: boolean;
  planType?: string;
  visitorCount?: number;
  createdAt?: string;
  offerText?: string;
  offerExpiry?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

function HomepageNewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [shops, setShops] = useState<Shop[]>([]);
  const [featuredShops, setFeaturedShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Get search params from URL
  const searchQuery = searchParams?.get('q') || '';
  const categoryFilter = searchParams?.get('category') || '';

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, []);

  // ⚡ ULTRA-FAST: Get user location - use default immediately, update in background
  useEffect(() => {
    // ⚡ Set default location immediately (no blocking)
    const defaultLoc = { lat: 25.5941, lng: 85.1376 };
    setLocation(defaultLoc);
    
    // Try to get from localStorage first (non-blocking)
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        if (parsed.lat && parsed.lng) {
          setLocation(parsed);
        }
      } catch (e) {
        // Invalid saved location, keep default
      }
    }

    // ⚡ Try browser geolocation in background (non-blocking, no timeout)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(loc);
          localStorage.setItem('userLocation', JSON.stringify(loc));
        },
        () => {
          // Keep default location if geolocation fails
        },
        { timeout: 10000, enableHighAccuracy: false } // Non-blocking, no strict timeout
      );
    }
  }, []);

  // ⚡ ULTRA-FAST: Progressive loading - show initial shops immediately, load more in background
  useEffect(() => {
    const fetchShops = async () => {
      try {
        // ⚡ Show cached data immediately if available (instant display)
        const cacheKey = `shops-${location?.lat}-${location?.lng}-${searchQuery}-${categoryFilter}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached && !searchQuery && !categoryFilter) {
          const cachedData = JSON.parse(cached);
          const now = Date.now();
          if (now - cachedData.timestamp < 300000) { // 5 minutes cache
            setShops(cachedData.shops);
            setLoading(false);
            // Still fetch fresh data in background
          }
        } else {
          setLoading(true);
        }

        const params = new URLSearchParams();
        
        if (location) {
          params.append('lat', location.lat.toString());
          params.append('lng', location.lng.toString());
        }
        
        if (searchQuery) {
          params.append('shopName', searchQuery);
        }
        
        if (categoryFilter) {
          params.append('category', categoryFilter);
        }
        
        // ⚡ Progressive loading: Fetch only 20 shops initially for fast response
        params.append('limit', '20');
        params.append('page', '1');
        params.append('google', 'false'); // Disable Google for faster response

        // ⚡ Use fetch with cache control for faster response
        const response = await fetch(`/api/shops/nearby?${params}`, {
          cache: 'force-cache', // Aggressive caching
          next: { revalidate: 60 }, // Revalidate every 60 seconds
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.shops && Array.isArray(data.shops)) {
          // ⚡ Fix duplicate keys: Filter duplicates by _id/place_id before mapping
          const seenIds = new Set<string>();
          const uniqueShops = data.shops.filter((shop: any) => {
            const shopId = shop._id || shop.place_id || '';
            if (shopId && seenIds.has(shopId)) return false; // Skip duplicate
            if (shopId) seenIds.add(shopId);
            return true;
          });
          
          const mappedShops = uniqueShops.map((shop: any) => ({
            _id: shop._id,
            place_id: shop.place_id,
            name: shop.name || shop.shopName || '',
            shopName: shop.shopName || shop.name || '',
            category: shop.category || '',
            address: shop.address || '',
            city: shop.city || '',
            area: shop.area || '',
            pincode: shop.pincode || '',
            images: shop.images || shop.photos || [],
            photos: shop.photos || shop.images || [],
            photoUrl: shop.images?.[0] || shop.photos?.[0] || shop.photoUrl || '',
            rating: shop.rating || 0,
            reviewCount: shop.reviewCount || 0,
            distance: shop.distance,
            isFeatured: shop.isFeatured || false,
            isPaid: shop.isPaid || !!shop.planId,
            planType: shop.planType || shop.planId?.name || '',
            visitorCount: shop.visitorCount || 0,
            createdAt: shop.createdAt,
            location: shop.location,
            phone: shop.phone,
            email: shop.email,
            website: shop.website,
            description: shop.description,
          }));
          setShops(mappedShops);
          // Cache the response
          sessionStorage.setItem(cacheKey, JSON.stringify({
            shops: mappedShops,
            timestamp: Date.now(),
          }));
          
          // ⚡ Load more shops in background (non-blocking)
          if (!searchQuery && !categoryFilter) {
            setTimeout(async () => {
              const moreParams = new URLSearchParams(params);
              moreParams.set('limit', '30');
              moreParams.set('page', '2');
              try {
                const moreResponse = await fetch(`/api/shops/nearby?${moreParams}`);
                const moreData = await moreResponse.json();
                if (moreData.shops && moreData.shops.length > 0) {
                  // ⚡ Fix duplicate keys: Filter duplicates before adding
                  const existingIds = new Set(shops.map(s => s._id || s.place_id || '').filter(Boolean));
                  const uniqueMoreShops = moreData.shops.filter((shop: any) => {
                    const shopId = shop._id || shop.place_id || '';
                    return shopId && !existingIds.has(shopId);
                  });
                  
                  const moreMappedShops = uniqueMoreShops.map((shop: any) => ({
                    _id: shop._id,
                    place_id: shop.place_id,
                    name: shop.name || shop.shopName || '',
                    shopName: shop.shopName || shop.name || '',
                    category: shop.category || '',
                    address: shop.address || '',
                    city: shop.city || '',
                    area: shop.area || '',
                    pincode: shop.pincode || '',
                    images: shop.images || shop.photos || [],
                    photos: shop.photos || shop.images || [],
                    photoUrl: shop.images?.[0] || shop.photos?.[0] || shop.photoUrl || '',
                    rating: shop.rating || 0,
                    reviewCount: shop.reviewCount || 0,
                    distance: shop.distance,
                    isFeatured: shop.isFeatured || false,
                    isPaid: shop.isPaid || !!shop.planId,
                    planType: shop.planType || shop.planId?.name || '',
                    visitorCount: shop.visitorCount || 0,
                    createdAt: shop.createdAt,
                    location: shop.location,
                    phone: shop.phone,
                    email: shop.email,
                    website: shop.website,
                    description: shop.description,
                  }));
                  setShops(prev => {
                    // ⚡ Double-check for duplicates when merging
                    const prevIds = new Set(prev.map((s: Shop) => s._id || s.place_id || '').filter(Boolean));
                    const newShops = moreMappedShops.filter((s: Shop) => {
                      const shopId = s._id || s.place_id || '';
                      return !shopId || !prevIds.has(shopId);
                    });
                    return [...prev, ...newShops];
                  });
                }
              } catch (error) {
                // Silent fail for background loading
              }
            }, 1000); // Load more after 1 second
          }
        } else {
          setShops([]);
        }
      } catch (error) {
        console.error('Failed to fetch shops:', error);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    // ⚡ Fetch shops immediately (location is always set to default)
    fetchShops();
  }, [location, searchQuery, categoryFilter]);

  // ⚡ ULTRA-FAST: Fetch featured shops in parallel (non-blocking)
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // ⚡ Check cache first
        const cacheKey = `featured-shops-${location?.lat}-${location?.lng}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          const now = Date.now();
          if (now - cachedData.timestamp < 300000) { // 5 minutes cache
            setFeaturedShops(cachedData.shops);
            // Still fetch fresh data in background
          }
        }

        const params = new URLSearchParams();
        
        if (location) {
          params.append('lat', location.lat.toString());
          params.append('lng', location.lng.toString());
        }
        params.append('type', 'featured');
        params.append('google', 'false'); // Disable Google for faster response

        // ⚡ Use aggressive caching
        const response = await fetch(`/api/shops/featured?${params}`, {
          cache: 'force-cache',
          next: { revalidate: 300 }, // Revalidate every 5 minutes
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.shops && Array.isArray(data.shops)) {
          // ⚡ Fix duplicate keys: Filter duplicates by _id/place_id before mapping
          const seenIds = new Set<string>();
          const uniqueShops = data.shops.filter((shop: any) => {
            const shopId = shop._id || shop.place_id || '';
            if (shopId && seenIds.has(shopId)) return false; // Skip duplicate
            if (shopId) seenIds.add(shopId);
            return true;
          });
          
          const mappedShops = uniqueShops.map((shop: any) => ({
            _id: shop._id,
            place_id: shop.place_id,
            name: shop.name || shop.shopName || '',
            shopName: shop.shopName || shop.name || '',
            category: shop.category || '',
            address: shop.address || '',
            city: shop.city || '',
            area: shop.area || '',
            pincode: shop.pincode || '',
            images: shop.images || shop.photos || [],
            photos: shop.photos || shop.images || [],
            photoUrl: shop.images?.[0] || shop.photos?.[0] || shop.photoUrl || '',
            rating: shop.rating || 0,
            reviewCount: shop.reviewCount || 0,
            distance: shop.distance,
            isFeatured: shop.isFeatured || false,
            isPaid: shop.isPaid || !!shop.planId,
            planType: shop.planType || shop.planId?.name || '',
            visitorCount: shop.visitorCount || 0,
            createdAt: shop.createdAt,
            location: shop.location,
            phone: shop.phone,
            email: shop.email,
            website: shop.website,
            description: shop.description,
          }));
          setFeaturedShops(mappedShops);
          // Cache the response
          sessionStorage.setItem(cacheKey, JSON.stringify({
            shops: mappedShops,
            timestamp: Date.now(),
          }));
        } else {
          setFeaturedShops([]);
        }
      } catch (error) {
        console.error('Failed to fetch featured shops:', error);
        setFeaturedShops([]);
      }
    };

    // ⚡ Fetch featured shops in parallel (non-blocking)
    fetchFeatured();
  }, [location]);

  const handleShopClick = (shop: Shop) => {
    setSelectedShop(shop);
    setIsPopupOpen(true);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // ⚡ Fix duplicate keys: Filter duplicates before creating derived arrays
  const getUniqueShops = (shopList: Shop[]) => {
    const seenIds = new Set<string>();
    return shopList.filter(shop => {
      const shopId = shop._id || shop.place_id || '';
      if (shopId && seenIds.has(shopId)) return false; // Skip duplicate
      if (shopId) seenIds.add(shopId);
      return true;
    });
  };

  // Get most rated shops (top 8 by rating)
  const mostRatedShops = getUniqueShops([...shops])
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8);

  // Get most reviewed shops (top 8 by review count)
  const mostReviewedShops = getUniqueShops([...shops])
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 8);

  // ⚡ ULTRA-FAST: Don't block entire page - show content immediately with loading states
  // Removed full-page loading spinner for faster perceived performance

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* NavbarAirbnb - Top Navigation */}
      <NavbarAirbnb user={user} onLogout={handleLogout} />

      {/* Show search results message if search/category filter is active */}
      {(searchQuery || categoryFilter) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {searchQuery && categoryFilter
                    ? `Search results for "${searchQuery}" in ${categoryFilter}`
                    : searchQuery
                    ? `Search results for "${searchQuery}"`
                    : `Shops in ${categoryFilter}`}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {shops.length} {shops.length === 1 ? 'shop found' : 'shops found'}
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show no results message */}
      {!loading && (searchQuery || categoryFilter) && shops.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No shops found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery && categoryFilter
                ? `We couldn't find any shops matching "${searchQuery}" in ${categoryFilter}.`
                : searchQuery
                ? `We couldn't find any shops matching "${searchQuery}".`
                : `We couldn't find any shops in ${categoryFilter}.`}
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              View All Shops
            </button>
          </div>
        </div>
      )}

      {/* FeaturedShopsSlider - Featured Shops */}
      {!searchQuery && !categoryFilter && (
        <FeaturedShopsSlider shops={featuredShops} onShopClick={handleShopClick} />
      )}

      {/* HeroFeaturedBusinesses - Hero Section */}
      <HeroFeaturedBusinesses shops={shops} onShopClick={handleShopClick} />

      {/* AdSlider - Promotional Ads */}
      <AdSlider ads={[]} />

      {/* NearShop - Shops from 20 different categories nearby */}
      <NearShop 
        userLocation={location} 
        onShopClick={handleShopClick}
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
      />

      {/* ShopSection - Most Rated Shops */}
      <ShopSection
        title="Most Rated Shops"
        shops={mostRatedShops}
        sortBy="rating"
        onShopClick={handleShopClick}
      />

      {/* FlashSpotlight - Limited Offers */}
      <FlashSpotlight shops={shops} onShopClick={handleShopClick} />

      {/* ShopSection - Most Reviewed Shops */}
      <ShopSection
        title="Most Reviewed Shops"
        shops={mostReviewedShops}
        sortBy="reviews"
        onShopClick={handleShopClick}
      />

      {/* DiscoverSection - Category Tiles */}
      <DiscoverSection />

      {/* SEO Keywords Section - Moved to About Page */}
      {/* <SEOKeywordsSection shops={shops} /> */}

      {/* BusinessesGrid - All Listings with Filters */}
      <BusinessesGrid shops={shops} onShopClick={handleShopClick} />

      {/* Dynamic SEO Structured Data */}
      <SEODynamicContent shops={shops} />

      {/* FooterMinimal - Footer */}
      <FooterMinimal />

      {/* Shop Details Modal */}
      {isPopupOpen && selectedShop && (
        <ShopPopup
          shop={selectedShop}
          isOpen={isPopupOpen}
          onClose={() => {
            setIsPopupOpen(false);
            setSelectedShop(null);
          }}
          userLocation={location}
        />
      )}
    </div>
  );
}

export default function HomepageNew() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <HomepageNewContent />
    </Suspense>
  );
}
