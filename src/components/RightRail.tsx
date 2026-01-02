'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiStar } from 'react-icons/fi';
import AdSlot from './AdSlot';
import AdvertisementBanner from './AdvertisementBanner';

interface RightRailProps {
  topRatedShops?: any[];
  trendingShops?: any[];
}

export default function RightRail({ topRatedShops = [], trendingShops = [] }: RightRailProps) {
  const [adContents, setAdContents] = useState<any[]>([]);

  // Fetch ad space content for right rail
  useEffect(() => {
    const fetchAdContents = async () => {
      try {
        const response = await fetch('/api/ad-space-content?rail=right');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setAdContents(data.contents || []);
        }
      } catch (error) {
        console.error('Error fetching ad contents:', error);
      }
    };

    fetchAdContents();
  }, []);
  return (
    <aside className="w-full lg:w-64 space-y-4 sm:space-y-6">
      {/* Top Rated Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50 overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FiStar className="text-yellow-500" />
            Top Rated
          </h3>
        </div>
        
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
          {topRatedShops.slice(0, 5).map((shop, index) => (
            <div key={shop._id || index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{shop.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{shop.city}</p>
              </div>
              <div className="flex items-center gap-1">
                <FiStar className="text-yellow-500 text-xs fill-yellow-500" />
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{shop.rating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          ))}
          {topRatedShops.length === 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">No shops yet</p>
          )}
        </div>
      </motion.div>

      {/* Trending Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50 overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FiTrendingUp className="text-orange-500" />
            Trending
          </h3>
        </div>
        
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
          {trendingShops.slice(0, 5).map((shop, index) => (
            <div key={shop._id || index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{shop.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{shop.city}</p>
              </div>
            </div>
          ))}
          {trendingShops.length === 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">No shops yet</p>
          )}
        </div>
      </motion.div>

      {/* Ad Space 1 - Homepage Ads */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <AdSlot slot="homepage" />
        <AdvertisementBanner slot="sidebar-right" uniqueId="rightrail-1" />
      </motion.div>

      {/* Ad Space 2 - Homepage Ads */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <AdSlot slot="homepage" />
        <AdvertisementBanner slot="sidebar-right" uniqueId="rightrail-2" />
      </motion.div>

      {/* Ad Space Text Content */}
      {adContents.map((content, index) => (
        <motion.div
          key={content._id || index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: (0.6 + index * 0.1) }}
          className={`bg-white dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50 ${content.margin || 'mb-4'}`}
          style={{
            backgroundColor: content.showBackground ? (content.backgroundColor || '#FFFFFF') : 'transparent',
            borderColor: content.showBorder ? (content.borderColor || '#E5E7EB') : 'transparent',
            borderWidth: content.showBorder ? '1px' : '0',
          }}
        >
          <div className={content.padding || 'p-4'}>
            {content.title && (
              <h4 
                className="text-base font-semibold text-gray-900 dark:text-white mb-2"
                style={{ color: content.textColor || '#1F2937' }}
              >
                {content.title}
              </h4>
            )}
            <div
              className={`text-sm text-gray-700 dark:text-gray-300 ${content.textAlign === 'center' ? 'text-center' : content.textAlign === 'right' ? 'text-right' : 'text-left'}`}
              style={{ color: content.textColor || '#1F2937' }}
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
            {content.linkUrl && (
              <a
                href={content.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {content.linkText || 'Learn more →'}
              </a>
            )}
          </div>
        </motion.div>
      ))}
    </aside>
  );
}

