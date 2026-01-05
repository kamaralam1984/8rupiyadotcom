'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ConnectionStatus from './ConnectionStatus';
import Hero from './Hero';
import ShopCard from './ShopCard';
import AdSlot from './AdSlot';

// ⚡ Lazy load heavy sections for better performance
const AboutSection = dynamic(() => import('./AboutSection'), {
  ssr: true, // Keep SSR for SEO
});

const SEOTextSection = dynamic(() => import('./SEOTextSection'), {
  ssr: true, // Keep SSR for SEO
});

const TextBreakSection = dynamic(() => import('./TextBreakSection'), {
  ssr: true,
});

const MixedContentSection = dynamic(() => import('./MixedContentSection'), {
  ssr: true,
});

const WhatMakesSpecialSection = dynamic(() => import('./WhatMakesSpecialSection'), {
  ssr: true,
});

const LeftRail = dynamic(() => import('./LeftRail'), {
  ssr: false,
  loading: () => null,
});

const MobileFilterPanel = dynamic(() => import('./MobileFilterPanel'), {
  ssr: false,
  loading: () => null,
});

const RightRail = dynamic(() => import('./RightRail'), {
  ssr: false,
  loading: () => null,
});

const Nearby = dynamic(() => import('./Nearby'), {
  ssr: false,
  loading: () => null,
});

const TopRated = dynamic(() => import('./TopRated'), {
  ssr: false,
  loading: () => null,
});
import { FiShoppingBag, FiTrendingUp, FiAward, FiSearch, FiMapPin, FiUser, FiLogOut, FiCheck } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import AdStatusIndicator from './AdStatusIndicator';

// ⚡ Dynamic imports for heavy components (lazy load for better performance)
const AIAssistant = dynamic(() => import('./AIAssistant'), {
  ssr: false, // Don't render on server
  loading: () => null, // No loading indicator
});

// ⚡ Lazy load other heavy components
const ShopPopup = dynamic(() => import('./ShopPopup'), {
  ssr: false,
  loading: () => null,
});

const AdvertisementBanner = dynamic(() => import('./AdvertisementBanner'), {
  ssr: false,
  loading: () => null,
});

const InFeedAd = dynamic(() => import('./InFeedAd'), {
  ssr: false,
  loading: () => null,
});

const DisplayAd = dynamic(() => import('./DisplayAd'), {
  ssr: false,
  loading: () => null,
});

interface Shop {
  _id?: string;
  place_id?: string;
  name: string;
  description?: string;
  category: string;
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  distance?: number;
  location?: {
    coordinates: [number, number]; // [longitude, latitude]
  };
  isFeatured: boolean;
  isPaid?: boolean;
  planId?: {
    name: string;
  };
  phone?: string;
  email?: string;
  website?: string;
  source?: 'mongodb' | 'google';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

interface HomepageLayout {
  sections: {
    topCTA: { enabled: boolean; order: number };
    hero: { enabled: boolean; order: number };
    connectionStatus: { enabled: boolean; order: number };
    aboutSection: { enabled: boolean; order: number };
    seoTextSection: { enabled: boolean; order: number };
    leftRail: { enabled: boolean; order: number };
    rightRail: { enabled: boolean; order: number };
    featuredShops: { enabled: boolean; order: number; title?: string; limit?: number };
    paidShops: { enabled: boolean; order: number; title?: string; limit?: number };
    topRated: { enabled: boolean; order: number; title?: string; limit?: number };
    nearbyShops: { enabled: boolean; order: number; title?: string; limit?: number };
    mixedContent1: { enabled: boolean; order: number; variant?: string };
    mixedContent2: { enabled: boolean; order: number; variant?: string };
    mixedContent3: { enabled: boolean; order: number; variant?: string };
    mixedContent4: { enabled: boolean; order: number; variant?: string };
    displayAd1: { enabled: boolean; order: number };
    displayAd2: { enabled: boolean; order: number };
    inFeedAds: { enabled: boolean; order: number };
    stats: { enabled: boolean; order: number };
    footer: { enabled: boolean; order: number };
  };
}

export default function HomepageClient() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [homepageLayout, setHomepageLayout] = useState<HomepageLayout | null>(null);
  const [logoError, setLogoError] = useState(false);
  
  // Featured, Best, and Premium Shops states (from separate API)
  const [bestShops, setBestShops] = useState<Shop[]>([]);
  const [featuredShops, setFeaturedShops] = useState<Shop[]>([]);
  const [premiumShops, setPremiumShops] = useState<Shop[]>([]);
  const [loadingBestShops, setLoadingBestShops] = useState(false);
  const [loadingFeaturedShops, setLoadingFeaturedShops] = useState(false);
  const [loadingPremiumShops, setLoadingPremiumShops] = useState(false);
  
