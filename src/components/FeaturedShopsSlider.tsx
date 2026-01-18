'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiStar, FiMapPin, FiShoppingBag } from 'react-icons/fi';
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
}

interface FeaturedShopsSliderProps {
  shops?: Shop[];
  onShopClick?: (shop: Shop) => void;
}

export default function FeaturedShopsSlider({ shops = [], onShopClick }: FeaturedShopsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayShops, setDisplayShops] = useState<Shop[]>([]);

  useEffect(() => {
    // Filter featured shops
    const featured = shops.filter(shop => shop.isFeatured || shop.planType === 'FEATURED');
    setDisplayShops(featured.slice(0, 10)); // Limit to 10 shops
  }, [shops]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, displayShops.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, displayShops.length - 2)) % Math.max(1, displayShops.length - 2));
  };

  if (displayShops.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiShoppingBag className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              Featured Shops
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Discover the best businesses in your area
            </p>
          </div>
          {displayShops.length > 3 && (
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
                aria-label="Previous shops"
              >
                <FiChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
                aria-label="Next shops"
              >
                <FiChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          )}
        </div>

        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-4"
            animate={{
              x: `-${currentIndex * (100 / Math.min(3, displayShops.length))}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{
              width: `${(displayShops.length / Math.min(3, displayShops.length)) * 100}%`,
            }}
          >
            {displayShops.map((shop, index) => (
              <div
                key={shop._id || index}
                className="flex-shrink-0"
                style={{ width: `${100 / displayShops.length}%` }}
              >
                <div
                  onClick={() => onShopClick?.(shop)}
                  className="cursor-pointer"
                >
                  <ShopCard shop={shop} />
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dots Indicator */}
        {displayShops.length > 3 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.max(1, displayShops.length - 2) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-blue-600 dark:bg-blue-400'
                    : 'w-2 bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
