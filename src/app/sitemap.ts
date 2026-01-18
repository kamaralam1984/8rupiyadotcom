import { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import CustomPage from '@/models/CustomPage';
import Category from '@/models/Category';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  const baseUrl = 'https://8rupiya.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/list-your-business`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Dynamic shop pages
  let shopPages: MetadataRoute.Sitemap = [];
  try {
    const shops = await Shop.find({ status: 'approved' })
      .select('_id updatedAt')
      .lean()
      .limit(10000); // Limit to prevent memory issues

    shopPages = shops.map((shop: any) => ({
      url: `${baseUrl}/shop/${shop._id}`,
      lastModified: shop.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching shops for sitemap:', error);
  }

  // Custom pages
  let customPages: MetadataRoute.Sitemap = [];
  try {
    const pages = await CustomPage.find({ isPublished: true })
      .select('slug updatedAt')
      .lean();

    customPages = pages.map((page: any) => ({
      url: `${baseUrl}/pages/${page.slug}`,
      lastModified: page.updatedAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error fetching custom pages for sitemap:', error);
  }

  // Category pages
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await Category.find({ isActive: true })
      .select('slug updatedAt')
      .lean();

    categoryPages = categories.map((category: any) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: category.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching category pages for sitemap:', error);
  }

  return [...staticPages, ...categoryPages, ...shopPages, ...customPages];
}

