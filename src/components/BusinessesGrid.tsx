'use client';

import { useState, useEffect } from 'react';
import { FiFilter, FiX, FiSearch, FiMapPin } from 'react-icons/fi';
import ShopCard from './ShopCard';

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
}

interface BusinessesGridProps {
  shops: Shop[];
  onShopClick?: (shop: Shop) => void;
  showFilters?: boolean;
}

export default function BusinessesGrid({ shops, onShopClick, showFilters = true }: BusinessesGridProps) {
  const [filteredShops, setFilteredShops] = useState<Shop[]>(shops);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'distance' | 'newest'>('rating');
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      })
      .catch(err => console.error('Failed to fetch categories:', err));

    // Extract unique cities from shops
    const uniqueCities = Array.from(new Set(shops.map(shop => shop.city).filter(Boolean)));
    setCities(uniqueCities.sort());
  }, [shops]);

  useEffect(() => {
    // ⚡ Fix duplicate keys: Remove duplicate shops first
    const seenIds = new Set<string>();
    const uniqueShops = shops.filter(shop => {
      const shopId = shop._id || shop.place_id || '';
      if (shopId && seenIds.has(shopId)) return false; // Skip duplicate
      if (shopId) seenIds.add(shopId);
      return true;
    });
    
    let filtered = [...uniqueShops];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(shop => 
        (shop.name || shop.shopName || '').toLowerCase().includes(query) ||
        shop.category.toLowerCase().includes(query) ||
        shop.address.toLowerCase().includes(query) ||
        shop.city.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(shop => shop.category === selectedCategory);
    }

    // City filter
    if (selectedCity !== 'all') {
      filtered = filtered.filter(shop => shop.city === selectedCity);
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'reviews':
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case 'distance':
        filtered.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
          const dateB = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    setFilteredShops(filtered);
  }, [shops, searchQuery, selectedCategory, selectedCity, sortBy]);

  return (
    <section className="py-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                All Listings
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {filteredShops.length} {filteredShops.length === 1 ? 'business' : 'businesses'} found
              </p>
            </div>

            {showFilters && (
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FiFilter className="h-5 w-5" />
                <span>Filters</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, category, location..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filters Panel */}
        {isFilterOpen && showFilters && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <FiX className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rating">Rating</option>
                  <option value="reviews">Reviews</option>
                  <option value="distance">Distance</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Shops Grid */}
        {filteredShops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredShops.map((shop, index) => {
              // ⚡ Fix duplicate keys: Create truly unique key
              const uniqueKey = shop._id 
                ? `businessgrid-${shop._id}-${index}` 
                : `businessgrid-${shop.place_id || shop.name || 'shop'}-${index}`;
              
              return (
              <div
                key={uniqueKey}
                onClick={() => onShopClick?.(shop)}
                className="cursor-pointer"
              >
                <ShopCard shop={shop} />
              </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiMapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No businesses found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
