'use client';

import { useMemo } from 'react';

interface Shop {
  name: string;
  shopName?: string;
  category: string;
  city: string;
  rating?: number;
}

interface SEOKeywordsSectionProps {
  shops: Shop[];
}

export default function SEOKeywordsSection({ shops }: SEOKeywordsSectionProps) {
  const seoContent = useMemo(() => {
    // Extract unique categories and cities
    const categories = Array.from(new Set(shops.map(s => s.category))).slice(0, 15);
    const cities = Array.from(new Set(shops.map(s => s.city))).slice(0, 15);
    
    // Generate keyword-rich content
    const categoryKeywords = categories.map(cat => 
      `${cat} near me, best ${cat} shop, ${cat} in India, top ${cat} businesses`
    ).join(', ');
    
    const cityKeywords = cities.map(city => 
      `shops in ${city}, businesses in ${city}, local shops ${city}, ${city} directory`
    ).join(', ');
    
    const generalKeywords = [
      'shops near me',
      'local businesses',
      'find shops',
      'business directory',
      'local shops',
      'nearby shops',
      'shop finder',
      'local business directory',
      'India shops',
      'business listings',
      'shop directory',
      'local services',
      'find businesses',
      'shop search',
      'business search',
      'best shops',
      'top rated shops',
      'shop reviews',
      'local business reviews',
    ].join(', ');

    return {
      categories,
      cities,
      allKeywords: `${generalKeywords}, ${categoryKeywords}, ${cityKeywords}`,
    };
  }, [shops]);

  return (
    <section className="py-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Find Best Shops and Businesses Near You - 8rupiya.com
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Discover {shops.length}+ local businesses, shops, and services in your area. 
            8rupiya.com is India's leading local business directory helping you find the best shops near you. 
            Search by category, location, or ratings to find top-rated businesses in your city.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
            Popular Categories - Find Shops Near You
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Explore our extensive directory of {seoContent.categories.length}+ categories including:{' '}
            {seoContent.categories.map((cat, i) => (
              <span key={i}>
                <strong>{cat}</strong>
                {i < seoContent.categories.length - 1 ? ', ' : ''}
              </span>
            ))}. 
            Each category features top-rated businesses with customer reviews, ratings, and contact information.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
            Top Cities - Local Business Directory
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Find shops and businesses in major cities across India including:{' '}
            {seoContent.cities.map((city, i) => (
              <span key={i}>
                <strong>shops in {city}</strong>
                {i < seoContent.cities.length - 1 ? ', ' : ''}
              </span>
            ))}. 
            Our directory covers thousands of local businesses helping you find exactly what you need.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
            Why Choose 8rupiya.com?
          </h3>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
            <li>Find shops near me with accurate location-based search</li>
            <li>Browse local businesses by category, rating, and reviews</li>
            <li>Get contact information, directions, and business hours</li>
            <li>Read customer reviews and ratings before visiting</li>
            <li>Discover new local businesses in your area</li>
            <li>Support local businesses and shop local</li>
          </ul>

          <p className="text-gray-700 dark:text-gray-300 mt-6">
            <strong>Keywords:</strong> {seoContent.allKeywords}
          </p>
        </div>
      </div>
    </section>
  );
}
