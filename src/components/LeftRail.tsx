'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiMapPin, FiTag, FiChevronDown } from 'react-icons/fi';
import AdSlot from './AdSlot';
import AdvertisementBanner from './AdvertisementBanner';
import { useLanguage } from '@/contexts/LanguageContext';

interface LeftRailProps {
  onCategoryChange?: (category: string) => void;
  onCityChange?: (city: string) => void;
  selectedCategory?: string;
}

// Categories will be translated dynamically
const categoryKeys = [
  'All Categories',
  'Retail',
  'Restaurant',
  'Electronics',
  'Clothing',
  'Grocery',
  'Pharmacy',
  'Hardware',
  'Jewelry',
  'Automobile',
  'Furniture',
];

const popularCities = [
  'Patna',
  'Gaya',
  'Muzaffarpur',
  'Bhagalpur',
  'Purnia',
  'Darbhanga',
];

// Popular Cities Dropdown Component
function PopularCitiesDropdown({ cities, onCityChange }: { cities: string[]; onCityChange?: (city: string) => void }) {
  const [selectedCity, setSelectedCity] = useState('Select City');
  const [isOpen, setIsOpen] = useState(false);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setIsOpen(false);
    onCityChange?.(city);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white/90 backdrop-blur-md rounded-lg border border-gray-200/50 text-sm font-medium text-gray-700 hover:bg-white transition-colors shadow-sm"
        aria-label="Select city"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{selectedCity}</span>
        <FiChevronDown className={`text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200/50 py-2 z-20 max-h-64 overflow-y-auto"
            >
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  role="option"
                  aria-selected={selectedCity === city}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    selectedCity === city
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {city}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LeftRail({ onCategoryChange, onCityChange, selectedCategory: propSelectedCategory }: LeftRailProps) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(propSelectedCategory || t('category.all'));
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  // Get categories with translation
  const categories = categoryKeys.map(key => 
    key === 'All Categories' ? t('category.all') : key
  );

  // Update local state when prop changes
  useEffect(() => {
    if (propSelectedCategory) {
      setSelectedCategory(propSelectedCategory);
    } else {
      setSelectedCategory(t('category.all'));
    }
  }, [propSelectedCategory, t]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsCategoryOpen(false);
    onCategoryChange?.(category);
  };

  return (
    <aside className="w-full lg:w-64 space-y-4 sm:space-y-6">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700/50"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <FiFilter />
          {t('common.filter')}
        </h3>

        {/* Categories Dropdown */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <FiTag />
            {t('shop.category')}
          </h4>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-700 backdrop-blur-md rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
              aria-label="Select category"
              aria-expanded={isCategoryOpen}
              aria-haspopup="listbox"
            >
              <span>{selectedCategory}</span>
              <FiChevronDown className={`text-sm transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            
            <AnimatePresence>
              {isCategoryOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsCategoryOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20 max-h-64 overflow-y-auto"
                    role="listbox"
                    aria-label="Category options"
                  >
                    {categoryKeys.map((categoryKey) => {
                      const displayCategory = categoryKey === 'All Categories' ? t('category.all') : categoryKey;
                      const isSelected = selectedCategory === displayCategory || 
                        (categoryKey === 'All Categories' && (selectedCategory === 'All Categories' || selectedCategory === t('category.all')));
                      return (
                      <button
                          key={categoryKey}
                        type="button"
                          onClick={() => handleCategorySelect(displayCategory)}
                        role="option"
                          aria-selected={isSelected}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            isSelected
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                            : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                          {displayCategory}
                      </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Popular Cities Dropdown */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FiMapPin />
            Popular Cities
          </h4>
          <PopularCitiesDropdown cities={popularCities} onCityChange={onCityChange} />
        </div>
      </motion.div>

      {/* Ad Space 1 - Category/Homepage Ads */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AdSlot slot="category" />
        <AdvertisementBanner slot="sidebar-left" uniqueId="leftrail-1" />
      </motion.div>

      {/* Ad Space 2 - Category/Homepage Ads */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AdSlot slot="category" />
        <AdvertisementBanner slot="sidebar-left" uniqueId="leftrail-2" />
      </motion.div>

      {/* Ad Space 3 - Homepage Ads */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <AdSlot slot="homepage" />
        <AdvertisementBanner slot="sidebar-left" uniqueId="leftrail-3" />
      </motion.div>
    </aside>
  );
}

