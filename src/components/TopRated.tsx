'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ShopCard from './ShopCard';
import AdSlot from './AdSlot';
import InFeedAd from './InFeedAd';
import { FiStar } from 'react-icons/fi';

interface TopRatedProps {
  shops: any[];
  onShopClick?: (shop: any) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export default function TopRated({ shops, onShopClick, userLocation }: TopRatedProps) {
  // Sort by rating
  const topRated = [...shops]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6);

  if (topRated.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full py-6 md:py-8" style={{ paddingLeft: '10px', paddingRight: '0' }}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-3 mb-4 md:mb-6 px-4 sm:px-6"
      >
        <FiStar className="text-3xl text-yellow-500" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Top Rated Shops</h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-4 px-4 sm:px-6">
        {topRated.flatMap((shop, index) => {
          const items: React.ReactNode[] = [
            <ShopCard key={shop._id || shop.place_id || index} shop={shop} index={index} onClick={() => onShopClick?.(shop)} userLocation={userLocation} />
          ];
          
          // Add in-feed ad after every 2 shop cards
          if ((index + 1) % 2 === 0 && (index + 1) < topRated.length) {
            items.push(
              <div key={`ad-toprated-${index}`} className="col-span-1 md:col-span-2 lg:col-span-3 my-4">
                <InFeedAd />
              </div>
            );
          }
          
          return items;
        })}
      </div>

      {/* Ad Space - Homepage Ads */}
      <div className="px-4 sm:px-6 mt-8">
        <AdSlot slot="homepage" />
      </div>
    </section>
  );
}

