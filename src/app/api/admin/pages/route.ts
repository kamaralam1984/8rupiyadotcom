import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CustomPage from '@/models/CustomPage';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { UserRole } from '@/models/User';

// GET - Get all custom pages or a single page by ID (admin only)
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get('id');

    if (pageId) {
      // Get single page with all components
      const page = await CustomPage.findById(pageId);
      if (!page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }
      return NextResponse.json({ page });
    }

    // Get all pages (exclude large HTML content from list)
    const pages = await CustomPage.find()
      .sort({ createdAt: -1 })
      .select('-components.content.html');

    return NextResponse.json({ pages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

// POST - Create new custom page
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    
    // Generate slug from title if not provided
    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Check if slug already exists
    const existingPage = await CustomPage.findOne({ slug: body.slug });
    if (existingPage) {
      return NextResponse.json({ error: 'Page with this slug already exists' }, { status: 400 });
    }

    const page = await CustomPage.create({
      title: body.title,
      slug: body.slug,
      description: body.description,
      isPublished: body.isPublished || false,
      components: body.components || [],
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      seoKeywords: body.seoKeywords,
    });

    return NextResponse.json({ success: true, page }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Page with this slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

// PUT - Update custom page
export const PUT = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { pageId, ...updateData } = body;

    if (!pageId) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
    }

    // If slug is being updated, check for conflicts
    if (updateData.slug) {
      const existingPage = await CustomPage.findOne({ 
        slug: updateData.slug, 
        _id: { $ne: pageId } 
      });
      if (existingPage) {
        return NextResponse.json({ error: 'Page with this slug already exists' }, { status: 400 });
      }
    }

    const page = await CustomPage.findByIdAndUpdate(
      pageId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Page with this slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

// DELETE - Delete custom page
export const DELETE = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get('id');

    if (!pageId) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
    }

    const page = await CustomPage.findByIdAndDelete(pageId);

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Page deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

