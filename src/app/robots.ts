import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/agent/',
          '/operator/',
          '/accountant/',
          '/user/',
          '/login',
          '/register',
          '/forgot-password',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/agent/',
          '/operator/',
          '/accountant/',
          '/user/',
        ],
      },
    ],
    sitemap: 'https://8rupiya.com/sitemap.xml',
  };
}

