'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiMapPin, FiShoppingBag, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ShopCard from './ShopCard';

interface Shop {
  _id?: string;
  place_id?: string; // For Google Places shops
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

interface HeroFeaturedBusinessesProps {
  shops?: Shop[];
  onShopClick?: (shop: Shop) => void;
}

export default function HeroFeaturedBusinesses({ shops = [], onShopClick }: HeroFeaturedBusinessesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredShops, setFeaturedShops] = useState<Shop[]>([]);

  useEffect(() => {
    // Get top featured/paid shops and remove duplicates
    const seenIds = new Set<string>();
    const featured = shops
      .filter(shop => {
        const shopId = shop._id || shop.place_id || '';
        if (shopId && seenIds.has(shopId)) return false; // Skip duplicate
        if (shopId) seenIds.add(shopId);
        return shop.isFeatured || shop.isPaid || shop.planType === 'FEATURED';
      })
      .sort((a, b) => {
        // Sort by: paid first, then featured, then rating
        if (a.isPaid && !b.isPaid) return -1;
        if (!a.isPaid && b.isPaid) return 1;
        if (a.isFeatured && !b.isFeatured) return -1;
        return (b.rating || 0) - (a.rating || 0);
      })
      .slice(0, 6);
    
    setFeaturedShops(featured);
  }, [shops]);

  useEffect(() => {
    if (featuredShops.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredShops.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [featuredShops.length]);

  const nextShop = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredShops.length);
  };

  const prevShop = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredShops.length) % featuredShops.length);
  };

  if (featuredShops.length === 0) {
    return null;
  }

  const currentShop = featuredShops[currentIndex];

  return (
    <section className="relative py-12 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black dark:text-white mb-4">
            Discover Featured Businesses
          </h1>
          <p className="text-xl text-black dark:text-gray-300 max-w-2xl mx-auto">
            Find the best shops and services in your area
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`hero-${currentShop._id || currentShop.place_id || currentShop.name || currentIndex}-${currentIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              onClick={() => onShopClick?.(currentShop)}
              className="cursor-pointer"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="relative h-64 sm:h-80 md:h-96">
                  {currentShop.images?.[0] || currentShop.photos?.[0] || currentShop.photoUrl ? (
                    <img
                      src={currentShop.images?.[0] || currentShop.photos?.[0] || currentShop.photoUrl}
                      alt={`${currentShop.name || currentShop.shopName} - ${currentShop.category}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <FiShoppingBag className="h-24 w-24 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                      {currentShop.name || currentShop.shopName}
                    </h3>
                    <p className="text-lg mb-3 flex items-center gap-2">
                      <FiMapPin className="h-5 w-5" />
                      {currentShop.category} • {currentShop.city}
                    </p>
                    <div className="flex items-center gap-2">
                      <FiStar className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-lg font-semibold">{currentShop.rating.toFixed(1)}</span>
                      <span className="text-sm opacity-90">({currentShop.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {featuredShops.length > 1 && (
            <>
              <button
                onClick={prevShop}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:shadow-xl transition-shadow z-10"
                aria-label="Previous shop"
              >
                <FiChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={nextShop}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:shadow-xl transition-shadow z-10"
                aria-label="Next shop"
              >
                <FiChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </button>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {featuredShops.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-8 bg-white'
                        : 'w-2 bg-white/50'
                    }`}
                    aria-label={`Go to shop ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
