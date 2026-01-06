import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Shop, { ShopStatus } from '@/models/Shop';

// GET /api/categories - Get categories
// Query param: ?all=true - Get all active categories (for admin/agent panels)
// Default: Get only categories that have active/approved shops (for homepage filter)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const getAllCategories = searchParams.get('all') === 'true';

    // If all=true, return all active categories (for admin/agent panels)
    if (getAllCategories) {
      const categories = await Category.find({ isActive: true })
        .select('_id name slug description icon displayOrder')
        .sort({ displayOrder: 1, name: 1 })
        .lean(); // Use lean() for faster queries

      return NextResponse.json({
        success: true,
        categories: categories.map(cat => ({
          _id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          displayOrder: cat.displayOrder,
        })),
      });
    }

    // Default: Get only categories that have active/approved shops (for homepage filter)
    // First, get distinct categories from shops that have active/approved status
    const shopCategories = await Shop.distinct('category', {
      status: { $in: [ShopStatus.ACTIVE, ShopStatus.APPROVED] },
      category: { $exists: true, $ne: null, $nin: [null, ''] }
    });

    // If no shops found, return empty array
    if (!shopCategories || shopCategories.length === 0) {
      return NextResponse.json({
        success: true,
        categories: [],
      });
    }

    // Get category details from Category model for categories that have shops
    // Match by name (case-insensitive) since shops store category as string
    const categoryNames = shopCategories.map(cat => new RegExp(`^${cat}$`, 'i'));
    
    const categories = await Category.find({ 
      isActive: true,
      $or: [
        { name: { $in: categoryNames } },
        { slug: { $in: shopCategories.map(cat => cat.toLowerCase().replace(/\s+/g, '-')) } }
      ]
    })
      .select('_id name slug description icon displayOrder')
      .sort({ displayOrder: 1, name: 1 })
      .lean(); // Use lean() for faster queries

    // If category not found in Category model, create a simple category object from shop data
    const foundCategoryNames = categories.map(cat => cat.name.toLowerCase());
    const missingCategories = shopCategories
      .filter(cat => !foundCategoryNames.includes(cat.toLowerCase()))
      .map(cat => ({
        _id: null,
        name: cat,
        slug: cat.toLowerCase().replace(/\s+/g, '-'),
        description: '',
        icon: '',
        displayOrder: 999,
      }));

    // Combine found categories and missing categories
    const allCategories = [
      ...categories.map(cat => ({
        _id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        displayOrder: cat.displayOrder,
      })),
      ...missingCategories
    ].sort((a, b) => {
      // Sort by displayOrder first, then by name
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      success: true,
      categories: allCategories,
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

