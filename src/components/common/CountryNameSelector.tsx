'use client';

import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiSearch, FiGlobe } from 'react-icons/fi';
import { countries, CountryData, getCountryByCode } from '@/lib/countryData';

interface CountryNameSelectorProps {
  value: string; // Country code (e.g., 'IN')
  onChange: (countryCode: string) => void;
  className?: string;
  disabled?: boolean;
  showFlag?: boolean;
  showDialCode?: boolean;
}

export default function CountryNameSelector({
  value,
  onChange,
  className = '',
  disabled = false,
  showFlag = true,
  showDialCode = false,
}: CountryNameSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = getCountryByCode(value) || countries[0]; // Default to India

  // Filter countries based on search query
  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.currency.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (country: CountryData) => {
    onChange(country.code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Country Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-3 px-4 py-3 
          border border-gray-300 dark:border-gray-600 
          rounded-lg 
          bg-white dark:bg-gray-700 
          text-gray-900 dark:text-white
          hover:border-blue-500 dark:hover:border-blue-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          w-full
          shadow-sm hover:shadow-md
        `}
      >
        {showFlag && <span className="text-2xl flex-shrink-0">{selectedCountry.flag}</span>}
        <div className="flex-1 text-left min-w-0">
          <div className="font-medium text-sm truncate">{selectedCountry.name}</div>
          {showDialCode && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {selectedCountry.dialCode} • {selectedCountry.currency.symbol} {selectedCountry.currency.code}
            </div>
          )}
        </div>
        <FiChevronDown
          className={`ml-auto text-gray-500 dark:text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full sm:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or currency..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="overflow-y-auto flex-1">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <FiGlobe className="mx-auto mb-2 text-2xl" />
                <p className="text-sm">No countries found</p>
              </div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 
                    hover:bg-blue-50 dark:hover:bg-blue-900/20
                    transition-colors duration-150
                    ${value === country.code ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' : ''}
                  `}
                >
                  <span className="text-2xl flex-shrink-0">{country.flag}</span>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {country.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <span>{country.dialCode}</span>
                      <span>•</span>
                      <span>{country.currency.symbol} {country.currency.code}</span>
                    </div>
                  </div>
                  {value === country.code && (
                    <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