  // Infinite scroll states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Define functions BEFORE hooks (so they're available in useEffect)
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setUserLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle both response formats: { user: {...} } or { success: true, user: {...} }
        const userData = data.user || data;
        if (userData && userData.id) {
          setUser(userData);
        } else {
          setUser(null);
        }
      } else {
        // Token invalid, remove it
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setUser(null);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchShops = async (lat?: number, lng?: number, category?: string, city?: string, pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      const params = new URLSearchParams();
      
      // Use provided params or current state
      const useCategory = category !== undefined ? category : selectedCategory;
      const useCity = city !== undefined ? city : selectedCity;
      
      // Add location if provided (for distance calculation)
      if (lat && lng) {
        params.append('lat', lat.toString());
        params.append('lng', lng.toString());
        params.append('google', 'false'); // Don't fetch from Google for faster response
      } else if (location && location.lat && location.lng) {
        // Use stored location if available
        params.append('lat', location.lat.toString());
        params.append('lng', location.lng.toString());
        params.append('google', 'false');
      }
      // If no location, nearby API will return all shops without distance (faster)
      
      if (useCategory && useCategory !== 'All Categories' && useCategory !== t('category.all')) {
        params.append('category', useCategory);
      }
      
      if (useCity) {
        params.append('city', useCity);
      }
      
      // ⚡ Ultra-fast initial load: only 5 shops for instant display
      // Then load 20 more on each scroll
      const limit = pageNum === 1 ? 5 : 20;
      params.append('limit', limit.toString());
      params.append('page', pageNum.toString());
      params.append('skip', ((pageNum - 1) * limit).toString());

      const response = await fetch(`/api/shops/nearby?${params}`, {
        // ⚡ Aggressive caching for faster loads
        cache: pageNum === 1 ? 'force-cache' : 'default', // Cache first page aggressively
        next: { revalidate: 60 }, // Revalidate every 60 seconds
      });
      const data = await response.json();

      if (data.shops && data.shops.length > 0) {
        if (append) {
          setShops(prev => [...prev, ...data.shops]);
        } else {
          setShops(data.shops);
        }
        setHasMore(data.shops.length >= limit);
        setLoading(false);
        setLoadingMore(false);
      } else {
        if (!append) {
          fetchAllShops();
        }
        setHasMore(false);
        setLoadingMore(false);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load shops');
      setLoading(false);
      setLoadingMore(false);
      setHasMore(false);
    }
  };

  const fetchAllShops = async () => {
    try {
      // Always use nearby API system for "All Shops"
      const params = new URLSearchParams();
      
      // Add location if available (for distance calculation)
      if (location && location.lat && location.lng) {
        params.append('lat', location.lat.toString());
        params.append('lng', location.lng.toString());
      }
      
      params.append('limit', '50'); // Reduced from 100 to 50 for faster load
      params.append('google', 'false'); // Don't fetch from Google for faster response
      
      const response = await fetch(`/api/shops/nearby?${params}`, {
        cache: 'default', // Use browser cache
      });
      const data = await response.json();
      
      if (data.shops && data.shops.length > 0) {
        setShops(data.shops);
        setLoading(false);
      } else {
        // Fallback: If nearby API returns empty, try regular shops API
        const fallbackResponse = await fetch('/api/shops?limit=50&status=approved', {
          cache: 'default',
        });
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.shops && fallbackData.shops.length > 0) {
          // Calculate distance on client side if location is available (non-blocking)
          const shopsWithDistance = fallbackData.shops.map((shop: Shop) => {
            if (location && shop.location?.coordinates) {
              // Simple distance calculation (Haversine)
              const R = 6371; // Earth's radius in km
              const dLat = ((shop.location.coordinates[1] - location.lat) * Math.PI) / 180;
              const dLon = ((shop.location.coordinates[0] - location.lng) * Math.PI) / 180;
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((location.lat * Math.PI) / 180) *
                  Math.cos((shop.location.coordinates[1] * Math.PI) / 180) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              shop.distance = R * c;
            }
            return shop;
          });
          setShops(shopsWithDistance);
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Fetch all shops error:', err);
      setLoading(false);
    }
  };

  // Fetch Best Shops Near You (10 shops from nearby system)
  const fetchBestShops = async () => {
    try {
      setLoadingBestShops(true);
      const params = new URLSearchParams();
      
      if (location && location.lat && location.lng) {
        params.append('lat', location.lat.toString());
        params.append('lng', location.lng.toString());
      }
      
      if (selectedCity) {
        params.append('city', selectedCity);
      }
      
      if (selectedCategory && selectedCategory !== 'All Categories' && selectedCategory !== t('category.all')) {
        params.append('category', selectedCategory);
      }
      
      params.append('type', 'best');
      params.append('google', 'false');
      
      const response = await fetch(`/api/shops/featured?${params}`, {
        cache: 'default',
      });
      const data = await response.json();
      
      if (data.shops && data.shops.length > 0) {
        setBestShops(data.shops);
      } else {
        setBestShops([]);
      }
    } catch (err) {
      console.error('Fetch best shops error:', err);
      setBestShops([]);
    } finally {
      setLoadingBestShops(false);
    }
  };

  // Fetch Featured Shops (10 shops from nearby system)
  const fetchFeaturedShops = async () => {
    try {
      setLoadingFeaturedShops(true);
      const params = new URLSearchParams();
      
      if (location && location.lat && location.lng) {
        params.append('lat', location.lat.toString());
        params.append('lng', location.lng.toString());
      }
      
      if (selectedCity) {
        params.append('city', selectedCity);
      }
      
      if (selectedCategory && selectedCategory !== 'All Categories' && selectedCategory !== t('category.all')) {
        params.append('category', selectedCategory);
      }
      
      params.append('type', 'featured');
      params.append('google', 'false');
      
      const response = await fetch(`/api/shops/featured?${params}`, {
        cache: 'default',
      });
      const data = await response.json();
      
      if (data.shops && data.shops.length > 0) {
        setFeaturedShops(data.shops);
      } else {
        setFeaturedShops([]);
      }
    } catch (err) {
      console.error('Fetch featured shops error:', err);
      setFeaturedShops([]);
    } finally {
      setLoadingFeaturedShops(false);
    }
  };

  // Fetch Premium Shops (10 shops from nearby system)
  const fetchPremiumShops = async () => {
    try {
      setLoadingPremiumShops(true);
      const params = new URLSearchParams();
      
      if (location && location.lat && location.lng) {
        params.append('lat', location.lat.toString());
        params.append('lng', location.lng.toString());
      }
      
      if (selectedCity) {
        params.append('city', selectedCity);
      }
      
      if (selectedCategory && selectedCategory !== 'All Categories' && selectedCategory !== t('category.all')) {
        params.append('category', selectedCategory);
      }
      
      params.append('type', 'premium');
      params.append('google', 'false');
      
      const response = await fetch(`/api/shops/featured?${params}`, {
        cache: 'default',
      });
      const data = await response.json();
      
      if (data.shops && data.shops.length > 0) {
        setPremiumShops(data.shops);
      } else {
        setPremiumShops([]);
      }
    } catch (err) {
      console.error('Fetch premium shops error:', err);
      setPremiumShops([]);
    } finally {
      setLoadingPremiumShops(false);
    }
  };

  // FIX #2: All hooks must run in same order every render
  // Set mounted state first
  useEffect(() => {
    setMounted(true);
  }, []);

  // ⚡ OPTIMIZED: Defer non-critical data fetching for faster initial load
  useEffect(() => {
    if (!mounted) return;
    
    // ⚡ Priority 1: Load shops immediately (critical for first paint)
    // Shops are loaded in the location useEffect below
    
    // ⚡ Priority 2: Load homepage layout after initial render (deferred)
    const fetchLayout = async () => {
      try {
        const response = await fetch('/api/homepage-layout', {
          cache: 'force-cache', // Use cached version if available
        });
        const data = await response.json();
        if (data.success && data.layout) {
          setHomepageLayout(data.layout);
        }
      } catch (error) {
        console.error('Failed to fetch homepage layout:', error);
      }
    };
    
    // ⚡ Priority 3: Load user info after page is interactive (deferred)
    const loadUserData = () => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        // Use requestIdleCallback if available (browser is idle)
        (window as any).requestIdleCallback(() => {
          fetchUser();
        }, { timeout: 2000 });
      } else {
        // Fallback: Load after 500ms
        setTimeout(() => {
          fetchUser();
        }, 500);
      }
    };
    
    // Defer layout fetch slightly (100ms) to prioritize shops
    setTimeout(() => {
      fetchLayout();
    }, 100);
    
    // Defer user fetch even more (not critical for initial render)
    loadUserData();
  }, [mounted]);

  // Update selectedCategory when language changes
  useEffect(() => {
    if (!mounted) return;
    if (selectedCategory === 'All Categories' || selectedCategory === t('category.all')) {
      setSelectedCategory(t('category.all'));
    }
  }, [language, t, selectedCategory, mounted]);

  // Listen for storage changes (when user logs in from another tab/window)
  useEffect(() => {
    if (!mounted) return;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue) {
          fetchUser();
        } else {
          setUser(null);
        }
      }
    };

    // Also check for token changes when page becomes visible (user might have logged in in same tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const token = localStorage.getItem('token');
        if (token) {
          // Re-fetch user info in case token was updated
          fetchUser();
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mounted]);

  // Get user location (non-blocking - don't wait for it to load shops)
  // Empty dependency array [] ensures this runs only once (fixes location API spam)
  useEffect(() => {
    // Only fetch location after component is mounted
    if (!mounted) return;

    // Load shops immediately without waiting for location
    fetchShops(undefined, undefined, selectedCategory, selectedCity);
    
    // Get location in background (non-blocking) - runs only once
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          if (process.env.NODE_ENV === 'development') {
          console.log('📍 User location obtained:', { lat: userLat, lng: userLng });
          }
          setLocation({
            lat: userLat,
            lng: userLng,
          });
          // Update shops with location for distance calculation (non-blocking)
          fetchShops(userLat, userLng, selectedCategory, selectedCity);
        },
        (error) => {
          // Only log in development mode to reduce console noise
          if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Location access denied or failed:', error.message);
          }
          // Location denied, continue without it - shops already loaded
        },
        {
          enableHighAccuracy: false, // Reduced accuracy for faster response
          timeout: 10000, // Increased timeout to 10 seconds
          maximumAge: 300000, // 5 minutes cache
        }
      );
    } else {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Geolocation not supported by browser');
      }
    }
  }, [mounted]); // Only run when mounted changes

  // ⚡ OPTIMIZED: Defer Best/Featured/Premium shops - load after initial shops are visible
  useEffect(() => {
    if (!mounted) return;
    
    // Defer these fetches until after initial render (not critical for first paint)
    const loadSecondaryShops = () => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        // Use requestIdleCallback if available
        (window as any).requestIdleCallback(() => {
          fetchBestShops();
          fetchFeaturedShops();
          fetchPremiumShops();
        }, { timeout: 1000 });
      } else {
        // Fallback: Load after 300ms (after initial shops are shown)
        setTimeout(() => {
          fetchBestShops();
          fetchFeaturedShops();
          fetchPremiumShops();
        }, 300);
      }
    };
    
    loadSecondaryShops();
  }, [location, selectedCity, selectedCategory, mounted]);

  // Fetch shops when category or city changes (don't wait for location)
  useEffect(() => {
    if (!mounted) return;
    
    // Reset pagination when filters change
    setPage(1);
    setHasMore(true);
    
    // Use a small delay to debounce rapid changes
    const timeoutId = setTimeout(() => {
      // Use location if available, otherwise fetch without it (faster)
      if (location && location.lat && location.lng) {
        fetchShops(location.lat, location.lng, selectedCategory, selectedCity, 1, false);
      } else {
        // Fetch immediately without location - don't block on geolocation
        fetchShops(undefined, undefined, selectedCategory, selectedCity, 1, false);
      }
    }, 100); // Small delay to debounce

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, selectedCity, mounted, location]);

  // Infinite scroll effect - load more shops when user scrolls to bottom
  useEffect(() => {
    if (!mounted || !hasMore || loadingMore) return;

    const handleScroll = () => {
      // Check if user scrolled near bottom (500px before end)
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      if (scrollTop + clientHeight >= scrollHeight - 500) {
        // Load next page
        const nextPage = page + 1;
        setPage(nextPage);
        fetchShops(location?.lat, location?.lng, selectedCategory, selectedCity, nextPage, true);
      }
    };

    // Throttle scroll event for better performance
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledScroll = () => {
      if (throttleTimeout === null) {
        throttleTimeout = setTimeout(() => {
          handleScroll();
          throttleTimeout = null;
        }, 200); // Check every 200ms max
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [mounted, hasMore, loadingMore, page, location, selectedCategory, selectedCity]);

  // FIX #2: Mounted check AFTER all hooks (hooks must run in same order)
  if (!mounted) {
    return null;
  }

  // Helper functions for event handlers
  const handleSearch = (query: string) => {
    setSelectedCity(query);
    // fetchShops will be triggered by useEffect when selectedCity changes
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // fetchShops will be triggered by useEffect when selectedCategory changes
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    // fetchShops will be triggered by useEffect when selectedCity changes
  };

  const handleShopClick = (shop: Shop) => {
    setSelectedShop(shop);
    setIsPopupOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedShop(null);
  };

  // Sorting function to prioritize selected city/category
  const sortShopsByPriority = (shopList: Shop[]): Shop[] => {
    return [...shopList].sort((a, b) => {
      // Priority 1: Selected city match
      const aCityMatch = selectedCity && a.city.toLowerCase().includes(selectedCity.toLowerCase());
      const bCityMatch = selectedCity && b.city.toLowerCase().includes(selectedCity.toLowerCase());
      
      if (aCityMatch && !bCityMatch) return -1;
      if (!aCityMatch && bCityMatch) return 1;
      
      // Priority 2: Selected category match
      const aCategoryMatch = selectedCategory !== 'All Categories' && a.category === selectedCategory;
      const bCategoryMatch = selectedCategory !== 'All Categories' && b.category === selectedCategory;
      
      if (aCategoryMatch && !bCategoryMatch) return -1;
      if (!aCategoryMatch && bCategoryMatch) return 1;
      
      // Priority 3: Paid shops first
      if (a.isPaid && !b.isPaid) return -1;
      if (!a.isPaid && b.isPaid) return 1;
      
      // Priority 4: Featured shops
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      
      // Priority 5: Rating
      return (b.rating || 0) - (a.rating || 0);
    });
  };

  // Sort all shops with priority
  const sortedShops = sortShopsByPriority(shops);

  // Filter shops (if needed for strict filtering)
  const filteredShops = sortedShops.filter((shop) => {
    const allCategoriesText = t('category.all');
    if (selectedCategory !== allCategoriesText && selectedCategory !== 'All Categories' && shop.category !== selectedCategory) {
      return false;
    }
    if (selectedCity && !shop.city.toLowerCase().includes(selectedCity.toLowerCase())) {
      return false;
    }
    // Filter by distance: 0 to 1000km (including 0km)
    if (shop.distance !== undefined && shop.distance !== null) {
      const distanceKm = shop.distance;
      // Allow shops from 0km to 1000km (inclusive)
      if (distanceKm < 0 || distanceKm > 1000) {
        return false;
      }
      // Ensure 0km shops are included
      if (distanceKm === 0) {
        return true;
    }
    }
    // Include shops without distance (undefined/null) - they will be shown at the end
    return true;
  });

  // Get top rated and paid shops (with priority sorting)
  const topRatedShops = sortShopsByPriority(shops)
    .slice(0, 5);
    
  const paidShops = sortShopsByPriority(shops.filter((shop) => shop.isPaid))
    .slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">{t('common.loading')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Top CTA Section - Start your local business journey! */}
      {homepageLayout?.sections?.topCTA?.enabled !== false && (
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-blue-600 py-4 md:py-6 shadow-lg relative z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 md:mb-3">
              Start your local business journey!
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-blue-100 mb-4 md:mb-6 max-w-2xl mx-auto">
              Discover the best shops in your area or list your business - both are completely free!
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <motion.a
                href="#main-content"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-pink-300 dark:bg-pink-300 text-black dark:text-black px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base md:text-lg shadow-xl hover:shadow-2xl transition-all inline-flex items-center justify-center gap-2"
              >
                <FiSearch className="text-base sm:text-lg md:text-xl" />
                Explore Shops
              </motion.a>
              <motion.a
                href="/add-shop"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-yellow-400 text-gray-900 px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base md:text-lg shadow-xl hover:shadow-2xl transition-all inline-flex items-center justify-center gap-2"
              >
                <FiShoppingBag className="text-base sm:text-lg md:text-xl" />
                Add Your Business
              </motion.a>
            </div>
          </div>
        </div>
      </motion.section>
      )}

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-black/95 backdrop-blur-md shadow-lg border-b border-gray-800/50 sticky top-0 z-50"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-[8.4px] sm:py-[11.2px]">
          <div className="flex justify-between items-center gap-2 sm:gap-4">
            {/* Logo and Connection Status */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Link href="/" className="min-w-0 flex items-center" aria-label="8rupiya.com - Home">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center relative"
                >
                  {!logoError ? (
                    <div className="relative h-12 sm:h-14 md:h-18 w-auto">
                      <img
                        src="/uploads/logo.png"
                        alt="8rupiya.com Logo"
                        className="h-full w-auto object-contain"
                        loading="eager"
                        decoding="async"
                        width="150"
                        height="60"
                        onError={() => setLogoError(true)}
                        onLoad={() => setLogoError(false)}
                      />
                    </div>
                  ) : (
                    <div className="h-12 sm:h-14 md:h-16 w-auto flex items-center">
                      <span className="text-white text-lg sm:text-xl md:text-2xl font-bold">Logo</span>
                    </div>
                  )}
                </motion.div>
              </Link>
              <div className="hidden sm:block">
                <ConnectionStatus />
              </div>
            </div>

            {/* Login/Register or User Profile */}
            <nav className="flex gap-2 sm:gap-4 items-center flex-shrink-0" role="navigation" aria-label="Main navigation">
              {/* Ad Status Indicator */}
              <AdStatusIndicator />
              
              {/* Jyotish Button - Hidden for 30 days (until 30 Jan 2026) */}
              {new Date() >= new Date('2026-01-30') && (
                <Link
                  href="/jyotish"
                  className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base flex items-center gap-1 sm:gap-2"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                >
                  <span className="text-base sm:text-lg">🔮</span>
                  <span className="hidden sm:inline">JYOTISH</span>
                  <span className="sm:hidden">✨</span>
                </Link>
              )}

              {/* ADD SHOP Button */}
              <Link
                href="/add-shop"
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base flex items-center gap-1 sm:gap-2"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
              >
                <FiShoppingBag className="text-base sm:text-lg" />
                <span className="hidden sm:inline">ADD SHOP</span>
                <span className="sm:hidden">SHOP</span>
              </Link>
              
              {userLoading ? (
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              ) : user ? (
                <div className="flex items-center gap-4">
                  {/* User Profile Dropdown */}
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                      aria-label="User menu"
                      aria-expanded={isUserMenuOpen}
                      aria-haspopup="menu"
                    >
                      <FiUser className="text-base sm:text-lg" />
                      <span className="hidden sm:inline truncate max-w-[120px] md:max-w-none">{user.name}</span>
                    </button>
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsUserMenuOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
                          >
                          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{user.email}</p>
                            
                            {/* Dashboard Links for all roles */}
                            {user.role === 'admin' && (
                              <Link
                                href="/admin"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="block mt-2 px-3 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium text-center transition-all shadow-md"
                              >
                                🛡️ Admin Dashboard
                              </Link>
                            )}
                            {user.role === 'agent' && (
                              <Link
                                href="/agent"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="block mt-2 px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium text-center transition-all shadow-md"
                              >
                                👤 Agent Dashboard
                              </Link>
                            )}
                            {user.role === 'operator' && (
                              <Link
                                href="/operator"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="block mt-2 px-3 py-2 text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium text-center transition-all shadow-md"
                              >
                                👥 Operator Dashboard
                              </Link>
                            )}
                            {user.role === 'shopper' && (
                              <Link
                                href="/shopper"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="block mt-2 px-3 py-2 text-sm bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 font-medium text-center transition-all shadow-md"
                              >
                                🛍️ Shopper Dashboard
                              </Link>
                            )}
                            {user.role === 'accountant' && (
                              <Link
                                href="/accountant"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="block mt-2 px-3 py-2 text-sm bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 font-medium text-center transition-all shadow-md"
                              >
                                💰 Accountant Dashboard
                              </Link>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              handleLogout();
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                            aria-label="Logout"
                          >
                            <FiLogOut />
                            {t('nav.logout')}
                          </button>
                        </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base flex items-center gap-1 sm:gap-2"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                  >
                    <span>{t('nav.login')}</span>
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section - Render immediately, don't wait for homepageLayout */}
      <Hero 
        shops={sortedShops} 
        onShopClick={handleShopClick}
        onShowAll={fetchAllShops}
        onRefresh={() => fetchShops(location?.lat, location?.lng, selectedCategory, selectedCity)}
      />

      {/* About Section - Moved to /about page */}
      {/* {homepageLayout?.sections?.aboutSection?.enabled !== false && (
        <AboutSection />
      )} */}

      {/* SEO Text Section - Moved to /about page */}
      {/* {homepageLayout?.sections?.seoTextSection?.enabled !== false && (
        <SEOTextSection />
      )} */}

      {/* Display Ad - Below SEO Section (AdSense-Safe Zone) */}
      {homepageLayout?.sections?.displayAd1?.enabled !== false && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          <DisplayAd />
        </div>
      )}

      {/* Main Content with Sidebars */}
      <main id="main-content" className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8" role="main">
        {/* Main Page Heading - h1 for SEO */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-yellow-400 mb-4 px-4 sm:px-6">
          {selectedCity ? `Best Shops in ${selectedCity}` : 'Best Shops Near You'}
        </h1>
        
        {/* Brief description - Detailed content moved to /about page */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-base md:text-lg text-gray-700 dark:text-yellow-400 mb-6 px-4 sm:px-6 max-w-4xl leading-relaxed"
        >
          Discover trusted nearby shops and services in your area. Find verified businesses with accurate contact information, real customer reviews, and detailed profiles. <Link href="/about" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Learn more about 8rupiya.com</Link>.
        </motion.p>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
          {/* Left Rail - Render immediately, don't wait for homepageLayout */}
          <aside className="w-full lg:w-64 flex-shrink-0 order-2 lg:order-1" aria-label="Filters and categories">
            <LeftRail
              onCategoryChange={handleCategoryChange}
              onCityChange={handleCityChange}
              selectedCategory={selectedCategory}
            />
          </aside>

          {/* Main Content - Modern Mixed Layout */}
          <div className="flex-1 order-1 lg:order-2 min-w-0">
            {/* Modern Mixed Content Sections - Reordered */}
            <div className="space-y-0">
              {/* Mobile Filter Panel - Only visible on mobile, above Best Shops Near You */}
              {homepageLayout?.sections?.nearbyShops?.enabled !== false && bestShops.length > 0 && (
                <MobileFilterPanel
                  onCategoryChange={handleCategoryChange}
                  onCityChange={handleCityChange}
                  selectedCategory={selectedCategory}
                  selectedCity={selectedCity}
                />
              )}
              
              {/* Section 1: Nearby Shops (10 shops) */}
              {homepageLayout?.sections?.nearbyShops?.enabled !== false && bestShops.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="py-8 md:py-12"
                >
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center"
                      aria-label="Nearby Shops"
                    >
                      {homepageLayout?.sections?.nearbyShops?.title || (selectedCity ? `${t('shop.in')} ${selectedCity}` : 'Nearby Shops')}
                    </motion.h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {bestShops.flatMap((shop, index) => {
                        const items: React.ReactNode[] = [
                          <ShopCard key={`nearby-${shop._id || shop.place_id || index}`} shop={shop} index={index} onClick={() => handleShopClick(shop)} userLocation={location} />
                        ];
                        
                        // Add in-feed ad after every 2 shop cards
                        if (homepageLayout?.sections?.inFeedAds?.enabled !== false && (index + 1) % 2 === 0 && (index + 1) < bestShops.length) {
                          items.push(
                            <div key={`ad-nearby-${index}`} className="col-span-1 sm:col-span-2 lg:col-span-3 my-4">
                              <InFeedAd />
                            </div>
                          );
                        }
                        
                        return items;
                      })}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Ad Space - Between Nearby and Featured Shops */}
              {homepageLayout?.sections?.displayAd2?.enabled !== false && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <AdSlot slot="homepage" />
                </div>
              )}

              {/* Section 2: Featured Shops (10 shops) */}
              {homepageLayout?.sections?.featuredShops?.enabled !== false && featuredShops.length > 0 && (
                <>
                  <MixedContentSection
                    variant={(homepageLayout?.sections?.mixedContent1?.variant as any) || "text-left"}
                    shops={featuredShops.slice(0, 2)}
                    onShopClick={handleShopClick}
                    userLocation={location}
                    ShopCardComponent={ShopCard}
                    index={0}
                  />
                  
                  {/* Featured Shops Grid */}
                  <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="py-8 md:py-12"
                  >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center"
                        aria-label="Featured Shops"
                      >
                        {homepageLayout?.sections?.featuredShops?.title || t('shop.featured')}
                      </motion.h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredShops.flatMap((shop, index) => {
                          const items: React.ReactNode[] = [
                            <ShopCard key={`featured-${shop._id || shop.place_id || index}`} shop={shop} index={index} onClick={() => handleShopClick(shop)} userLocation={location} />
                          ];
                          
                          // Add in-feed ad after every 2 shop cards
                          if (homepageLayout?.sections?.inFeedAds?.enabled !== false && (index + 1) % 2 === 0 && (index + 1) < featuredShops.length) {
                            items.push(
                              <div key={`ad-featured-${index}`} className="col-span-1 sm:col-span-2 lg:col-span-3 my-4">
                                <InFeedAd />
                              </div>
                            );
                          }
                          
                          return items;
                        })}
                      </div>
                    </div>
                  </motion.section>
                </>
              )}

              {/* Ad Space - Between Featured and Premium Shops */}
              {homepageLayout?.sections?.displayAd2?.enabled !== false && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <AdSlot slot="homepage" />
                </div>
              )}

              {/* Section 3: Premium Shops (10 shops) */}
              {homepageLayout?.sections?.paidShops?.enabled !== false && premiumShops.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="py-8 md:py-12"
                  >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center"
                        aria-label="Premium Shops"
                      >
                        {homepageLayout?.sections?.paidShops?.title || t('shop.premium')}
                      </motion.h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {premiumShops.flatMap((shop, index) => {
                          const items: React.ReactNode[] = [
                          <ShopCard key={`premium-${shop._id || shop.place_id || index}`} shop={shop} index={index} onClick={() => handleShopClick(shop)} userLocation={location} />
                          ];
                          
                          // Add in-feed ad after every 2 shop cards
                        if (homepageLayout?.sections?.inFeedAds?.enabled !== false && (index + 1) % 2 === 0 && (index + 1) < premiumShops.length) {
                            items.push(
                            <div key={`ad-premium-${index}`} className="col-span-1 sm:col-span-2 lg:col-span-3 my-4">
                                <InFeedAd />
                              </div>
                            );
                          }
                          
                          return items;
                        })}
                      </div>
                    </div>
                  </motion.section>
              )}

              {/* Ad Space - After Premium Shops (AdSense-Safe Zone) */}
              {homepageLayout?.sections?.displayAd2?.enabled !== false && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <AdSlot slot="homepage" />
                  <AdvertisementBanner slot="homepage" className="my-8" uniqueId="homepage-main" />
                </div>
              )}
            </div>
          </div>

          {/* Right Rail */}
          {homepageLayout?.sections?.rightRail?.enabled !== false && (
            <aside className="w-full lg:w-64 flex-shrink-0 order-3" aria-label="Top rated and trending shops">
              <RightRail
                topRatedShops={topRatedShops}
                trendingShops={sortShopsByPriority(shops.filter((s) => s.isFeatured))}
              />
            </aside>
          )}
        </div>

        {/* Homepage Ad - Before All Shops (AdSense-Safe Zone) */}
        {homepageLayout?.sections?.displayAd2?.enabled !== false && (
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <AdSlot slot="homepage" />
          </div>
        )}

        {/* All Shops Section - Full Width (All shops with infinite scroll) - Render immediately */}
        <Nearby 
          shops={filteredShops} 
          title={homepageLayout?.sections?.nearbyShops?.title || (selectedCity ? `${t('shop.in')} ${selectedCity}` : 'All Shops')} 
          onShopClick={handleShopClick} 
          userLocation={location} 
        />

        {/* Infinite Scroll Loading Indicator */}
        {loadingMore && (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Loading more shops...</p>
            </div>
          </div>
        )}

        {/* No More Shops Indicator */}
        {!hasMore && shops.length > 0 && !loading && (
          <div className="flex justify-center items-center py-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-8 py-4 rounded-full border-2 border-blue-200 dark:border-blue-800">
              <p className="text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-2">
                <FiCheck className="text-green-600 dark:text-green-400" />
                All shops loaded
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Stats Section */}
      {homepageLayout?.sections?.stats?.enabled !== false && (
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            { icon: FiShoppingBag, number: '10K+', label: t('stats.activeShops') },
            { icon: FiTrendingUp, number: '50K+', label: t('stats.happyCustomers') },
            { icon: FiAward, number: '100+', label: t('stats.citiesCovered') },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
            >
              <stat.icon className="text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{stat.number}</div>
              <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>
      )}

      {/* Display Ad - Before Footer (Placement 3) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <DisplayAd />
      </div>

      {/* Footer */}
      {homepageLayout?.sections?.footer?.enabled !== false && (
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white py-12 mt-20"
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Footer Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <Link 
              href="/privacy-policy" 
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium hover:underline"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-400 dark:text-gray-600">|</span>
            <Link 
              href="/terms" 
              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors font-medium hover:underline"
            >
              Terms & Conditions
            </Link>
            <span className="text-gray-400 dark:text-gray-600">|</span>
            <Link 
              href="/about" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium hover:underline"
            >
              About Us
            </Link>
            <span className="text-gray-400 dark:text-gray-600">|</span>
            <Link 
              href="/contact" 
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors font-medium hover:underline"
            >
              Contact Us
            </Link>
          </div>
          
          {/* Copyright */}
          <div className="text-center border-t border-gray-300 dark:border-gray-700 pt-8">
            <p className="text-lg">{t('footer.copyright')}</p>
          </div>
        </div>
      </motion.footer>
      )}

      {/* Shop Popup */}
      <ShopPopup shop={selectedShop} isOpen={isPopupOpen} onClose={handleClosePopup} userLocation={location} />
      
      {/* AI Assistant */}
      <AIAssistant userLocation={location} userId={user?.id} />
      </div>
    </>
  );
}
