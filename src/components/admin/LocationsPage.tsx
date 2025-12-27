'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiPlus } from 'react-icons/fi';

export default function LocationsPage() {
  const [locations] = useState([
    { city: 'Patna', state: 'Bihar', shops: 15 },
    { city: 'Gaya', state: 'Bihar', shops: 12 },
    { city: 'Muzaffarpur', state: 'Bihar', shops: 10 },
    { city: 'Bhagalpur', state: 'Bihar', shops: 8 },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Locations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage cities and locations</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2"
        >
          <FiPlus />
          Add Location
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <FiMapPin className="text-3xl text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {location.city}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{location.state}</p>
            <p className="text-sm text-gray-500">
              {location.shops} shops
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

