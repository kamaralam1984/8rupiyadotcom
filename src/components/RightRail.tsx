'use client';

import { motion } from 'framer-motion';
import { FiTrendingUp, FiStar, FiUsers, FiZap } from 'react-icons/fi';

interface RightRailProps {
  topRatedShops?: any[];
  trendingShops?: any[];
}

export default function RightRail({ topRatedShops = [], trendingShops = [] }: RightRailProps) {
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

      {/* Movement Section - Modern Design */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl shadow-2xl overflow-hidden border border-purple-400/20"
      >
        <div className="p-5 sm:p-6 relative">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            {/* Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                <FiZap className="text-3xl text-white" />
              </div>
            </div>
            
            {/* Heading */}
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 text-center">
              Ek Movement Hai
            </h3>
            
            {/* Content */}
            <p className="text-sm sm:text-base text-white/95 leading-relaxed text-center mb-4">
              <strong className="text-white font-semibold">8rupiya.com</strong> sirf ek website nahi hai - yeh ek <strong className="text-yellow-300">movement</strong> hai jo India ke local businesses ko empower kar raha hai.
            </p>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-2">
                <FiUsers className="text-white/90 text-lg mt-0.5 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  Chahe aap ek <strong className="text-white">customer</strong> ho jo trusted services dhundh raha hai
                </p>
              </div>
              <div className="flex items-start gap-2">
                <FiTrendingUp className="text-white/90 text-lg mt-0.5 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  Ya ek <strong className="text-white">shopkeeper</strong> ho jo apne business ko online le jana chahta hai
                </p>
              </div>
            </div>
            
            {/* CTA */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
              <p className="text-xs sm:text-sm text-white text-center font-semibold">
                <strong className="text-yellow-300">8rupiya.com aapke liye hai!</strong>
              </p>
              <p className="text-xs text-white/90 text-center mt-2 leading-relaxed">
                Join karein India ke sabse growing local business community ko aur baniye iss <strong className="text-white">digital revolution</strong> ka hissa!
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </aside>
  );
}

