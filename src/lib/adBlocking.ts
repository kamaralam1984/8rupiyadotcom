/**
 * Ad Blocking Utility
 * Blocks ads on specific pages and routes
 */

'use client';

import { usePathname } from 'next/navigation';

/**
 * Minimum content requirements for ads
 */
const MIN_CONTENT_WORDS = 250; // Minimum words required to show ads
const MIN_SHOPS_FOR_ADS = 1; // Minimum shops required to show ads

/**
 * Check if page has enough content for ads
 * @param contentLength - Number of words on the page
 * @param shopsCount - Number of shops (for category pages)
 * @returns true if page has enough content
 */
export function hasEnoughContent(contentLength?: number, shopsCount?: number): boolean {
  // If shopsCount is provided, check if there are shops
  if (shopsCount !== undefined) {
    return shopsCount >= MIN_SHOPS_FOR_ADS;
  }
  
  // If contentLength is provided, check if it meets minimum
  if (contentLength !== undefined) {
    return contentLength >= MIN_CONTENT_WORDS;
  }
  
  // Default: assume enough content if not specified
  return true;
}

/**
 * Check if ads should be blocked on current path
 * @param pathname - Current pathname
 * @param shopsCount - Optional: Number of shops (for empty category pages)
 * @param contentLength - Optional: Number of words on the page
 * @returns true if ads should be blocked
 */
export function shouldBlockAds(
  pathname: string | null, 
  shopsCount?: number,
  contentLength?: number
): boolean {
  if (!pathname) return false;

  // Block ads on specific routes
  const blockedRoutes = [
    '/login',
    '/register',
    '/admin',
    '/dashboard',
    '/add-shop',
    '/checkout',
    '/search',
  ];

  // Check exact matches
  if (blockedRoutes.includes(pathname)) {
    return true;
  }

  // Check if path starts with blocked routes
  for (const route of blockedRoutes) {
    if (pathname.startsWith(route)) {
      return true;
    }
  }

  // Block ads on admin, agent, operator, accountant, and shopper panels
  const isAdminPanel = pathname.startsWith('/admin') || 
                       pathname.startsWith('/agent') || 
                       pathname.startsWith('/operator') ||
                       pathname.startsWith('/accountant') ||
                       pathname.startsWith('/shopper');

  if (isAdminPanel) {
    return true;
  }

  // Block ads on empty category pages
  // If shopsCount is provided and is 0, block ads
  if (shopsCount !== undefined && shopsCount === 0) {
    return true;
  }

  // Block ads if content is too short (unless shops are present)
  if (!hasEnoughContent(contentLength, shopsCount)) {
    return true;
  }

  return false;
}

/**
 * Hook to check if ads should be blocked (for client components)
 */
export function useShouldBlockAds(shopsCount?: number, contentLength?: number): boolean {
  const pathname = usePathname();
  return shouldBlockAds(pathname, shopsCount, contentLength);
}

