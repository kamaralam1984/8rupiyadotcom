'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiClock, FiShoppingBag } from 'react-icons/fi';
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
  offerText?: string;
  offerExpiry?: string;
}

interface FlashSpotlightProps {
  shops?: Shop[];
  onShopClick?: (shop: Shop) => void;
  title?: string;
}

export default function FlashSpotlight({ 
  shops = [], 
  onShopClick,
  title = 'Limited Offers' 
}: FlashSpotlightProps) {
  const [limitedOffers, setLimitedOffers] = useState<Shop[]>([]);

  useEffect(() => {
    // ⚡ Fix duplicate keys: Remove duplicate shops first
    const seenIds = new Set<string>();
    const uniqueShops = shops.filter(shop => {
      const shopId = shop._id || shop.place_id || '';
      if (shopId && seenIds.has(shopId)) return false; // Skip duplicate
      if (shopId) seenIds.add(shopId);
      return true;
    });
    
    // Filter shops with offers or limited time deals
    const offers = uniqueShops
      .filter(shop => shop.offerText || shop.planType === 'PREMIUM' || shop.isPaid)
      .slice(0, 6);
    setLimitedOffers(offers);
  }, [shops]);

  if (limitedOffers.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
            <FiZap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Limited time offers - Don't miss out!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {limitedOffers.map((shop, index) => {
            // ⚡ Fix duplicate keys: Create truly unique key
            const uniqueKey = shop._id 
              ? `flashspotlight-${shop._id}-${index}` 
              : `flashspotlight-${shop.place_id || shop.name || 'shop'}-${index}`;
            
            return (
            <motion.div
              key={uniqueKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onShopClick?.(shop)}
              className="cursor-pointer relative"
            >
              <div className="relative">
                <ShopCard shop={shop} />
                {shop.offerText && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <FiZap className="h-3 w-3" />
                    {shop.offerText}
                  </div>
                )}
                {shop.offerExpiry && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <FiClock className="h-3 w-3" />
                    Expires: {new Date(shop.offerExpiry).toLocaleDateString()}
                  </div>
                )}
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
