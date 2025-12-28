'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ConnectionStatus from './ConnectionStatus';
import Hero from './Hero';
import LeftRail from './LeftRail';
import RightRail from './RightRail';
import Nearby from './Nearby';
import TopRated from './TopRated';
import ShopCard from './ShopCard';
import ShopPopup from './ShopPopup';
import AdSlot from './AdSlot';
import AdvertisementBanner from './AdvertisementBanner';
import { FiShoppingBag, FiTrendingUp, FiAward, FiSearch, FiMapPin, FiUser, FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeToggle from './ThemeToggle';

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
    hero: { enabled: boolean; order: number };
    connectionStatus: { enabled: boolean; order: number };
    leftRail: { enabled: boolean; order: number };
    rightRail: { enabled: boolean; order: number };
    featuredShops: { enabled: boolean; order: number; title?: string; limit?: number };
    paidShops: { enabled: boolean; order: number; title?: string; limit?: number };
    topRated: { enabled: boolean; order: number; title?: string; limit?: number };
    nearbyShops: { enabled: boolean; order: number; title?: string; limit?: number };
    stats: { enabled: boolean; order: number };
    footer: { enabled: boolean; order: number };
  };
}

export default function HomepageClient() {
  const router = useRouter();
  const { t, language } = useLanguage();
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

  // Fetch user info function
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
        setUser(data.user);
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

  // Fetch homepage layout
  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const response = await fetch('/api/homepage-layout');
        const data = await response.json();
        if (data.success && data.layout) {
          setHomepageLayout(data.layout);
        }
      } catch (error) {
        console.error('Failed to fetch homepage layout:', error);
      }
    };
    fetchLayout();
  }, []);

  // Update selectedCategory when language changes
  useEffect(() => {
    if (selectedCategory === 'All Categories' || selectedCategory === t('category.all')) {
      setSelectedCategory(t('category.all'));
    }
  }, [language, t]);

  // Fetch user info on mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Listen for storage changes (when user logs in from another tab/window)
  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          console.log('📍 User location obtained:', { lat: userLat, lng: userLng });
          setLocation({
            lat: userLat,
            lng: userLng,
          });
          // Immediately fetch shops with location once we have it
          // This ensures shops are loaded with distance calculated
          fetchShops(userLat, userLng, selectedCategory, selectedCity);
        },
        (error) => {
          console.warn('⚠️ Location access denied or failed:', error.message);
          // Location denied, continue without it
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // Increased timeout
          maximumAge: 0, // Don't use cached position
        }
      );
    } else {
      console.warn('⚠️ Geolocation not supported by browser');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch shops function
  const fetchShops = async (lat?: number, lng?: number, category?: string, city?: string) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      
      // Use provided params or current state
      const useCategory = category !== undefined ? category : selectedCategory;
      const useCity = city !== undefined ? city : selectedCity;
      
      // Always use nearby API system
      if (lat && lng) {
        params.append('lat', lat.toString());
        params.append('lng', lng.toString());
        params.append('google', 'true');
        console.log('📍 Using provided location:', { lat, lng });
      } else if (location && location.lat && location.lng) {
        // Use stored location if available
        params.append('lat', location.lat.toString());
        params.append('lng', location.lng.toString());
        params.append('google', 'false');
        console.log('📍 Using stored location:', location);
      } else {
        console.warn('⚠️ No location available for distance calculation');
      }
      // If no location, nearby API will return all shops without distance
      
      if (useCategory && useCategory !== 'All Categories') {
        params.append('category', useCategory);
      }
      
      if (useCity) {
        params.append('city', useCity);
      }
      
      params.append('limit', '100'); // Get more shops

      const response = await fetch(`/api/shops/nearby?${params}`);
      const data = await response.json();

      if (data.shops && data.shops.length > 0) {
        // Log shops with distance info for debugging
        const shopsWithDistance = data.shops.filter((s: Shop) => s.distance !== undefined);
        const shopsWithoutDistance = data.shops.filter((s: Shop) => s.distance === undefined);
        console.log(`✅ Loaded ${data.shops.length} shops from nearby system`);
        console.log(`📍 Shops with distance: ${shopsWithDistance.length}, without: ${shopsWithoutDistance.length}`);
        if (shopsWithDistance.length > 0) {
          console.log('Sample shop with distance:', {
            name: shopsWithDistance[0].name,
            distance: shopsWithDistance[0].distance,
          });
        }
        setShops(data.shops);
      } else {
        fetchAllShops();
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load shops');
      fetchAllShops();
    } finally {
      setLoading(false);
    }
  };

  // Fetch shops when category, city, or location changes
  useEffect(() => {
    // Use a small delay to debounce rapid changes
    const timeoutId = setTimeout(() => {
      if (location && location.lat && location.lng) {
        // Always pass location when available to ensure distance calculation
        fetchShops(location.lat, location.lng, selectedCategory, selectedCity);
      } else {
        // If no location, still fetch shops but without distance
        fetchShops(undefined, undefined, selectedCategory, selectedCity);
      }
    }, 100); // Small delay to debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedCity, location]);

  const fetchAllShops = async () => {
    try {
      // Always use nearby API system for "All Shops"
      const params = new URLSearchParams();
      
      // Add location if available (for distance calculation)
      if (location) {
        params.append('lat', location.lat.toString());
        params.append('lng', location.lng.toString());
      }
      
      params.append('limit', '100'); // Get more shops for "All Shops"
      params.append('google', 'false'); // Don't fetch from Google for "all shops"
      
      const response = await fetch(`/api/shops/nearby?${params}`);
      const data = await response.json();
      
      if (data.shops && data.shops.length > 0) {
        setShops(data.shops);
        console.log(`✅ Loaded ${data.shops.length} shops from nearby system`);
      } else {
        // Fallback: If nearby API returns empty, try regular shops API
        const fallbackResponse = await fetch('/api/shops?limit=100&status=approved');
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.shops && fallbackData.shops.length > 0) {
          // Calculate distance on client side if location is available
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
        }
      }
    } catch (err) {
      console.error('Fetch all shops error:', err);
    }
  };

  const handleSearch = (query: string) => {
    setSelectedCity(query);
    fetchShops();
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
    return true;
  });

  // Get top rated and featured shops (with priority sorting)
  const topRatedShops = sortShopsByPriority(shops)
    .slice(0, 5);

  const featuredShops = sortShopsByPriority(shops.filter((shop) => shop.isFeatured))
    .slice(0, 6);
    
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
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-10"
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-40 right-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-10"
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

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
              {/* Theme Toggle */}
              <ThemeToggle />
              
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
                            {user.role === 'admin' && (
                              <Link
                                href="/admin"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="block mt-2 text-sm text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                              >
                                {t('nav.adminDashboard')}
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
                  <Link href="/login" className="text-white hover:text-blue-400 font-medium transition-colors text-sm sm:text-base px-2 sm:px-0">
                    {t('nav.login')}
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

      {/* Hero Section */}
      {homepageLayout?.sections.hero.enabled !== false && (
        <Hero 
          shops={sortedShops} 
          onShopClick={handleShopClick}
          onShowAll={fetchAllShops}
          onRefresh={() => fetchShops(location?.lat, location?.lng, selectedCategory, selectedCity)}
        />
      )}

      {/* Main Content with Sidebars */}
      <main id="main-content" className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8" role="main">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
          {/* Left Rail */}
          {homepageLayout?.sections.leftRail.enabled !== false && (
            <aside className="w-full lg:w-64 flex-shrink-0 order-2 lg:order-1" aria-label="Filters and categories">
              <LeftRail
                onCategoryChange={handleCategoryChange}
                onCityChange={handleCityChange}
                selectedCategory={selectedCategory}
              />
            </aside>
          )}

          {/* Main Content */}
          <div className="flex-1 space-y-4 sm:space-y-6 md:space-y-8 order-1 lg:order-2 min-w-0">
            {/* Featured Shops */}
            {homepageLayout?.sections.featuredShops.enabled !== false && featuredShops.length > 0 && (
              <section>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6"
                >
                  {homepageLayout?.sections.featuredShops.title || t('shop.featured')}
                </motion.h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                  {featuredShops.map((shop, index) => (
                    <ShopCard key={shop._id || index} shop={shop} index={index} onClick={() => handleShopClick(shop)} userLocation={location} />
                  ))}
                </div>
              </section>
            )}

            {/* Ad Space - Between Featured and Paid Shops */}
            <AdSlot slot="homepage" className="my-8" />

            {/* Paid Shops */}
            {homepageLayout?.sections.paidShops.enabled !== false && paidShops.length > 0 && (
              <section>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6"
                >
                  {homepageLayout?.sections.paidShops.title || t('shop.premium')}
                </motion.h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                  {paidShops.map((shop, index) => (
                    <ShopCard key={shop._id || index} shop={shop} index={index} onClick={() => handleShopClick(shop)} userLocation={location} />
                  ))}
                </div>
              </section>
            )}

            {/* Ad Space - After Paid Shops */}
            <AdSlot slot="homepage" className="my-8" />
            <AdvertisementBanner slot="homepage" className="my-8" uniqueId="homepage-main" />

          </div>

          {/* Right Rail */}
          {homepageLayout?.sections.rightRail.enabled !== false && (
            <aside className="w-full lg:w-64 flex-shrink-0 order-3" aria-label="Top rated and trending shops">
              <RightRail
                topRatedShops={topRatedShops}
                trendingShops={sortShopsByPriority(shops.filter((s) => s.isFeatured))}
              />
            </aside>
          )}
        </div>
      </main>

      {/* Top Rated Shops Section - Full Width from 10px left */}
      {homepageLayout?.sections.topRated.enabled !== false && (
        <TopRated shops={sortedShops} onShopClick={handleShopClick} userLocation={location} />
      )}

      {/* Homepage Ad - Between sections */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <AdSlot slot="homepage" />
      </div>

      {/* All Shops Section - Full Width from 10px left */}
      {homepageLayout?.sections.nearbyShops.enabled !== false && (
        <Nearby 
          shops={filteredShops} 
          title={homepageLayout?.sections.nearbyShops.title || (selectedCity ? `${t('shop.in')} ${selectedCity}` : t('shop.allShops'))} 
          onShopClick={handleShopClick} 
          userLocation={location} 
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Stats Section */}
      {homepageLayout?.sections.stats.enabled !== false && (
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

      {/* Footer */}
      {homepageLayout?.sections.footer.enabled !== false && (
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white py-12 mt-20"
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg">{t('footer.copyright')}</p>
        </div>
      </motion.footer>
      )}

      {/* Shop Popup */}
      <ShopPopup shop={selectedShop} isOpen={isPopupOpen} onClose={handleClosePopup} userLocation={location} />
      </div>
    </>
  );
}
