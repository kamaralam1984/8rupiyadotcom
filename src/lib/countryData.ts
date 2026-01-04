/**
 * Comprehensive country data with validation rules
 * Includes country codes, flags, phone number formats, and postal code formats
 */

export interface CountryData {
  code: string; // ISO 3166-1 alpha-2 code
  name: string;
  dialCode: string; // Country calling code (e.g., "+91")
  flag: string; // Unicode flag emoji
  currency: {
    code: string; // ISO 4217 currency code (e.g., "INR", "USD")
    symbol: string; // Currency symbol (e.g., "₹", "$", "£")
    name: string; // Currency name (e.g., "Indian Rupee", "US Dollar")
  };
  phoneLength: {
    min: number;
    max: number;
  };
  postalCode: {
    pattern: RegExp;
    length: number;
    example: string;
    format: string; // Description of format
  };
}

export const countries: CountryData[] = [
  // India
  {
    code: 'IN',
    name: 'India',
    dialCode: '+91',
    flag: '🇮🇳',
    currency: {
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupee',
    },
    phoneLength: { min: 10, max: 10 },
    postalCode: {
      pattern: /^[1-9][0-9]{5}$/,
      length: 6,
      example: '800001',
      format: '6 digits (no leading zero)',
    },
  },
  // United States
  {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
    currency: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
    },
    phoneLength: { min: 10, max: 10 },
    postalCode: {
      pattern: /^\d{5}(-\d{4})?$/,
      length: 5,
      example: '10001',
      format: '5 digits (optional +4 extension)',
    },
  },
  // United Kingdom
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    flag: '🇬🇧',
    currency: {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound',
    },
    phoneLength: { min: 10, max: 11 },
    postalCode: {
      pattern: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
      length: 6,
      example: 'SW1A 1AA',
      format: 'Alphanumeric (e.g., SW1A 1AA)',
    },
  },
  // Canada
  {
    code: 'CA',
    name: 'Canada',
    dialCode: '+1',
    flag: '🇨🇦',
    currency: {
      code: 'CAD',
      symbol: 'C$',
      name: 'Canadian Dollar',
    },
    phoneLength: { min: 10, max: 10 },
    postalCode: {
      pattern: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
      length: 6,
      example: 'K1A 0B1',
      format: 'Alphanumeric (e.g., K1A 0B1)',
    },
  },
  // Australia
  {
    code: 'AU',
    name: 'Australia',
    dialCode: '+61',
    flag: '🇦🇺',
    currency: {
      code: 'AUD',
      symbol: 'A$',
      name: 'Australian Dollar',
    },
    phoneLength: { min: 9, max: 10 },
    postalCode: {
      pattern: /^\d{4}$/,
      length: 4,
      example: '2000',
      format: '4 digits',
    },
  },
  // Germany
  {
    code: 'DE',
    name: 'Germany',
    dialCode: '+49',
    flag: '🇩🇪',
    currency: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
    },
    phoneLength: { min: 10, max: 11 },
    postalCode: {
      pattern: /^\d{5}$/,
      length: 5,
      example: '10115',
      format: '5 digits',
    },
  },
  // France
  {
    code: 'FR',
    name: 'France',
    dialCode: '+33',
    flag: '🇫🇷',
    currency: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
    },
    phoneLength: { min: 9, max: 10 },
    postalCode: {
      pattern: /^\d{5}$/,
      length: 5,
      example: '75001',
      format: '5 digits',
    },
  },
  // Japan
  {
    code: 'JP',
    name: 'Japan',
    dialCode: '+81',
    flag: '🇯🇵',
    currency: {
      code: 'JPY',
      symbol: '¥',
      name: 'Japanese Yen',
    },
    phoneLength: { min: 10, max: 11 },
    postalCode: {
      pattern: /^\d{3}-?\d{4}$/,
      length: 7,
      example: '100-0001',
      format: '7 digits (3-4 format)',
    },
  },
  // China
  {
    code: 'CN',
    name: 'China',
    dialCode: '+86',
    flag: '🇨🇳',
    currency: {
      code: 'CNY',
      symbol: '¥',
      name: 'Chinese Yuan',
    },
    phoneLength: { min: 11, max: 11 },
    postalCode: {
      pattern: /^\d{6}$/,
      length: 6,
      example: '100000',
      format: '6 digits',
    },
  },
  // Brazil
  {
    code: 'BR',
    name: 'Brazil',
    dialCode: '+55',
    flag: '🇧🇷',
    currency: {
      code: 'BRL',
      symbol: 'R$',
      name: 'Brazilian Real',
    },
    phoneLength: { min: 10, max: 11 },
    postalCode: {
      pattern: /^\d{5}-?\d{3}$/,
      length: 8,
      example: '01310-100',
      format: '8 digits (5-3 format)',
    },
  },
  // Russia
  {
    code: 'RU',
    name: 'Russia',
    dialCode: '+7',
    flag: '🇷🇺',
    currency: {
      code: 'RUB',
      symbol: '₽',
      name: 'Russian Ruble',
    },
    phoneLength: { min: 10, max: 10 },
    postalCode: {
      pattern: /^\d{6}$/,
      length: 6,
      example: '101000',
      format: '6 digits',
    },
  },
  // South Korea
  {
    code: 'KR',
    name: 'South Korea',
    dialCode: '+82',
    flag: '🇰🇷',
    currency: {
      code: 'KRW',
      symbol: '₩',
      name: 'South Korean Won',
    },
    phoneLength: { min: 9, max: 10 },
    postalCode: {
      pattern: /^\d{5}$/,
      length: 5,
      example: '03051',
      format: '5 digits',
    },
  },
  // Italy
  {
    code: 'IT',
    name: 'Italy',
    dialCode: '+39',
    flag: '🇮🇹',
    currency: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
    },
    phoneLength: { min: 9, max: 10 },
    postalCode: {
      pattern: /^\d{5}$/,
      length: 5,
      example: '00118',
      format: '5 digits',
    },
  },
  // Spain
  {
    code: 'ES',
    name: 'Spain',
    dialCode: '+34',
    flag: '🇪🇸',
    currency: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
    },
    phoneLength: { min: 9, max: 9 },
    postalCode: {
      pattern: /^\d{5}$/,
      length: 5,
      example: '28001',
      format: '5 digits',
    },
  },
  // Mexico
  {
    code: 'MX',
    name: 'Mexico',
    dialCode: '+52',
    flag: '🇲🇽',
    currency: {
      code: 'MXN',
      symbol: '$',
      name: 'Mexican Peso',
    },
    phoneLength: { min: 10, max: 10 },
    postalCode: {
      pattern: /^\d{5}$/,
      length: 5,
      example: '01000',
      format: '5 digits',
    },
  },
  // Indonesia
  {
    code: 'ID',
    name: 'Indonesia',
    dialCode: '+62',
    flag: '🇮🇩',
    currency: {
      code: 'IDR',
      symbol: 'Rp',
      name: 'Indonesian Rupiah',
    },
    phoneLength: { min: 9, max: 11 },
    postalCode: {
      pattern: /^\d{5}$/,
      length: 5,
      example: '10110',
      format: '5 digits',
    },
  },
  // Netherlands
  {
    code: 'NL',
    name: 'Netherlands',
    dialCode: '+31',
    flag: '🇳🇱',
    currency: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
    },
    phoneLength: { min: 9, max: 9 },
    postalCode: {
      pattern: /^\d{4}\s?[A-Z]{2}$/i,
      length: 6,
      example: '1012 AB',
      format: '4 digits + 2 letters',
    },
  },
  // Saudi Arabia
  {
    code: 'SA',
    name: 'Saudi Arabia',
    dialCode: '+966',
    flag: '🇸🇦',
    currency: {
      code: 'SAR',
      symbol: '﷼',
      name: 'Saudi Riyal',
    },
    phoneLength: { min: 9, max: 9 },
    postalCode: {
      pattern: /^\d{5}(-?\d{4})?$/,
      length: 5,
      example: '11564',
      format: '5 digits (optional +4)',
    },
  },
  // United Arab Emirates
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dialCode: '+971',
    flag: '🇦🇪',
    currency: {
      code: 'AED',
      symbol: 'د.إ',
      name: 'UAE Dirham',
    },
    phoneLength: { min: 9, max: 9 },
    postalCode: {
      pattern: /^.{0,10}$/, // UAE doesn't use postal codes widely
      length: 0,
      example: 'N/A',
      format: 'Not commonly used',
    },
  },
  // Singapore
  {
    code: 'SG',
    name: 'Singapore',
    dialCode: '+65',
    flag: '🇸🇬',
    currency: {
      code: 'SGD',
      symbol: 'S$',
      name: 'Singapore Dollar',
    },
    phoneLength: { min: 8, max: 8 },
    postalCode: {
      pattern: /^\d{6}$/,
      length: 6,
      example: '018956',
      format: '6 digits',
    },
  },
  // Malaysia
  {
    code: 'MY',
    name: 'Malaysia',
    dialCode: '+60',
    flag: '🇲🇾',
    currency: {
      code: 'MYR',
      symbol: 'RM',
      name: 'Malaysian Ringgit',
    },
    phoneLength: { min: 9, max: 10 },
    postalCode: {
      pattern: /^\d{5}$/,
      length: 5,
      example: '50000',
      format: '5 digits',
    },
  },
  // Thailand
  {
    code: 'TH',
    name: 'Thailand',
    dialCode: '+66',
    flag: '🇹🇭',
    currency: {
      code: 'THB',
      symbol: '฿',
      name: 'Thai Baht',
    },
    phoneLength: { min: 9, max: 9 },
    postalCode: {
      pattern: /^\d{5}$/,
      length: 5,
      example: '10100',
      format: '5 digits',
    },
  },
  // Philippines
  {
    code: 'PH',
    name: 'Philippines',
    dialCode: '+63',
    flag: '🇵🇭',
    currency: {
      code: 'PHP',
      symbol: '₱',
      name: 'Philippine Peso',
    },
    phoneLength: { min: 10, max: 10 },
    postalCode: {
      pattern: /^\d{4}$/,
      length: 4,
      example: '1000',
      format: '4 digits',
    },
  },
  // Vietnam
  {
    code: 'VN',
    name: 'Vietnam',
    dialCode: '+84',
    flag: '🇻🇳',
    currency: {
      code: 'VND',
      symbol: '₫',
      name: 'Vietnamese Dong',
    },
    phoneLength: { min: 9, max: 10 },
    postalCode: {
      pattern: /^\d{5,6}$/,
      length: 5,
      example: '100000',
      format: '5-6 digits',
    },
  },
  // Bangladesh
  {
    code: 'BD',
    name: 'Bangladesh',
    dialCode: '+880',
    flag: '🇧🇩',
    currency: {
      code: 'BDT',
      symbol: '৳',
      name: 'Bangladeshi Taka',
    },
    phoneLength: { min: 10, max: 10 },
    postalCode: {
      pattern: /^\d{4}$/,
      length: 4,
      example: '1000',
      format: '4 digits',
    },
  },
  // Pakistan
  {
    code: 'PK',
    name: 'Pakistan',
    dialCode: '+92',
    flag: '🇵🇰',
    currency: {
      code: 'PKR',
      symbol: '₨',
      name: 'Pakistani Rupee',
    },
    phoneLength: { min: 10, max: 10 },
    postalCode: {
      pattern: /^\d{5}$/,
      length: 5,
      example: '44000',
      format: '5 digits',
    },
  },
  // Sri Lanka
  {
    code: 'LK',
    name: 'Sri Lanka',
    dialCode: '+94',
    flag: '🇱🇰',
    currency: {
      code: 'LKR',
      symbol: '₨',
      name: 'Sri Lankan Rupee',
    },
    phoneLength: { min: 9, max: 9 },
    postalCode: {
      pattern: /^\d{5}$/,
      length: 5,
      example: '00100',
      format: '5 digits',
    },
  },
  // Nepal
  {
    code: 'NP',
    name: 'Nepal',
    dialCode: '+977',
    flag: '🇳🇵',
    currency: {
      code: 'NPR',
      symbol: '₨',
      name: 'Nepalese Rupee',
    },
    phoneLength: { min: 10, max: 10 },
    postalCode: {
      pattern: /^\d{5}$/,
      length: 5,
      example: '44600',
      format: '5 digits',
    },
  },
  // Add more countries as needed...
];

