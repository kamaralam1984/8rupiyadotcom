'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiStar, FiShoppingBag, FiClock } from 'react-icons/fi';

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
}

// Haversine formula to calculate distance between two points
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Convert degrees to radians
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Calculate estimated time from distance (assuming average speed of 40 km/h)
function calculateTimeFromDistance(distance: number): string {
  const avgSpeed = 40; // km/h
  const timeInHours = distance / avgSpeed;
  const timeInMinutes = Math.round(timeInHours * 60);
  
  if (timeInMinutes < 60) {
    return `${timeInMinutes} min`;
  } else {
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

export default function ShopCard({ shop, index = 0, onClick, userLocation }: ShopCardProps) {
  const [distanceTime, setDistanceTime] = useState<DistanceTime>({});

  // Calculate distance and time locally without API
  useEffect(() => {
    let calculatedDistance: number | undefined = shop.distance;

    // If API didn't provide distance, try to calculate locally if we have user location and shop coordinates
    if ((calculatedDistance === undefined || calculatedDistance === null) && 
        userLocation && 
        shop.location?.coordinates && 
        Array.isArray(shop.location.coordinates) &&
        shop.location.coordinates.length === 2) {
      const shopLng = shop.location.coordinates[0];
      const shopLat = shop.location.coordinates[1];
      
      // Validate shop coordinates
      if (!isNaN(shopLng) && !isNaN(shopLat) &&
          shopLng >= -180 && shopLng <= 180 &&
          shopLat >= -90 && shopLat <= 90 &&
          shopLng !== 0 && shopLat !== 0) { // Exclude 0,0 as likely invalid
        calculatedDistance = calculateHaversineDistance(
          userLocation.lat,
          userLocation.lng,
          shopLat, // latitude
          shopLng  // longitude
        );
      }
    }

    // Set distance and time if we have a valid distance (including 0)
    if (calculatedDistance !== undefined && calculatedDistance !== null && calculatedDistance >= 0) {
      const distanceText = `${calculatedDistance.toFixed(1)} km`;
      const timeText = calculateTimeFromDistance(calculatedDistance);
      
      setDistanceTime({
        distance: distanceText,
        time: timeText,
      });
    } else {
      // Reset if no distance available
      setDistanceTime({});
    }
  }, [userLocation, shop.location, shop.distance]);
  return (
    <motion.div
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
          <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-gray-100">
            {(shop.images && shop.images.length > 0) || (shop.photos && shop.photos.length > 0) ? (
              <img
                src={(shop.images && shop.images.length > 0) ? shop.images[0] : (shop.photos && shop.photos.length > 0) ? shop.photos[0] : ''}
                alt={`${shop.name} - ${shop.category} in ${shop.city}`}
                className="w-full h-full object-cover"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                  imageRendering: 'auto',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                  WebkitTransform: 'translateZ(0)',
                } as React.CSSProperties}
                loading={index !== undefined && index < 6 ? "eager" : "lazy"}
                decoding="async"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
                <FiShoppingBag className="text-6xl text-white opacity-50" />
              </div>
            )}
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
            
            {/* Distance and Time - Always show both together when distance is available */}
            {((distanceTime.distance && distanceTime.time) || 
              (shop.distance !== undefined && shop.distance !== null && shop.distance >= 0)) && (
              <div className="flex items-center gap-2 sm:gap-4 mb-3 text-xs sm:text-sm flex-wrap">
                <span className="text-red-700 dark:text-red-600 font-semibold flex items-center gap-1">
                  <FiMapPin className="text-xs flex-shrink-0" />
                  <span>{distanceTime.distance || (shop.distance !== undefined && shop.distance !== null ? `${Number(shop.distance).toFixed(1)} km` : '')}</span>
                </span>
                <span className="text-blue-700 dark:text-blue-600 font-semibold flex items-center gap-1">
                  <FiClock className="text-xs" />
                  {distanceTime.time || (shop.distance !== undefined && shop.distance !== null && shop.distance >= 0 ? calculateTimeFromDistance(Number(shop.distance)) : '')}
                </span>
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

