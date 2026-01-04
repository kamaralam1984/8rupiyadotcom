'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiMapPin, FiTag, FiChevronDown, FiSearch } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';

interface LeftRailProps {
  onCategoryChange?: (category: string) => void;
  onCityChange?: (city: string) => void;
  selectedCategory?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  displayOrder: number;
}

const popularCities = [
  'Patna',
  'Gaya',
  'Muzaffarpur',
  'Bhagalpur',
  'Purnia',
  'Darbhanga',
];


export default function LeftRail({ onCategoryChange, onCityChange, selectedCategory: propSelectedCategory }: LeftRailProps) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(propSelectedCategory || t('category.all'));
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categorySearchText, setCategorySearchText] = useState('');
  const [adContents, setAdContents] = useState<any[]>([]);
  
  // City filter state
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [citySearchText, setCitySearchText] = useState('');
  
  // Combined filter panel state - expands when either category or city is opened
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  // Fetch categories from database (linked with agent panel)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setCategories(data.categories || []);
        } else {
          console.error('Failed to fetch categories:', data.error);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch ad space content for left rail
  useEffect(() => {
    const fetchAdContents = async () => {
      try {
        const response = await fetch('/api/ad-space-content?rail=left');
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
    setCategorySearchText(''); // Clear search on select
    onCategoryChange?.(category);
    // Close panel if city is also closed
    if (!isCityOpen) {
      setIsFilterPanelOpen(false);
    }
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setIsCityOpen(false);
    setCitySearchText(''); // Clear search on select
    onCityChange?.(city);
    // Close panel if category is also closed
    if (!isCategoryOpen) {
      setIsFilterPanelOpen(false);
    }
  };

  // Handle category button click - expand filter panel
  const handleCategoryClick = () => {
    const newCategoryOpen = !isCategoryOpen;
    setIsCategoryOpen(newCategoryOpen);
    // Expand panel if opening category, or keep open if city is open
    if (newCategoryOpen || isCityOpen) {
      setIsFilterPanelOpen(true);
    } else {
      // Close panel only if both are closed
      setIsFilterPanelOpen(false);
    }
  };

  // Handle city button click - expand filter panel
  const handleCityClick = () => {
    const newCityOpen = !isCityOpen;
    setIsCityOpen(newCityOpen);
    // Expand panel if opening city, or keep open if category is open
    if (newCityOpen || isCategoryOpen) {
      setIsFilterPanelOpen(true);
    } else {
      // Close panel only if both are closed
      setIsFilterPanelOpen(false);
    }
  };

  // Filter categories based on search text
  const filteredCategories = categories.filter(category => {
    if (!categorySearchText.trim()) return true;
    const searchLower = categorySearchText.toLowerCase();
    return category.name.toLowerCase().includes(searchLower) ||
           (category.icon && category.icon.includes(searchLower));
  });

  // Filter cities based on search text
  const filteredCities = popularCities.filter(city => {
    if (!citySearchText.trim()) return true;
    const searchLower = citySearchText.toLowerCase();
    return city.toLowerCase().includes(searchLower);
  });

  return (
    <aside className="w-full lg:w-64 space-y-4 sm:space-y-6">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2 p-4 sm:p-6 pb-0">
          <FiFilter />
          {t('common.filter')}
        </h3>

        {/* Filter Panel Content - Expands when category or city is opened */}
        <AnimatePresence>
          {isFilterPanelOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="px-4 sm:px-6 pb-4 sm:pb-6"
            >
              {/* Categories Section */}
              <div className="mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                  {/* Category Button */}
                  <div
                    onClick={handleCategoryClick}
                    className="w-full flex justify-between items-center font-semibold cursor-pointer text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FiTag />
                      {selectedCategory}
                    </span>
                    <FiChevronDown className={`text-sm transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Category Dropdown List */}
                  <AnimatePresence>
                    {isCategoryOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2"
                      >
                        <div className="w-full h-[432px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg category-scrollbar scroll-smooth">
                          {/* Search Input */}
                          <div className="p-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <div className="relative">
                              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
                              <input
                                type="text"
                                placeholder="Search category..."
                                value={categorySearchText}
                                onChange={(e) => setCategorySearchText(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                autoFocus
                              />
                            </div>
                          </div>

                          {/* All Categories Option */}
                          {(!categorySearchText.trim() || t('category.all').toLowerCase().includes(categorySearchText.toLowerCase())) && (
                            <div
                              onClick={() => handleCategorySelect(t('category.all'))}
                              className={`p-2 py-2 cursor-pointer hover:bg-blue-400 hover:text-white dark:hover:bg-blue-600 transition-colors ${
                                selectedCategory === t('category.all') || selectedCategory === 'All Categories'
                                  ? 'bg-blue-400 dark:bg-blue-600 text-white font-semibold'
                                  : 'text-gray-800 dark:text-gray-200'
                              }`}
                            >
                              {t('category.all')}
                            </div>
                          )}

                          {/* Database Categories */}
                          {loadingCategories ? (
                            <div className="p-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                              Loading categories...
                            </div>
                          ) : filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => {
                              const displayCategory = category.icon ? `${category.icon} ${category.name}` : category.name;
                              const isSelected = selectedCategory === category.name;
                              return (
                                <div
                                  key={category._id}
                                  onClick={() => handleCategorySelect(category.name)}
                                  className={`p-2 py-2 cursor-pointer hover:bg-blue-400 hover:text-white dark:hover:bg-blue-600 transition-colors ${
                                    isSelected
                                      ? 'bg-blue-400 dark:bg-blue-600 text-white font-semibold'
                                      : 'text-gray-800 dark:text-gray-200'
                                  }`}
                                >
                                  {displayCategory}
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-2 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                              {categorySearchText.trim() ? 'No categories found' : 'No categories available'}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Popular Cities Section - Inside Filter Panel */}
              <div className="mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                  {/* City Button */}
                  <div
                    onClick={handleCityClick}
                    className="w-full flex justify-between items-center font-semibold cursor-pointer text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FiMapPin />
                      {selectedCity || 'Popular Cities'}
                    </span>
                    <FiChevronDown className={`text-sm transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* City Dropdown List */}
                  <AnimatePresence>
                    {isCityOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2"
                      >
                        <div className="w-full h-[432px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg category-scrollbar scroll-smooth">
                          {/* Search Input */}
                          <div className="p-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <div className="relative">
                              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
                              <input
                                type="text"
                                placeholder="Search city..."
                                value={citySearchText}
                                onChange={(e) => setCitySearchText(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                autoFocus
                              />
                            </div>
                          </div>

                          {/* All Cities Option */}
                          {(!citySearchText.trim() || 'All Cities'.toLowerCase().includes(citySearchText.toLowerCase())) && (
                            <div
                              onClick={() => handleCitySelect('')}
                              className={`p-2 py-2 cursor-pointer hover:bg-blue-400 hover:text-white dark:hover:bg-blue-600 transition-colors ${
                                !selectedCity
                                  ? 'bg-blue-400 dark:bg-blue-600 text-white font-semibold'
                                  : 'text-gray-800 dark:text-gray-200'
                              }`}
                            >
                              All Cities
                            </div>
                          )}

                          {/* Popular Cities List */}
                          {filteredCities.length > 0 ? (
                            filteredCities.map((city) => {
                              const isSelected = selectedCity === city;
                              return (
                                <div
                                  key={city}
                                  onClick={() => handleCitySelect(city)}
                                  className={`p-2 py-2 cursor-pointer hover:bg-blue-400 hover:text-white dark:hover:bg-blue-600 transition-colors ${
                                    isSelected
                                      ? 'bg-blue-400 dark:bg-blue-600 text-white font-semibold'
                                      : 'text-gray-800 dark:text-gray-200'
                                  }`}
                                >
                                  {city}
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-2 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                              {citySearchText.trim() ? 'No cities found' : 'No cities available'}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Panel Toggle Buttons - Always Visible */}
        {!isFilterPanelOpen && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3">
            {/* Category Button - Opens Filter Panel */}
            <div
              onClick={handleCategoryClick}
              className="w-full flex justify-between items-center font-semibold cursor-pointer text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-gray-800 rounded-xl shadow p-4"
            >
              <span className="flex items-center gap-2">
                <FiTag />
                {selectedCategory}
              </span>
              <FiChevronDown className="text-sm" />
            </div>

            {/* City Button - Opens Filter Panel */}
            <div
              onClick={handleCityClick}
              className="w-full flex justify-between items-center font-semibold cursor-pointer text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-gray-800 rounded-xl shadow p-4"
            >
              <span className="flex items-center gap-2">
                <FiMapPin />
                {selectedCity || 'Popular Cities'}
              </span>
              <FiChevronDown className="text-sm" />
            </div>
          </div>
        )}
      </motion.div>

      {/* Ad Space Text Content */}
      {adContents.map((content, index) => (
        <motion.div
          key={content._id || index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
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

