'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface Shop {
  _id?: string;
  name: string;
  shopName?: string;
  category: string;
  city: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  phone?: string;
  email?: string;
  website?: string;
  location?: {
    coordinates: [number, number];
  };
}

interface SEODynamicContentProps {
  shops: Shop[];
  city?: string;
  category?: string;
}

export default function SEODynamicContent({ shops, city = 'India', category }: SEODynamicContentProps) {
  const [structuredData, setStructuredData] = useState<any[]>([]);

  useEffect(() => {
    // Generate LocalBusiness schema for each shop
    const shopSchemas = shops.slice(0, 50).map((shop) => ({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: shop.name || shop.shopName,
      description: `Find ${shop.name || shop.shopName} - ${shop.category} in ${shop.city}, ${city}. Best ${shop.category} shop near you with ${shop.rating || 4.5} star rating.`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: shop.address,
        addressLocality: shop.city,
        addressRegion: city,
        addressCountry: 'IN',
      },
      ...(shop.phone && { telephone: shop.phone }),
      ...(shop.email && { email: shop.email }),
      ...(shop.website && { url: shop.website }),
      ...(shop.rating && shop.reviewCount && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: shop.rating,
          reviewCount: shop.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
      category: shop.category,
      ...(shop.location?.coordinates && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: shop.location.coordinates[1],
          longitude: shop.location.coordinates[0],
        },
      }),
    }));

    // Generate ItemList schema for shops
    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Best ${category || 'Shops'} in ${city}`,
      description: `Discover the best ${category || 'shops and businesses'} in ${city}. Find top-rated local businesses, shops, and services near you.`,
      numberOfItems: shops.length,
      itemListElement: shops.slice(0, 20).map((shop, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'LocalBusiness',
          name: shop.name || shop.shopName,
          category: shop.category,
          address: {
            '@type': 'PostalAddress',
            addressLocality: shop.city,
            addressCountry: 'IN',
          },
        },
      })),
    };

    setStructuredData([...shopSchemas, itemListSchema]);
  }, [shops, city, category]);

  // Generate keyword-rich content
  const topCategories = Array.from(new Set(shops.map(s => s.category))).slice(0, 10);
  const topCities = Array.from(new Set(shops.map(s => s.city))).slice(0, 10);
  
  const seoKeywords = [
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
    ...topCategories.map(cat => `${cat} near me`),
    ...topCities.map(c => `shops in ${c}`),
  ].join(', ');

  return (
    <>
      {/* Dynamic Structured Data for Shops */}
      {structuredData.map((schema, index) => (
        <Script
          key={index}
          id={`shop-schema-${index}`}
          type="application/ld+json"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}

      {/* SEO-Rich Hidden Content for Search Engines */}
      <div className="sr-only" aria-hidden="true">
        <h1>Find Best Shops and Businesses in {city} - 8rupiya.com</h1>
        <p>
          Discover {shops.length}+ local businesses, shops, and services in {city}. 
          Search for {topCategories.join(', ')} and more. 
          Find top-rated shops in {topCities.join(', ')} and other cities across India.
        </p>
        <h2>Popular Categories</h2>
        <ul>
          {topCategories.map((cat, i) => (
            <li key={i}>
              Find {cat} shops near you in {city}. Best {cat} businesses with ratings and reviews.
            </li>
          ))}
        </ul>
        <h2>Top Cities</h2>
        <ul>
          {topCities.map((c, i) => (
            <li key={i}>
              Discover shops and businesses in {c}. Find local {category || 'shops'} in {c} with 8rupiya.com.
            </li>
          ))}
        </ul>
        <p>
          Keywords: {seoKeywords}
        </p>
      </div>
    </>
  );
}
