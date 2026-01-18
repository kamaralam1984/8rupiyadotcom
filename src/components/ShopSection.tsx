'use client';

import { useState, useEffect } from 'react';
import { FiStar, FiTrendingUp, FiClock, FiFilter } from 'react-icons/fi';
import ShopCard from './ShopCard';

interface Shop {
  _id?: string;
  name: string;
  shopName?: string;
  category: string;
  address: string;
  city: string;
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
}

interface ShopSectionProps {
  title: string;
  shops: Shop[];
  sortBy?: 'rating' | 'reviews' | 'distance' | 'visitors' | 'newest';
  onShopClick?: (shop: Shop) => void;
  showFilters?: boolean;
}

export default function ShopSection({ 
  title, 
  shops, 
  sortBy: defaultSortBy = 'rating',
  onShopClick,
  showFilters = true 
}: ShopSectionProps) {
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'distance' | 'visitors' | 'newest'>(defaultSortBy);
  const [sortedShops, setSortedShops] = useState<Shop[]>([]);

  const sortShops = (shops: Shop[], sortType: typeof sortBy) => {
    const sorted = [...shops];
    
    switch (sortType) {
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'reviews':
        return sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      case 'distance':
        return sorted.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      case 'visitors':
        return sorted.sort((a, b) => (b.visitorCount || 0) - (a.visitorCount || 0));
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      default:
        return sorted;
    }
  };

  useEffect(() => {
    setSortedShops(sortShops(shops, sortBy));
  }, [shops, sortBy]);

  if (shops.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {title === 'Most Rated Shops' && <FiStar className="h-7 w-7 text-yellow-500" />}
              {title === 'Most Reviewed Shops' && <FiTrendingUp className="h-7 w-7 text-blue-500" />}
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {shops.length} {shops.length === 1 ? 'shop' : 'shops'} found
            </p>
          </div>

          {showFilters && (
            <div className="flex items-center gap-2">
              <FiFilter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rating">Sort by Rating</option>
                <option value="reviews">Sort by Reviews</option>
                <option value="distance">Sort by Distance</option>
                <option value="visitors">Sort by Visitors</option>
                <option value="newest">Sort by Newest</option>
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedShops.map((shop, index) => (
            <div
              key={shop._id || index}
              onClick={() => onShopClick?.(shop)}
              className="cursor-pointer"
            >
              <ShopCard shop={shop} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
