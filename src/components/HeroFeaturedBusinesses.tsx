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
  const [animationStyle, setAnimationStyle] = useState<'fade' | 'slide' | 'zoom' | 'rotate'>('fade');

  useEffect(() => {
    // ⚡ Fix: Filter out invalid shops and get top featured/paid shops
    const seenIds = new Set<string>();
    const featured = shops
      .filter(shop => {
        // ⚡ Fix: Ensure shop is valid before processing
        if (!shop || typeof shop !== 'object') return false;
        
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
    // ⚡ Fix: Reset index when shops change
    if (featured.length > 0) {
      setCurrentIndex(0);
    }
  }, [shops]);

  useEffect(() => {
    if (featuredShops.length === 0) {
      setCurrentIndex(0);
      return;
    }
    
    // ⚡ Fix: Ensure currentIndex is within bounds
    setCurrentIndex((prev) => Math.min(prev, featuredShops.length - 1));
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredShops.length);
      // ⚡ Change animation style on each slide
      const styles: Array<'fade' | 'slide' | 'zoom' | 'rotate'> = ['fade', 'slide', 'zoom', 'rotate'];
      setAnimationStyle(styles[Math.floor(Math.random() * styles.length)]);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [featuredShops.length, featuredShops]);

  const nextShop = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredShops.length);
  };

  const prevShop = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredShops.length) % featuredShops.length);
  };

  if (featuredShops.length === 0) {
    return null;
  }

  // ⚡ Fix: Ensure currentIndex is within bounds and currentShop exists
  const safeIndex = Math.max(0, Math.min(currentIndex, featuredShops.length - 1));
  const currentShop = featuredShops[safeIndex];

  // ⚡ Fix: Double-check currentShop exists before rendering
  if (!currentShop) {
    return null;
  }

  // ⚡ Get animation variants based on style
  const getAnimationVariants = () => {
    switch (animationStyle) {
      case 'slide':
        return {
          initial: { opacity: 0, x: 300, scale: 0.9 },
          animate: { opacity: 1, x: 0, scale: 1 },
          exit: { opacity: 0, x: -300, scale: 0.9 },
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.5, rotate: -10 },
          animate: { opacity: 1, scale: 1, rotate: 0 },
          exit: { opacity: 0, scale: 1.5, rotate: 10 },
        };
      case 'rotate':
        return {
          initial: { opacity: 0, rotateY: 90, scale: 0.8 },
          animate: { opacity: 1, rotateY: 0, scale: 1 },
          exit: { opacity: 0, rotateY: -90, scale: 0.8 },
        };
      default: // fade
        return {
          initial: { opacity: 0, y: 50 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -50 },
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={`hero-${currentShop._id || currentShop.place_id || currentShop.name || currentIndex}-${currentIndex}-${animationStyle}`}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ 
              duration: 0.8, 
              ease: [0.25, 0.1, 0.25, 1],
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            onClick={() => onShopClick?.(currentShop)}
            className="cursor-pointer relative w-full"
          >
            {/* Full Width Image Container */}
            <div className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px]">
              {(currentShop.images && currentShop.images[0]) || (currentShop.photos && currentShop.photos[0]) || currentShop.photoUrl ? (
                <img
                  src={(currentShop.images && currentShop.images[0]) || (currentShop.photos && currentShop.photos[0]) || currentShop.photoUrl || ''}
                  alt={`${currentShop.name || currentShop.shopName || 'Shop'} - ${currentShop.category || 'Category'}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
                  <FiShoppingBag className="h-32 w-32 text-white opacity-50" />
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
              
              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 md:p-16 text-white z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-2xl">
                    {currentShop.name || currentShop.shopName}
                  </h3>
                  <p className="text-lg sm:text-xl md:text-2xl mb-4 flex items-center gap-3 drop-shadow-lg">
                    <FiMapPin className="h-6 w-6 sm:h-7 sm:w-7" />
                    <span>{currentShop.category} • {currentShop.city}</span>
                  </p>
                  <div className="flex items-center gap-3">
                    <FiStar className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400 fill-yellow-400" />
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold">{(currentShop.rating || 0).toFixed(1)}</span>
                    <span className="text-base sm:text-lg md:text-xl opacity-90">({currentShop.reviewCount || 0} reviews)</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {featuredShops.length > 1 && (
          <>
            <button
              onClick={prevShop}
              className="absolute left-4 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-white/20 backdrop-blur-md rounded-full shadow-2xl hover:bg-white/30 transition-all z-20 border border-white/30"
              aria-label="Previous shop"
            >
              <FiChevronLeft className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </button>
            <button
              onClick={nextShop}
              className="absolute right-4 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-white/20 backdrop-blur-md rounded-full shadow-2xl hover:bg-white/30 transition-all z-20 border border-white/30"
              aria-label="Next shop"
            >
              <FiChevronRight className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex justify-center gap-2 sm:gap-3 z-20">
              {featuredShops.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    const styles: Array<'fade' | 'slide' | 'zoom' | 'rotate'> = ['fade', 'slide', 'zoom', 'rotate'];
                    setAnimationStyle(styles[Math.floor(Math.random() * styles.length)]);
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 sm:w-10 h-2 sm:h-3 bg-white shadow-lg'
                      : 'w-2 sm:w-3 h-2 sm:h-3 bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to shop ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
