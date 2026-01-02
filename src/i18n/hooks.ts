'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { locales, defaultLocale, type Locale } from './config';
import { getTranslation } from './translations';

/**
 * Hook to get current locale from URL
 */
export function useLocale(): Locale {
  const pathname = usePathname();
  
  return useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];
    
    if (firstSegment && locales.includes(firstSegment as Locale)) {
      return firstSegment as Locale;
    }
    
    return defaultLocale;
  }, [pathname]);
}

/**
 * Hook to get translation function for current locale
 */
export function useTranslation() {
  const locale = useLocale();
  
  const t = (key: string): string => {
    return getTranslation(locale, key);
  };
  
  return { t, locale };
}

