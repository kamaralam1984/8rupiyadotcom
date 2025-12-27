import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

// GET /api/admin/categories - Get all categories (admin only)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const categories = await Category.find({})
      .select('_id name slug description icon isActive displayOrder createdAt updatedAt')
      .sort({ displayOrder: 1, name: 1 });

    return NextResponse.json({
      success: true,
      categories: categories.map(cat => ({
        _id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        isActive: cat.isActive,
        displayOrder: cat.displayOrder,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/categories - Create new category (admin only)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, icon, displayOrder, isActive } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      $or: [
        { name: name.trim() },
        { slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
      ]
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 400 });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim(),
      icon: icon?.trim(),
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json({
      success: true,
      category: {
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        isActive: category.isActive,
        displayOrder: category.displayOrder,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    
    let errorMessage = error.message || 'Failed to create category';
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
      errorMessage = `Validation error: ${validationErrors.join(', ')}`;
    }
    if (error.code === 11000) {
      errorMessage = 'Category with this name or slug already exists';
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

