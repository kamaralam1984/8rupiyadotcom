'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './SearchBar';
import { FiShoppingBag, FiTrendingUp, FiAward, FiPhone, FiMessageCircle, FiExternalLink, FiStar, FiMapPin } from 'react-icons/fi';

interface Shop {
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
  isFeatured: boolean;
  isPaid?: boolean;
  planId?: {
    name: string;
  };
  phone?: string;
  website?: string;
}

interface HeroProps {
  shops?: Shop[];
  onShopClick?: (shop: Shop) => void;
  onShowAll?: () => void;
  onRefresh?: () => void;
}

type StyleType = 'card' | '3d' | 'glass' | 'highlighted' | 'spotlight';

interface HeroSettings {
  centerEffect: StyleType;
  leftEffect: StyleType;
  rightEffect: StyleType;
  rotationSpeed: number;
  animationSpeed: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  showLeftShop: boolean;
  showRightShop: boolean;
  showSearchBar: boolean;
}

export default function Hero({ shops = [], onShopClick, onShowAll, onRefresh }: HeroProps) {
  const [currentShopIndex, setCurrentShopIndex] = useState(0);
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Load hero settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/hero-settings');
        const data = await response.json();
        if (data.success && data.settings) {
          setHeroSettings(data.settings);
        }
      } catch (error) {
        console.error('Failed to fetch hero settings:', error);
        // Use defaults
        setHeroSettings({
          centerEffect: 'card',
          leftEffect: '3d',
          rightEffect: 'glass',
          rotationSpeed: 5000,
          animationSpeed: 0.5,
          primaryColor: '#3B82F6',
          secondaryColor: '#8B5CF6',
          accentColor: '#EC4899',
          showLeftShop: true,
          showRightShop: true,
          showSearchBar: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const currentStyle = heroSettings?.centerEffect || 'card';

  // Filter and sort: Paid shops first, then featured
  const heroShops = [...shops]
    .filter((shop) => shop.isPaid || shop.isFeatured)
    .sort((a, b) => {
      if (a.isPaid && !b.isPaid) return -1;
      if (!a.isPaid && b.isPaid) return 1;
      if (a.isFeatured && !b.isFeatured) return -1;
      return (b.rating || 0) - (a.rating || 0);
    })
    .slice(0, 10); // Top 10 shops for rotation

  // Rotate shop based on settings
  useEffect(() => {
    if (heroShops.length === 0 || !heroSettings) return;

    const interval = setInterval(() => {
      setCurrentShopIndex((prev) => (prev + 1) % heroShops.length);
    }, heroSettings.rotationSpeed);

    return () => clearInterval(interval);
  }, [heroShops.length, heroSettings?.rotationSpeed]);

  const currentShop = heroShops[currentShopIndex] || heroShops[0];

  // Style-specific render functions
  const renderCardStyle = (shop: Shop) => {
    const imageUrl = (shop.images && shop.images.length > 0) ? shop.images[0] : (shop.photos && shop.photos.length > 0) ? shop.photos[0] : null;
    
    return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200 h-full">
      <div className="relative h-full" style={{ height: '400px' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${shop.name} - ${shop.category} in ${shop.city}`}
            className="w-full h-full"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              width: '100%',
              height: '100%',
              imageRendering: 'auto',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
              filter: 'none',
              WebkitFilter: 'none',
            } as any}
            loading="eager"
            decoding="async"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
            <FiShoppingBag className="text-8xl text-white opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 drop-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{shop.name}</h3>
          <p className="text-sm sm:text-base md:text-lg mb-2 sm:mb-4 drop-shadow-md" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{shop.category} • {shop.city}</p>
          <div className="flex items-center gap-2 drop-shadow-sm">
            <FiStar className="text-yellow-300 fill-yellow-300" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />
            <span className="font-semibold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{shop.rating.toFixed(1)}</span>
            <span className="text-xs sm:text-sm opacity-90" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>({shop.reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const render3DStyle = (shop: Shop) => {
    const imageUrl = (shop.images && shop.images.length > 0) ? shop.images[0] : (shop.photos && shop.photos.length > 0) ? shop.photos[0] : null;
    
    return (
    <motion.div
      className="relative"
      style={{ perspective: '1000px' }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl overflow-hidden h-full"
        style={{ transformStyle: 'preserve-3d', height: '400px' }}
        animate={{ rotateY: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative h-full" style={{ height: '400px' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${shop.name} - ${shop.category} in ${shop.city}`}
              className="w-full h-full"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
                width: '100%',
                height: '100%',
                imageRendering: 'auto',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
                filter: 'none',
                WebkitFilter: 'none',
              } as any}
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
              <FiShoppingBag className="text-8xl text-white opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">{shop.name}</h3>
            <p className="text-sm sm:text-base md:text-lg mb-2 sm:mb-4">{shop.category} • {shop.city}</p>
            <div className="flex items-center gap-2">
              <FiStar className="text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">{shop.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
    );
  };

  const renderGlassStyle = (shop: Shop) => {
    const imageUrl = (shop.images && shop.images.length > 0) ? shop.images[0] : (shop.photos && shop.photos.length > 0) ? shop.photos[0] : null;
    
    return (
    <div className="relative bg-white/20 rounded-2xl shadow-2xl border border-white/30 overflow-hidden h-full">
      <div className="relative h-full" style={{ height: '400px' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${shop.name} - ${shop.category} in ${shop.city}`}
            className="w-full h-full"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              width: '100%',
              height: '100%',
              imageRendering: 'auto',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
              filter: 'none',
              WebkitFilter: 'none',
            } as any}
            loading="eager"
            decoding="async"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400/50 via-purple-400/50 to-pink-400/50 flex items-center justify-center">
            <FiShoppingBag className="text-8xl text-white opacity-70" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white bg-black/30">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 drop-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>{shop.name}</h3>
          <p className="text-sm sm:text-base md:text-lg mb-2 sm:mb-4 drop-shadow-md" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{shop.category} • {shop.city}</p>
          <div className="flex items-center gap-2 drop-shadow-sm">
            <FiStar className="text-yellow-300 fill-yellow-300" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }} />
            <span className="font-semibold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>{shop.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderHighlightedStyle = (shop: Shop) => {
    const imageUrl = (shop.images && shop.images.length > 0) ? shop.images[0] : (shop.photos && shop.photos.length > 0) ? shop.photos[0] : null;
    
    return (
    <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl p-1 overflow-hidden h-full">
      <div className="bg-white rounded-xl h-full relative overflow-hidden" style={{ height: '400px' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${shop.name} - ${shop.category} in ${shop.city}`}
            className="w-full h-full"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              width: '100%',
              height: '100%',
              imageRendering: 'auto',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
              filter: 'none',
              WebkitFilter: 'none',
            } as any}
            loading="eager"
            decoding="async"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
            <FiShoppingBag className="text-8xl text-white opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 drop-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{shop.name}</h3>
          <p className="text-sm sm:text-base md:text-lg mb-2 sm:mb-4 drop-shadow-md" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{shop.category} • {shop.city}</p>
          <div className="flex items-center gap-2 drop-shadow-sm">
            <FiStar className="text-yellow-300 fill-yellow-300" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />
            <span className="font-semibold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{shop.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderSpotlightStyle = (shop: Shop) => {
    const imageUrl = (shop.images && shop.images.length > 0) ? shop.images[0] : (shop.photos && shop.photos.length > 0) ? shop.photos[0] : null;
    
    return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl h-full">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-30" />
      <div className="relative h-full" style={{ height: '400px' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${shop.name} - ${shop.category} in ${shop.city}`}
            className="w-full h-full"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              width: '100%',
              height: '100%',
              imageRendering: 'auto',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
              filter: 'none',
              WebkitFilter: 'none',
            } as any}
            loading="eager"
            decoding="async"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
            <FiShoppingBag className="text-8xl text-white opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
          <h3 className="text-3xl font-bold mb-2">{shop.name}</h3>
          <p className="text-lg mb-4">{shop.category} • {shop.city}</p>
          <div className="flex items-center gap-2">
            <FiStar className="text-yellow-400 fill-yellow-400" />
            <span className="font-semibold">{shop.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderHeroShop = (shop: Shop) => {
    switch (currentStyle) {
      case '3d':
        return render3DStyle(shop);
      case 'glass':
        return renderGlassStyle(shop);
      case 'highlighted':
        return renderHighlightedStyle(shop);
      case 'spotlight':
        return renderSpotlightStyle(shop);
      default:
        return renderCardStyle(shop);
    }
  };


  return (
    <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 overflow-hidden" aria-label="Featured shops hero section">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: heroSettings?.animationSpeed || 0.8 }}
          className="text-center relative z-10"
        >

          {/* Hero Area with Left and Right Shops */}
          {currentShop && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: heroSettings?.animationSpeed || 0.6 }}
              className="max-w-7xl mx-auto mb-12"
            >
              {/* Center Hero Shop - Fixed Size */}
              <div className="mx-auto w-full" style={{ maxWidth: '800px' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentShopIndex}-${currentStyle}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: heroSettings?.animationSpeed || 0.5, ease: 'easeInOut' }}
                    style={{ height: '400px' }}
                  >
                    <div 
                      onClick={() => onShopClick?.(currentShop)}
                      className="cursor-pointer h-full"
                    >
                      {renderHeroShop(currentShop)}
                    </div>
                  </motion.div>
                </AnimatePresence>
                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Shop {currentShopIndex + 1} of {heroShops.length} • Changes every {heroSettings ? (heroSettings.rotationSpeed / 1000) : 5} seconds
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

