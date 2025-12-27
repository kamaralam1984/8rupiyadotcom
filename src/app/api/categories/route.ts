import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

// GET /api/categories - Get all active categories
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const categories = await Category.find({ isActive: true })
      .select('_id name slug description icon displayOrder')
      .sort({ displayOrder: 1, name: 1 });

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
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

