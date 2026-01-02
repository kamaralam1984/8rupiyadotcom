export const locales = ['en', 'hi'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// Locale display names
export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिंदी',
};

// Check if locale is valid
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Get locale from browser
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  const browserLang = navigator.language || (navigator as any).userLanguage;
  
  // Check for Hindi variants
  if (browserLang.startsWith('hi')) {
    return 'hi';
  }
  
  // Default to English
  return 'en';
}

