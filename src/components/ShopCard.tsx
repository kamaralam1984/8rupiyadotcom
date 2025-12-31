'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiMapPin, FiStar, FiShoppingBag, FiClock, FiNavigation } from 'react-icons/fi';
import { calculateDistanceAndTime } from '@/utils/distanceCalculation';

interface ShopCardProps {
  shop: {
    _id?: string;
    place_id?: string;
    name: string;
    category: string;
    address: string;
    city: string;
    images?: string[];
    photos?: string[]; // Plan-based photos
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
    description?: string;
    state?: string;
    pincode?: string;
    source?: 'mongodb' | 'google';
  };
  index?: number;
  onClick?: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

interface DistanceTime {
  distance?: string;
  time?: string;
  distanceValue?: number;
}

export default function ShopCard({ shop, index = 0, onClick, userLocation }: ShopCardProps) {
  const [distanceTime, setDistanceTime] = useState<DistanceTime>({});
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy rendering
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // Stop observing once visible
          }
        });
      },
      {
        rootMargin: '100px', // Load 100px before card enters viewport
        threshold: 0.01,
      }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, []);

  // Calculate distance and time using enhanced utility
  useEffect(() => {
    if (userLocation && shop.location?.coordinates) {
      const result = calculateDistanceAndTime(userLocation, shop.location);
      if (result) {
        setDistanceTime({
          distance: result.distance,
          time: result.time,
          distanceValue: result.distanceValue
        });
      } else {
        setDistanceTime({});
      }
    } else if (shop.distance !== undefined && shop.distance !== null && shop.distance >= 0) {
      // Fallback to shop's pre-calculated distance
      const distanceKm = Number(shop.distance);
      const distanceText = distanceKm < 1 
        ? `${Math.round(distanceKm * 1000)} m` 
        : distanceKm < 10 
        ? `${distanceKm.toFixed(1)} km` 
        : `${Math.round(distanceKm)} km`;
      
      let timeInMinutes: number;
      if (distanceKm < 5) {
        timeInMinutes = Math.round((distanceKm / 20) * 60);
      } else if (distanceKm < 20) {
        timeInMinutes = Math.round((distanceKm / 35) * 60);
      } else {
        timeInMinutes = Math.round((distanceKm / 50) * 60);
      }
      
      const timeText = timeInMinutes < 1 
        ? '< 1 min'
        : timeInMinutes < 60 
        ? `${timeInMinutes} min` 
        : `${Math.floor(timeInMinutes / 60)}h ${timeInMinutes % 60}m`;
      
      setDistanceTime({
        distance: distanceText,
        time: timeText,
        distanceValue: distanceKm
      });
    } else {
      setDistanceTime({});
    }
  }, [userLocation, shop.location, shop.distance]);
  // Render placeholder skeleton if not visible yet
  if (!isVisible) {
    return (
      <div ref={cardRef} className="bg-gray-200 dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg h-full animate-pulse">
        <div className="h-40 sm:h-48 bg-gray-300 dark:bg-gray-700 rounded-t-xl"></div>
        <div className="p-4 sm:p-5 space-y-3">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="group cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`View details for ${shop.name}`}
    >
      <article className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
          {/* Image */}
          <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
            {(shop.images && shop.images.length > 0) || (shop.photos && shop.photos.length > 0) ? (
              <img
                src={(shop.images && shop.images.length > 0) ? shop.images[0] : (shop.photos && shop.photos.length > 0) ? shop.photos[0] : ''}
                alt={`${shop.name} - ${shop.category} in ${shop.city}`}
                className="w-full h-full object-cover transition-opacity duration-300"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                } as React.CSSProperties}
                loading="lazy"
                decoding="async"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
                <FiShoppingBag className="text-6xl text-white opacity-50" />
              </div>
            )}
            {/* Distance Quick View on Image */}
            {distanceTime.distance && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5"
              >
                <FiNavigation className="text-red-400 text-sm" />
                <span>{distanceTime.distance}</span>
                <span className="text-blue-300">• {distanceTime.time}</span>
              </motion.div>
            )}

            {/* Featured Badge */}
            {shop.isFeatured && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
              >
                <FiStar className="text-sm" />
                Featured
              </motion.div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {shop.name}
            </h3>
            <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-600 font-semibold mb-2 flex items-center gap-1">
              <FiShoppingBag className="text-xs sm:text-sm flex-shrink-0" />
              <span className="truncate">{shop.category}</span>
            </p>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-start gap-1 line-clamp-2">
              <FiMapPin className="text-xs sm:text-sm flex-shrink-0 mt-0.5" />
              <span>{shop.address}, {shop.city}</span>
            </p>
            
            {/* Distance and Time - Enhanced Display */}
            {(distanceTime.distance && distanceTime.time) && (
              <div className="flex items-center gap-2 mb-3">
                {/* Distance Badge */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700/50 px-3 py-1.5 rounded-full"
                >
                  <FiNavigation className="text-red-600 dark:text-red-400 text-sm" />
                  <span className="text-red-700 dark:text-red-300 font-bold text-xs sm:text-sm">
                    {distanceTime.distance}
                  </span>
                </motion.div>

                {/* Time Badge */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700/50 px-3 py-1.5 rounded-full"
                >
                  <FiClock className="text-blue-600 dark:text-blue-400 text-sm" />
                  <span className="text-blue-700 dark:text-blue-300 font-bold text-xs sm:text-sm">
                    {distanceTime.time}
                  </span>
                </motion.div>
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="flex items-center gap-1">
                <FiStar className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {shop.rating?.toFixed(1) || '0.0'}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">({shop.reviewCount || 0})</span>
              </div>
              <div className="flex gap-2">
                {shop.isPaid && shop.planId && (
                  <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                    {shop.planId.name}
                  </span>
                )}
                {shop.source === 'google' && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    Google
                  </span>
                )}
              </div>
            </div>
          </div>
      </article>
    </motion.div>
  );
}

