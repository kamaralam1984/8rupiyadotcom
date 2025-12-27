'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiWifi, FiWifiOff } from 'react-icons/fi';

export default function ConnectionStatus() {
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [redisStatus, setRedisStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    // Check database connection
    const checkDB = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setDbStatus(data.mongodb === 'connected' ? 'connected' : 'disconnected');
        setRedisStatus(data.redis === 'connected' ? 'connected' : 'disconnected');
      } catch (error) {
        setDbStatus('disconnected');
        setRedisStatus('disconnected');
      }
    };

    checkDB();
    // Check every 10 seconds
    const interval = setInterval(checkDB, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3">
      {/* MongoDB Status */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <motion.div
            animate={{
              scale: dbStatus === 'connected' ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: dbStatus === 'connected' ? Infinity : 0,
            }}
            className={`w-3 h-3 rounded-full ${
              dbStatus === 'connected'
                ? 'bg-green-500 shadow-lg shadow-green-500/50'
                : dbStatus === 'checking'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
          />
          {dbStatus === 'connected' && (
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute inset-0 w-3 h-3 rounded-full bg-green-500"
            />
          )}
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">
          {dbStatus === 'connected' ? 'DB' : 'DB'}
        </span>
      </div>

      {/* Redis Status (Optional) */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <div
            className={`w-2 h-2 rounded-full ${
              redisStatus === 'connected'
                ? 'bg-green-400'
                : redisStatus === 'checking'
                ? 'bg-yellow-400'
                : 'bg-gray-400'
            }`}
          />
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">
          Cache
        </span>
      </div>
    </div>
  );
}

