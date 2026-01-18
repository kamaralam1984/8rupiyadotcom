'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiShoppingBag } from 'react-icons/fi';
import ShopCard from './ShopCard';

interface Shop {
  _id?: string;
  place_id?: string; // For Google Places shops
  name: string;
  shopName?: string;
  category: string;
  address: string;
  city: string;
  images?: string[];
  photos?: string[];
  photoUrl?: string;
  rating: number;
  reviewCount: number;
  distance?: number;
  isFeatured: boolean;
  isPaid?: boolean;
  planType?: string;
  visitorCount?: number;
  createdAt?: string;
}

interface NearShopProps {
  userLocation: { lat: number; lng: number } | null;
  onShopClick?: (shop: Shop) => void;
  searchQuery?: string;
  categoryFilter?: string;
}

export default function NearShop({ userLocation, onShopClick, searchQuery, categoryFilter }: NearShopProps) {
  const [categoryShops, setCategoryShops] = useState<Array<{ category: string; shop: Shop }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNearbyShopsByCategory = async () => {
      // Use default location if user location not available (Patna, Bihar)
      const loc = userLocation || { lat: 25.5941, lng: 85.1376 };

      try {
        setLoading(true);
        console.log('🔍 NearShop: Fetching nearby shops from:', loc);
        
        // Build API URL with search and category filters
        let apiUrl = `/api/shops/nearby?lat=${loc.lat}&lng=${loc.lng}&limit=100&google=false`; // ⚡ Reduced limit for faster response
        
        if (searchQuery) {
          apiUrl += `&q=${encodeURIComponent(searchQuery)}`;
        }
        
        if (categoryFilter) {
          apiUrl += `&category=${encodeURIComponent(categoryFilter)}`;
        }
        
        console.log('🔍 NearShop: Fetching with filters:', { searchQuery, categoryFilter });
        
        // ⚡ ULTRA-FAST: Fetch with aggressive caching
        const shopsResponse = await fetch(apiUrl, {
          cache: 'force-cache',
          next: { revalidate: 300 }, // Revalidate every 5 minutes
        });
        
        if (!shopsResponse.ok) {
          throw new Error(`API error: ${shopsResponse.status}`);
        }
        
        const shopsData = await shopsResponse.json();
        
        console.log('📦 NearShop API Response:', {
          shopsCount: shopsData.shops?.length || 0,
          total: shopsData.total || 0,
          error: shopsData.error,
          hasShops: !!shopsData.shops && shopsData.shops.length > 0
        });
        
        // Check for error
        if (shopsData.error) {
          console.error('❌ NearShop: API error:', shopsData.error);
          setLoading(false);
          return;
        }

        // If no shops from nearby API, try fallback
        if (!shopsData.shops || shopsData.shops.length === 0) {
          console.log('⚠️ NearShop: No shops from nearby API, trying fallback...');
          
          try {
            const fallbackResponse = await fetch('/api/shops?status=active&limit=200');
            const fallbackData = await fallbackResponse.json();
            
            if (fallbackData.shops && fallbackData.shops.length > 0) {
              console.log(`✅ NearShop: Found ${fallbackData.shops.length} shops (fallback)`);
              
              // Group by category
              const categoryMap = new Map<string, Shop>();
              for (const shop of fallbackData.shops) {
                const category = (shop.category || 'Uncategorized').trim();
                if (category && !categoryMap.has(category)) {
                  categoryMap.set(category, shop);
                }
              }
              
              const result = Array.from(categoryMap.entries())
                .map(([category, shop]) => ({ category, shop }))
                .slice(0, 20);
              
              setCategoryShops(result);
              setLoading(false);
              return;
            }
          } catch (fallbackError) {
            console.error('❌ NearShop: Fallback failed:', fallbackError);
          }
          
          setLoading(false);
          return;
        }

        console.log(`✅ NearShop: Found ${shopsData.shops.length} shops from API`);

        // Group shops by category - take closest shop from each category
        const categoryMap = new Map<string, Shop>();
        
        // Sort by distance (closest first), then by rating
        const sortedShops = [...shopsData.shops].sort((a, b) => {
          const distA = a.distance !== undefined ? a.distance : 999999;
          const distB = b.distance !== undefined ? b.distance : 999999;
          
          // Sort by distance first
          if (Math.abs(distA - distB) > 0.1) {
            return distA - distB;
          }
          
          // If distances are similar, sort by rating
          return (b.rating || 0) - (a.rating || 0);
        });

        // Take one shop from each unique category (closest one)
        for (const shop of sortedShops) {
          const category = (shop.category || 'Uncategorized').trim();
          
          if (!category) continue;
          
          // Add if we don't have this category yet, or replace if this shop is closer
          if (!categoryMap.has(category)) {
            categoryMap.set(category, shop);
          } else {
            const existingShop = categoryMap.get(category)!;
            const existingDist = existingShop.distance !== undefined ? existingShop.distance : 999999;
            const currentDist = shop.distance !== undefined ? shop.distance : 999999;
            
            // Replace if current shop is closer
            if (currentDist < existingDist) {
              categoryMap.set(category, shop);
            }
          }
        }

        // Convert to array, sort by distance, limit to 20
        // ⚡ Fix duplicate keys: Filter out duplicate shops by _id first
        const seenShopIds = new Set<string>();
        const uniqueShops = Array.from(categoryMap.entries())
          .map(([category, shop]) => ({ category, shop }))
          .filter(({ shop }) => {
            const shopId = shop._id || shop.place_id || '';
            if (shopId && seenShopIds.has(shopId)) {
              return false; // Skip duplicate
            }
            if (shopId) seenShopIds.add(shopId);
            return true;
          })
          .sort((a, b) => {
            const distA = a.shop.distance !== undefined ? a.shop.distance : 999999;
            const distB = b.shop.distance !== undefined ? b.shop.distance : 999999;
            return distA - distB;
          })
          .slice(0, 20);
        
        const result = uniqueShops;

        console.log(`✅ NearShop: Displaying ${result.length} shops from different categories:`, 
          result.map(item => `${item.category} (${item.shop.distance?.toFixed(1) || 'N/A'}km)`));
        
        setCategoryShops(result);
      } catch (error) {
        console.error('❌ NearShop: Error fetching shops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyShopsByCategory();
  }, [userLocation, searchQuery, categoryFilter]);

  return (
    <section className="py-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6"
        >
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiMapPin className="h-7 w-7 text-blue-500" />
              Near Shop
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {loading 
                ? 'Loading shops from different categories...'
                : categoryShops.length > 0
                ? searchQuery || categoryFilter
                  ? `Found ${categoryShops.length} shops from different categories${searchQuery ? ` matching "${searchQuery}"` : ''}${categoryFilter ? ` in ${categoryFilter}` : ''}`
                  : `Shops from ${categoryShops.length} different categories near you`
                : 'No shops found from different categories'}
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        ) : categoryShops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryShops.map((item, index) => {
              // ⚡ Fix duplicate keys: Create truly unique key
              const uniqueKey = item.shop._id 
                ? `nearshop-${item.shop._id}-${item.category}-${index}` 
                : `nearshop-${item.category}-${index}-${Date.now()}`;
              
              return (
              <motion.div
                key={uniqueKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onShopClick?.(item.shop)}
                className="cursor-pointer"
              >
                <div className="relative">
                  <ShopCard shop={item.shop} />
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 z-10 shadow-lg">
                    <FiShoppingBag className="h-3 w-3" />
                    <span>{item.category}</span>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No shops found from different categories. Try refreshing the page.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Check browser console for debugging information.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
