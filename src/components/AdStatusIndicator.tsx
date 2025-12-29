'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAdStatus } from '@/contexts/AdStatusContext';
import { usePathname } from 'next/navigation';
import { FiCircle, FiInfo } from 'react-icons/fi';
import { useState } from 'react';

export default function AdStatusIndicator() {
  const { adsLoaded, adsCount } = useAdStatus();
  const pathname = usePathname();
  const [showTooltip, setShowTooltip] = useState(false);

  // Don't show indicator on admin panels
  const isAdminPanel = pathname?.startsWith('/admin') || 
                       pathname?.startsWith('/agent') || 
                       pathname?.startsWith('/operator') ||
                       pathname?.startsWith('/accountant') ||
                       pathname?.startsWith('/shopper');

  if (isAdminPanel) {
    return null;
  }

  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Main Indicator */}
        <div className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {/* Status Light */}
          <motion.div
            animate={{
              scale: adsLoaded ? [1, 1.2, 1] : 1,
            }}
            transition={{
              repeat: adsLoaded ? Infinity : 0,
              duration: 2,
            }}
            className="relative"
          >
            <FiCircle
              className={`text-lg ${
                adsLoaded 
                  ? 'text-green-500 fill-green-500' 
                  : 'text-gray-400'
              }`}
            />
            {/* Glow effect when active */}
            {adsLoaded && (
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="absolute inset-0 rounded-full bg-green-500/30 blur-sm"
              />
            )}
          </motion.div>

          {/* Status Text */}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {adsLoaded ? 'Ads Active' : 'No Ads'}
            </span>
            {adsCount > 0 && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {adsCount} loaded
              </span>
            )}
          </div>

          {/* Info Icon */}
          <FiInfo className="text-sm text-gray-400 cursor-help" />
        </div>

        {/* Animated pulse ring when ads are active */}
        {adsLoaded && (
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
            className="absolute inset-0 rounded-lg border-2 border-green-500"
          />
        )}
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute top-full mt-2 right-0 z-50 w-64 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="text-sm">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">
                Ad Status Indicator
              </p>
              <div className="space-y-1 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <FiCircle className="text-green-500 fill-green-500" />
                  <span className="text-xs">Green = Ads are loading</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCircle className="text-gray-400" />
                  <span className="text-xs">Gray = No ads on this page</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Shows real-time ad loading status
              </p>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute -top-2 right-4 w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

