'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  onShowAll?: () => void;
}

export default function SearchBar({ onSearch, onRefresh, onShowAll }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div>
      <div className="relative flex items-center bg-white/90 backdrop-blur-md rounded-full shadow-2xl p-2 border border-gray-200/50">
        <FiSearch className="absolute left-6 text-gray-400 text-xl" />
        <input
          type="text"
          placeholder="Search by city (e.g., Patna, Gaya, Muzaffarpur)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 pl-14 pr-4 py-4 text-gray-700 bg-transparent border-none outline-none text-lg"
        />
        <motion.button
          onClick={handleSearch}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
        >
          <FiSearch className="text-xl" />
          Search
        </motion.button>
      </div>
      <div className="mt-4 flex items-center justify-center gap-4">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-sm text-blue-600 hover:text-purple-600 font-medium flex items-center gap-1"
          >
            <FiRefreshCw />
            Refresh
          </button>
        )}
        {onShowAll && (
          <>
            <span className="text-sm text-gray-500">or</span>
            <button
              onClick={onShowAll}
              className="text-sm text-blue-600 hover:text-purple-600 font-medium"
            >
              Show All Shops
            </button>
          </>
        )}
      </div>
    </div>
  );
}