/**
 * Get country data by country code
 */
export function getCountryByCode(code: string): CountryData | undefined {
  return countries.find((country) => country.code === code);
}

/**
 * Get country data by dial code
 */
export function getCountryByDialCode(dialCode: string): CountryData | undefined {
  return countries.find((country) => country.dialCode === dialCode);
}

/**
 * Validate phone number based on country
 */
export function validatePhoneNumber(phone: string, country: CountryData): boolean {
  const digitsOnly = phone.replace(/\D/g, '');
  return (
    digitsOnly.length >= country.phoneLength.min &&
    digitsOnly.length <= country.phoneLength.max
  );
}

/**
 * Validate postal code based on country
 */
export function validatePostalCode(postalCode: string, country: CountryData): boolean {
  if (country.postalCode.length === 0) {
    return true; // Countries without postal codes
  }
  return country.postalCode.pattern.test(postalCode.trim());
}

/**
 * Get phone number placeholder based on country
 */
export function getPhonePlaceholder(country: CountryData): string {
  const length = country.phoneLength.max;
  return `Enter ${length} digit${length > 1 ? 's' : ''} mobile number`;
}

/**
 * Get postal code placeholder based on country
 */
export function getPostalCodePlaceholder(country: CountryData): string {
  if (country.postalCode.length === 0) {
    return 'Postal code not required';
  }
  return `Enter ${country.postalCode.format} (e.g., ${country.postalCode.example})`;
}

/**
 * Get postal code max length based on country
 */
export function getPostalCodeMaxLength(country: CountryData): number {
  if (country.postalCode.length === 0) {
    return 10; // Default max length
  }
  // Add some buffer for formatting characters
  return country.postalCode.length + 5;
}

