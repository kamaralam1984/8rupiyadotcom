import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import HomepageLayout from '@/models/HomepageLayout';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { UserRole } from '@/models/User';

// GET - Get all homepage layouts
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();
    
    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const layouts = await HomepageLayout.find().sort({ createdAt: -1 });
    const activeLayout = await HomepageLayout.findOne({ isActive: true });

    return NextResponse.json({ 
      success: true, 
      layouts,
      activeLayout: activeLayout || layouts[0] || null
    });
  } catch (error: any) {
    console.error('Error fetching homepage layouts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

// POST - Create new homepage layout (duplicate or new)
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();
    
    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action, sourceLayoutId, name } = body;

    // Duplicate existing layout
    if (action === 'duplicate' && sourceLayoutId) {
      const sourceLayout = await HomepageLayout.findById(sourceLayoutId);
      if (!sourceLayout) {
        return NextResponse.json({ error: 'Source layout not found' }, { status: 404 });
      }

      const newLayout = await HomepageLayout.create({
        name: name || `${sourceLayout.name} (Copy)`,
        isActive: false, // Duplicated layouts start as inactive
        isDefault: false,
        sections: sourceLayout.sections,
        heroSettingsId: sourceLayout.heroSettingsId,
      });

      return NextResponse.json({ success: true, layout: newLayout });
    }

    // Create new layout
    const layout = await HomepageLayout.create(body);
    return NextResponse.json({ success: true, layout }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating homepage layout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

// PUT - Update homepage layout
export const PUT = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();
    
    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { layoutId, sections, isActive, name } = body;

    // If activating a layout, deactivate all others
    if (isActive) {
      await HomepageLayout.updateMany(
        { _id: { $ne: layoutId } },
        { isActive: false }
      );
    }

    const layout = await HomepageLayout.findByIdAndUpdate(
      layoutId,
      { 
        ...(sections && { sections }),
        ...(isActive !== undefined && { isActive }),
        ...(name && { name }),
      },
      { new: true }
    );

    if (!layout) {
      return NextResponse.json({ error: 'Layout not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, layout });
  } catch (error: any) {
    console.error('Error updating homepage layout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

// DELETE - Delete homepage layout
export const DELETE = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();
    
    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const layoutId = searchParams.get('id');

    if (!layoutId) {
      return NextResponse.json({ error: 'Layout ID required' }, { status: 400 });
    }

    const layout = await HomepageLayout.findById(layoutId);
    if (!layout) {
      return NextResponse.json({ error: 'Layout not found' }, { status: 404 });
    }

    if (layout.isDefault) {
      return NextResponse.json({ error: 'Cannot delete default layout' }, { status: 400 });
    }

    await HomepageLayout.findByIdAndDelete(layoutId);

    return NextResponse.json({ success: true, message: 'Layout deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting homepage layout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

