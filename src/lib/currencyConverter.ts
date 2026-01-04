/**
 * Currency conversion utility
 * Converts prices from INR (base currency) to other currencies
 */

import { CountryData, getCountryByCode } from './countryData';

// Exchange rates relative to INR (Indian Rupee)
// These are approximate rates - in production, you'd fetch from an API
const exchangeRates: Record<string, number> = {
  INR: 1.0, // Base currency
  USD: 0.012, // 1 INR = 0.012 USD (approx)
  GBP: 0.0095, // 1 INR = 0.0095 GBP (approx)
  EUR: 0.011, // 1 INR = 0.011 EUR (approx)
  CAD: 0.016, // 1 INR = 0.016 CAD (approx)
  AUD: 0.018, // 1 INR = 0.018 AUD (approx)
  JPY: 1.8, // 1 INR = 1.8 JPY (approx)
  CNY: 0.087, // 1 INR = 0.087 CNY (approx)
  BRL: 0.06, // 1 INR = 0.06 BRL (approx)
  RUB: 1.1, // 1 INR = 1.1 RUB (approx)
  KRW: 16.0, // 1 INR = 16 KRW (approx)
  MXN: 0.2, // 1 INR = 0.2 MXN (approx)
  IDR: 190.0, // 1 INR = 190 IDR (approx)
  THB: 0.43, // 1 INR = 0.43 THB (approx)
  PHP: 0.67, // 1 INR = 0.67 PHP (approx)
  VND: 300.0, // 1 INR = 300 VND (approx)
  BDT: 1.32, // 1 INR = 1.32 BDT (approx)
  PKR: 3.33, // 1 INR = 3.33 PKR (approx)
  LKR: 3.6, // 1 INR = 3.6 LKR (approx)
  NPR: 1.6, // 1 INR = 1.6 NPR (approx)
  SGD: 0.016, // 1 INR = 0.016 SGD (approx)
  MYR: 0.056, // 1 INR = 0.056 MYR (approx)
  SAR: 0.045, // 1 INR = 0.045 SAR (approx)
  AED: 0.044, // 1 INR = 0.044 AED (approx)
  // Add more as needed
};

/**
 * Convert price from INR to target currency
 */
export function convertCurrency(amountInINR: number, targetCurrencyCode: string): number {
  const rate = exchangeRates[targetCurrencyCode] || 1.0;
  return amountInINR * rate;
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currencyCode: string, currencySymbol: string): string {
  // Round to 2 decimal places for most currencies
  let formattedAmount: number;
  
  if (currencyCode === 'JPY' || currencyCode === 'KRW' || currencyCode === 'VND' || currencyCode === 'IDR') {
    // No decimals for these currencies
    formattedAmount = Math.round(amount);
  } else {
    formattedAmount = Math.round(amount * 100) / 100;
  }
  
  // Format with thousand separators
  const formatted = formattedAmount.toLocaleString('en-US', {
    minimumFractionDigits: currencyCode === 'JPY' || currencyCode === 'KRW' || currencyCode === 'VND' || currencyCode === 'IDR' ? 0 : 2,
    maximumFractionDigits: currencyCode === 'JPY' || currencyCode === 'KRW' || currencyCode === 'VND' || currencyCode === 'IDR' ? 0 : 2,
  });
  
  // Return formatted string with symbol
  return `${currencySymbol}${formatted}`;
}

/**
 * Get converted and formatted price for a country
 */
export function getPriceForCountry(amountInINR: number, countryCode: string): {
  amount: number;
  formatted: string;
  currency: string;
  symbol: string;
} {
  const country = getCountryByCode(countryCode);
  if (!country) {
    // Default to INR
    return {
      amount: amountInINR,
      formatted: formatPrice(amountInINR, 'INR', '₹'),
      currency: 'INR',
      symbol: '₹',
    };
  }
  
  const convertedAmount = convertCurrency(amountInINR, country.currency.code);
  return {
    amount: convertedAmount,
    formatted: formatPrice(convertedAmount, country.currency.code, country.currency.symbol),
    currency: country.currency.code,
    symbol: country.currency.symbol,
  };
}

/**
 * Fetch real-time exchange rates (optional - for production)
 * This would call an API like exchangerate-api.com or fixer.io
 */
export async function fetchExchangeRates(baseCurrency: string = 'INR'): Promise<Record<string, number> | null> {
  try {
    // Example API call (uncomment and configure in production)
    // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    // const data = await response.json();
    // return data.rates;
    
    // For now, return null to use static rates
    return null;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return null;
  }
}

