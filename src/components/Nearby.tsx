'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ShopCard from './ShopCard';
import AdSlot from './AdSlot';
import InFeedAd from './InFeedAd';
import { FiMapPin } from 'react-icons/fi';

interface NearbyProps {
  shops: any[];
  title?: string;
  onShopClick?: (shop: any) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export default function Nearby({ shops, title = 'Nearby Shops', onShopClick, userLocation }: NearbyProps) {
  if (shops.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full py-6 md:py-8" style={{ paddingLeft: '10px', paddingRight: '0' }}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex items-center justify-between mb-4 md:mb-6 px-4 sm:px-6"
      >
        <div className="flex items-center gap-3">
          <FiMapPin className="text-3xl text-blue-600 dark:text-blue-400" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-yellow-400 nearby-title">{title || 'All Shops'}</h2>
        </div>
        {shops.length > 0 && (
          <span className="text-gray-600 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium">
            {shops.length} shops found
          </span>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-4 px-4 sm:px-6">
        {shops.flatMap((shop, index) => {
          const items: React.ReactNode[] = [];
          
          // Add shop card
          items.push(
            <ShopCard 
              key={shop._id || shop.place_id || index} 
              shop={shop} 
              index={index} 
              onClick={() => onShopClick?.(shop)} 
              userLocation={userLocation} 
            />
          );
          
          // Add in-feed ad after every 2 shop cards
          if ((index + 1) % 2 === 0 && (index + 1) < shops.length) {
            items.push(
              <div key={`ad-${index}`} className="col-span-1 md:col-span-2 lg:col-span-3 my-4">
                <InFeedAd />
              </div>
            );
          }
          
          return items;
        })}
      </div>

      {/* Ad Space - Search/Category Ads */}
      <div className="px-4 sm:px-6 mt-8">
        <AdSlot slot="search" />
      </div>
    </section>
  );
}

