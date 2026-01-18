'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import NavbarAirbnb from './NavbarAirbnb';
import FeaturedShopsSlider from './FeaturedShopsSlider';
import HeroFeaturedBusinesses from './HeroFeaturedBusinesses';
import AdSlider from './AdSlider';
import ShopSection from './ShopSection';
import FlashSpotlight from './FlashSpotlight';
import DiscoverSection from './DiscoverSection';
import BusinessesGrid from './BusinessesGrid';
import FooterMinimal from './FooterMinimal';
import SEODynamicContent from './SEODynamicContent';
import SEOKeywordsSection from './SEOKeywordsSection';
import NearShop from './NearShop';
// Dynamic import for ShopPopup
const ShopPopup = dynamic(() => import('./ShopPopup'), {
  ssr: false,
});

interface Shop {
  _id?: string;
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

  // Get user location
  useEffect(() => {
    // Try to get from localStorage first
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        if (parsed.lat && parsed.lng) {
          setLocation(parsed);
          return;
        }
      } catch (e) {
        // Invalid saved location, continue to geolocation
      }
    }

    // Try browser geolocation
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
          // Default to Patna if geolocation fails
          const defaultLoc = { lat: 25.5941, lng: 85.1376 };
          setLocation(defaultLoc);
          localStorage.setItem('userLocation', JSON.stringify(defaultLoc));
        },
        { timeout: 5000 } // 5 second timeout
      );
    } else {
      // Default to Patna if geolocation not available
      const defaultLoc = { lat: 25.5941, lng: 85.1376 };
      setLocation(defaultLoc);
      localStorage.setItem('userLocation', JSON.stringify(defaultLoc));
    }
  }, []);

  // Fetch shops
  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (location) {
          params.append('lat', location.lat.toString());
          params.append('lng', location.lng.toString());
        }
        
        // Add search query from URL
        if (searchQuery) {
          params.append('shopName', searchQuery);
        }
        
        // Add category filter from URL
        if (categoryFilter) {
          params.append('category', categoryFilter);
        }
        
        params.append('limit', '50'); // Get more shops for homepage
        params.append('page', '1');

        // Use cache for faster loading (client-side caching)
        // Include search query and category in cache key to avoid showing wrong results
        const cacheKey = `shops-${location?.lat}-${location?.lng}-${searchQuery}-${categoryFilter}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached && !searchQuery && !categoryFilter) { // Only use cache if no search/filter active
          const cachedData = JSON.parse(cached);
          const now = Date.now();
          if (now - cachedData.timestamp < 300000) { // 5 minutes cache
            setShops(cachedData.shops);
            setLoading(false);
            return;
          }
        }

        const response = await fetch(`/api/shops/nearby?${params}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.shops && Array.isArray(data.shops)) {
          // Map API response to component format
          const mappedShops = data.shops.map((shop: any) => ({
            _id: shop._id,
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

    // Fetch shops - will work with or without location
    fetchShops();
  }, [location, searchQuery, categoryFilter]);

  // Fetch featured shops
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const params = new URLSearchParams();
        
        if (location) {
          params.append('lat', location.lat.toString());
          params.append('lng', location.lng.toString());
        }
        params.append('type', 'featured');
        params.append('google', 'false');

        // Use cache for faster loading (client-side caching)
        const cacheKey = `featured-shops-${location?.lat}-${location?.lng}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          const now = Date.now();
          if (now - cachedData.timestamp < 300000) { // 5 minutes cache
            setFeaturedShops(cachedData.shops);
            return;
          }
        }

        const response = await fetch(`/api/shops/featured?${params}`, {
          cache: 'default',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.shops && Array.isArray(data.shops)) {
          // Map API response to component format
          const mappedShops = data.shops.map((shop: any) => ({
            _id: shop._id,
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

    // Fetch featured shops even without location
    fetchFeatured();
  }, [location]);

  const handleShopClick = (shop: Shop) => {
    setSelectedShop(shop);
    setIsPopupOpen(true);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Get most rated shops (top 8 by rating)
  const mostRatedShops = [...shops]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8);

  // Get most reviewed shops (top 8 by review count)
  const mostReviewedShops = [...shops]
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

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
