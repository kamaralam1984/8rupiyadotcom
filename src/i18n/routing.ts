import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale, isValidLocale } from './config';

/**
 * Get locale from pathname
 * Examples:
 * - /en/shops -> 'en'
 * - /hi/shops -> 'hi'
 * - /shops -> null (no locale)
 */
export function getLocaleFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment && isValidLocale(firstSegment)) {
    return firstSegment;
  }
  
  return null;
}

/**
 * Remove locale from pathname
 * Examples:
 * - /en/shops -> /shops
 * - /hi/shops -> /shops
 * - /shops -> /shops
 */
export function removeLocaleFromPath(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (locale) {
    return pathname.replace(`/${locale}`, '') || '/';
  }
  return pathname;
}

/**
 * Add locale to pathname
 * Examples:
 * - /shops, 'en' -> /en/shops
 * - /shops, 'hi' -> /hi/shops
 * - /, 'en' -> /en
 */
export function addLocaleToPath(pathname: string, locale: string): string {
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const pathWithoutLocale = removeLocaleFromPath(cleanPath);
  
  // Don't add locale to API routes, admin routes, etc.
  if (
    pathWithoutLocale.startsWith('/api/') ||
    pathWithoutLocale.startsWith('/admin/') ||
    pathWithoutLocale.startsWith('/agent/') ||
    pathWithoutLocale.startsWith('/operator/') ||
    pathWithoutLocale.startsWith('/accountant/') ||
    pathWithoutLocale.startsWith('/shopper/') ||
    pathWithoutLocale.startsWith('/user/') ||
    pathWithoutLocale.startsWith('/_next/') ||
    pathWithoutLocale.startsWith('/favicon') ||
    pathWithoutLocale.includes('.')
  ) {
    return pathWithoutLocale;
  }
  
  // If path is just '/', return /locale
  if (pathWithoutLocale === '/') {
    return `/${locale}`;
  }
  
  return `/${locale}${pathWithoutLocale}`;
}

/**
 * Get locale from request (pathname, cookie, or Accept-Language header)
 */
export function getLocaleFromRequest(req: NextRequest): string {
  // 1. Check pathname first
  const localeFromPath = getLocaleFromPath(req.nextUrl.pathname);
  if (localeFromPath) {
    return localeFromPath;
  }
  
  // 2. Check cookie
  const localeFromCookie = req.cookies.get('NEXT_LOCALE')?.value;
  if (localeFromCookie && isValidLocale(localeFromCookie)) {
    return localeFromCookie;
  }
  
  // 3. Check Accept-Language header
  const acceptLanguage = req.headers.get('accept-language');
  if (acceptLanguage) {
    // Parse Accept-Language header
    const languages = acceptLanguage.split(',').map(lang => {
      const [code, q = '1'] = lang.trim().split(';q=');
      return { code: code.split('-')[0].toLowerCase(), quality: parseFloat(q) };
    });
    
    // Sort by quality
    languages.sort((a, b) => b.quality - a.quality);
    
    // Find first valid locale
    for (const lang of languages) {
      if (isValidLocale(lang.code)) {
        return lang.code;
      }
    }
    
    // Check for Hindi variants
    if (languages.some(l => l.code === 'hi')) {
      return 'hi';
    }
  }
  
  // 4. Default
  return defaultLocale;
}

