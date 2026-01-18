import { Metadata } from 'next';

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  siteName?: string;
  locale?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

const defaultConfig = {
  siteName: '8rupiya.com',
  defaultTitle: '8rupiya.com - Find Nearby Shops & Businesses in India',
  defaultDescription: 'Discover local businesses, shops, and services near you. Browse by category, location, and ratings. Find the best shops in your city with 8rupiya.com - India\'s leading local business directory.',
  defaultKeywords: [
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
    'find local shops',
    'shop directory India',
    'business directory India',
    'local business finder',
    'nearby business directory',
    'shop listings',
    'business listings India',
    'local shop directory',
    'find shops by category',
    'shop ratings',
    'business ratings',
    'local business search',
    'shop locator',
    'business locator',
    'find shops in city',
    'local business directory India',
    'shop finder India',
    'business finder',
    'local services directory',
    'shop directory near me',
    'business directory near me',
    'local shops directory',
  ],
  defaultImage: '/og-image.jpg',
  defaultUrl: 'https://8rupiya.com',
  locale: 'en_IN',
};

export function generateMetadata(config: SEOConfig = {}): Metadata {
  const {
    title,
    description,
    keywords = [],
    image,
    url,
    type = 'website' as 'website' | 'article',
    siteName = defaultConfig.siteName,
    locale = defaultConfig.locale,
    author,
    publishedTime,
    modifiedTime,
    noindex = false,
    nofollow = false,
  } = config;

  const fullTitle = title
    ? `${title} | ${defaultConfig.siteName}`
    : defaultConfig.defaultTitle;

  const fullDescription = description || defaultConfig.defaultDescription;
  const fullKeywords = [...defaultConfig.defaultKeywords, ...keywords].join(', ');
  const fullImage = image || `${defaultConfig.defaultUrl}${defaultConfig.defaultImage}`;
  const fullUrl = url || defaultConfig.defaultUrl;

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: fullKeywords,
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale,
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
      creator: '@8rupiya',
      site: '@8rupiya',
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: fullUrl,
    },
    metadataBase: new URL(defaultConfig.defaultUrl),
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },
  };
}

export function generateLocalBusinessSchema(shop: {
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  image?: string;
  coordinates?: [number, number];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: shop.name,
    description: shop.description || `${shop.name} - ${shop.category || 'Business'} in ${shop.city}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: shop.address,
      addressLocality: shop.city,
      addressRegion: shop.state || '',
      postalCode: shop.pincode || '',
      addressCountry: 'IN',
    },
    ...(shop.phone && { telephone: shop.phone }),
    ...(shop.email && { email: shop.email }),
    ...(shop.website && { url: shop.website }),
    ...(shop.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: shop.rating,
        reviewCount: shop.reviewCount || 0,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(shop.category && { category: shop.category }),
    ...(shop.image && { image: shop.image }),
    ...(shop.coordinates && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: shop.coordinates[1],
        longitude: shop.coordinates[0],
      },
    }),
  };

  return schema;
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '8rupiya.com',
    url: 'https://8rupiya.com',
    logo: 'https://8rupiya.com/logo.png',
    description: 'India\'s leading local business directory. Find shops, businesses, and services near you.',
    sameAs: [
      // Add social media links here
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['English', 'Hindi'],
    },
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '8rupiya.com',
    url: 'https://8rupiya.com',
    description: 'Find nearby shops and businesses in India',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://8rupiya.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

