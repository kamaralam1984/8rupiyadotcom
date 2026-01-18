'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FiShoppingBag,
  FiStar,
  FiMapPin,
  FiTrendingUp,
  FiFilter,
  FiArrowLeft,
  FiGrid,
  FiList,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import NavbarAirbnb from '@/components/NavbarAirbnb';
import FooterMinimal from '@/components/FooterMinimal';
import ShopCard from '@/components/ShopCard';
import Script from 'next/script';

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
  location?: {
    type: string;
    coordinates: [number, number];
  };
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  shopCount?: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

function CategoryPageContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'distance' | 'newest'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        if (parsed.lat && parsed.lng) {
          setLocation(parsed);
          return;
        }
      } catch (e) {}
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setLocation(loc);
          localStorage.setItem('userLocation', JSON.stringify(loc));
        },
        () => {
          const defaultLoc = { lat: 25.5941, lng: 85.1376 };
          setLocation(defaultLoc);
          localStorage.setItem('userLocation', JSON.stringify(defaultLoc));
        },
        { timeout: 5000 }
      );
    } else {
      const defaultLoc = { lat: 25.5941, lng: 85.1376 };
      setLocation(defaultLoc);
      localStorage.setItem('userLocation', JSON.stringify(defaultLoc));
    }
  }, []);

  // Fetch category and shops
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        
        // Fetch category by slug
        const categoryResponse = await fetch(`/api/categories?all=true`);
        const categoryData = await categoryResponse.json();
        
        if (categoryData.success && categoryData.categories) {
          const foundCategory = categoryData.categories.find(
            (cat: Category) => cat.slug === slug
          );
          
          if (foundCategory) {
            setCategory(foundCategory);
            
            // Fetch shops for this category
            const params = new URLSearchParams();
            params.append('category', foundCategory.name);
            if (location) {
              params.append('lat', location.lat.toString());
              params.append('lng', location.lng.toString());
            }
            params.append('limit', '100');
            params.append('page', '1');
            
            const shopsResponse = await fetch(`/api/shops/nearby?${params}`);
            const shopsData = await shopsResponse.json();
            
            if (shopsData.shops && Array.isArray(shopsData.shops)) {
              const mappedShops = shopsData.shops.map((shop: any) => ({
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
            } else {
              setShops([]);
            }
          } else {
            // Category not found
            setCategory(null);
            setShops([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch category data:', error);
        setCategory(null);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug, location]);

  // Sort and filter shops
  const sortedAndFilteredShops = shops
    .filter((shop) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        (shop.name || shop.shopName || '').toLowerCase().includes(query) ||
        shop.address.toLowerCase().includes(query) ||
        shop.city.toLowerCase().includes(query) ||
        shop.area?.toLowerCase().includes(query) ||
        ''
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'reviews':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'distance':
          return (a.distance || Infinity) - (b.distance || Infinity);
        case 'newest':
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        default:
          return 0;
      }
    });

  const handleShopClick = (shop: Shop) => {
    setSelectedShop(shop);
    setIsPopupOpen(true);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavbarAirbnb user={user} onLogout={handleLogout} />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading category...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavbarAirbnb user={user} onLogout={handleLogout} />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Category Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The category you're looking for doesn't exist.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavbarAirbnb user={user} onLogout={handleLogout} />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
          </div>
          
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {category.icon ? (
                category.icon.startsWith('http') || category.icon.startsWith('/') ? (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Image
                      src={category.icon}
                      alt={category.name}
                      width={80}
                      height={80}
                      className="rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm text-4xl sm:text-5xl">
                    {category.icon}
                  </div>
                )
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <FiShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-white/90 text-lg mb-4 max-w-3xl">
                  {category.description}
                </p>
              )}
              <div className="flex items-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <FiShoppingBag className="h-5 w-5" />
                  <span className="font-semibold">{sortedAndFilteredShops.length}</span>
                  <span>Shops</span>
                </div>
                {location && (
                  <div className="flex items-center gap-2">
                    <FiMapPin className="h-5 w-5" />
                    <span>Near You</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shops..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Sort and View */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setSortBy('rating')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    sortBy === 'rating'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <FiStar className="h-4 w-4 inline mr-1" />
                  Rating
                </button>
                <button
                  onClick={() => setSortBy('reviews')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    sortBy === 'reviews'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <FiTrendingUp className="h-4 w-4 inline mr-1" />
                  Reviews
                </button>
                <button
                  onClick={() => setSortBy('distance')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    sortBy === 'distance'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <FiMapPin className="h-4 w-4 inline mr-1" />
                  Distance
                </button>
                <button
                  onClick={() => setSortBy('newest')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    sortBy === 'newest'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Newest
                </button>
              </div>

              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <FiGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <FiList className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shops Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sortedAndFilteredShops.length === 0 ? (
          <div className="text-center py-16">
            <FiShoppingBag className="h-24 w-24 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No shops found' : 'No shops in this category'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery
                ? `Try adjusting your search query.`
                : `There are no shops available in this category yet.`}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {sortedAndFilteredShops.map((shop, index) => (
              <motion.div
                key={shop._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ShopCard shop={shop} onClick={() => handleShopClick(shop)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <FooterMinimal />

      {/* SEO Structured Data */}
      {category && (
        <Script
          id="category-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: `${category.name} Shops`,
              description: category.description || `Find the best ${category.name} shops near you`,
              url: `https://8rupiya.com/category/${category.slug}`,
              mainEntity: {
                '@type': 'ItemList',
                numberOfItems: sortedAndFilteredShops.length,
                itemListElement: sortedAndFilteredShops.slice(0, 10).map((shop, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  item: {
                    '@type': 'LocalBusiness',
                    name: shop.name || shop.shopName,
                    address: {
                      '@type': 'PostalAddress',
                      streetAddress: shop.address,
                      addressLocality: shop.city,
                      addressRegion: shop.area || '',
                      postalCode: shop.pincode || '',
                      addressCountry: 'IN',
                    },
                    ...(shop.rating > 0 && {
                      aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: shop.rating,
                        reviewCount: shop.reviewCount,
                      },
                    }),
                    ...(shop.photoUrl && { image: shop.photoUrl }),
                  },
                })),
              },
            }),
          }}
        />
      )}

      {/* Shop Popup */}
      {isPopupOpen && selectedShop && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setIsPopupOpen(false);
            setSelectedShop(null);
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedShop.name || selectedShop.shopName}
                </h2>
                <button
                  onClick={() => {
                    setIsPopupOpen(false);
                    setSelectedShop(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              {selectedShop.photoUrl && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={selectedShop.photoUrl}
                    alt={selectedShop.name || selectedShop.shopName || ''}
                    width={800}
                    height={400}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FiMapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {selectedShop.address}, {selectedShop.city}
                  </span>
                </div>
                {selectedShop.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <FiStar className="h-5 w-5 text-yellow-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedShop.rating} ({selectedShop.reviewCount} reviews)
                    </span>
                  </div>
                )}
                {selectedShop.distance && (
                  <div className="flex items-center gap-2">
                    <FiMapPin className="h-5 w-5 text-blue-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedShop.distance.toFixed(1)} km away
                    </span>
                  </div>
                )}
                {selectedShop.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    {selectedShop.description}
                  </p>
                )}
                <Link
                  href={`/shops/${selectedShop._id}`}
                  className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <CategoryPageContent />
    </Suspense>
  );
}
