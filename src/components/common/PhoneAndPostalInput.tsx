'use client';

import { useState, useEffect } from 'react';
import CountryCodeSelector from './CountryCodeSelector';
import CountryNameSelector from './CountryNameSelector';
import {
  CountryData,
  getCountryByCode,
  validatePhoneNumber,
  validatePostalCode,
  getPhonePlaceholder,
  getPostalCodePlaceholder,
  getPostalCodeMaxLength,
} from '@/lib/countryData';

interface PhoneAndPostalInputProps {
  countryCode: string;
  onCountryChange: (countryCode: string) => void;
  phoneValue: string;
  onPhoneChange: (phone: string) => void;
  postalValue: string;
  onPostalChange: (postal: string) => void;
  phoneError?: string;
  postalError?: string;
  phoneLabel?: string;
  postalLabel?: string;
  phoneRequired?: boolean;
  postalRequired?: boolean;
  className?: string;
}

export default function PhoneAndPostalInput({
  countryCode,
  onCountryChange,
  phoneValue,
  onPhoneChange,
  postalValue,
  onPostalChange,
  phoneError,
  postalError,
  phoneLabel = 'Mobile Number',
  postalLabel = 'Pincode',
  phoneRequired = true,
  postalRequired = true,
  className = '',
}: PhoneAndPostalInputProps) {
  const [phoneValidationError, setPhoneValidationError] = useState<string>('');
  const [postalValidationError, setPostalValidationError] = useState<string>('');

  const country = getCountryByCode(countryCode) || getCountryByCode('IN')!;

  // Validate phone number on change
  useEffect(() => {
    if (phoneValue && phoneValue.trim() !== '') {
      const isValid = validatePhoneNumber(phoneValue, country);
      if (!isValid) {
        setPhoneValidationError(
          `Phone number must be ${country.phoneLength.min}-${country.phoneLength.max} digits`
        );
      } else {
        setPhoneValidationError('');
      }
    } else {
      setPhoneValidationError('');
    }
  }, [phoneValue, country]);

  // Validate postal code on change
  useEffect(() => {
    if (postalValue && postalValue.trim() !== '') {
      const isValid = validatePostalCode(postalValue, country);
      if (!isValid) {
        setPostalValidationError(
          `Invalid format. Expected: ${country.postalCode.format} (e.g., ${country.postalCode.example})`
        );
      } else {
        setPostalValidationError('');
      }
    } else {
      setPostalValidationError('');
    }
  }, [postalValue, country]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    const maxLength = country.phoneLength.max;
    if (value.length <= maxLength) {
      onPhoneChange(value);
    }
  };

  const handlePostalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Allow alphanumeric for countries like UK, Canada, Netherlands
    if (country.postalCode.pattern.source.includes('[A-Z]')) {
      value = value.toUpperCase();
    } else {
      // Only digits for numeric postal codes
      value = value.replace(/\D/g, '');
    }
    const maxLength = getPostalCodeMaxLength(country);
    if (value.length <= maxLength) {
      onPostalChange(value);
    }
  };

  const displayPhoneError = phoneError || phoneValidationError;
  const displayPostalError = postalError || postalValidationError;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Country Name Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Country *
        </label>
        <CountryNameSelector
          value={countryCode}
          onChange={onCountryChange}
          showFlag={true}
          showDialCode={true}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Currency: {country.currency.symbol} {country.currency.code} • Dial Code: {country.dialCode}
        </p>
      </div>

      {/* Phone Number Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {phoneLabel} {phoneRequired && '*'}
          {country.phoneLength.min === country.phoneLength.max && (
            <span className="text-gray-500 text-xs ml-1">
              ({country.phoneLength.max} digits only)
            </span>
          )}
        </label>
        <div className="flex gap-2">
          <CountryCodeSelector
            value={countryCode}
            onChange={onCountryChange}
            className="flex-shrink-0"
          />
          <div className="flex-1">
            <input
              type="tel"
              value={phoneValue}
              onChange={handlePhoneChange}
              placeholder={getPhonePlaceholder(country)}
              maxLength={country.phoneLength.max}
              className={`
                w-full px-4 py-3 
                border rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors
                ${
                  displayPhoneError
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }
                bg-white dark:bg-gray-700 
                text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
              `}
            />
            {displayPhoneError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {displayPhoneError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Postal Code Input */}
      {country.postalCode.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {postalLabel} {postalRequired && '*'}
            <span className="text-gray-500 text-xs ml-1">
              ({country.postalCode.format})
            </span>
          </label>
          <input
            type="text"
            value={postalValue}
            onChange={handlePostalChange}
            placeholder={getPostalCodePlaceholder(country)}
            maxLength={getPostalCodeMaxLength(country)}
            className={`
              w-full px-4 py-3 
              border rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors
              ${
                displayPostalError
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }
              bg-white dark:bg-gray-700 
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
            `}
          />
          {displayPostalError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {displayPostalError}
            </p>
          )}
          {!displayPostalError && postalValue && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Example: {country.postalCode.example}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

