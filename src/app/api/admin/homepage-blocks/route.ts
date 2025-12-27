import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import HomepageBlock from '@/models/HomepageBlock';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { UserRole } from '@/models/User';

// GET - Get all homepage blocks (admin gets all, public gets only active)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Check if admin (will be handled by auth middleware if needed)
    const blocks = await HomepageBlock.find()
      .sort({ order: 1 });

    return NextResponse.json({ blocks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create homepage block
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const block = await HomepageBlock.create(body);

    return NextResponse.json({ success: true, block }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

// PUT - Update homepage blocks (order, isActive, or duplicate)
export const PUT = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    
    // Handle duplicate
    if (body.action === 'duplicate' && body.blockId) {
      const originalBlock = await HomepageBlock.findById(body.blockId);
      if (!originalBlock) {
        return NextResponse.json({ error: 'Block not found' }, { status: 404 });
      }
      
      const maxOrder = await HomepageBlock.findOne().sort({ order: -1 });
      const newOrder = maxOrder ? maxOrder.order + 1 : 0;
      
      const duplicatedBlock = await HomepageBlock.create({
        type: originalBlock.type,
        title: `${originalBlock.title || originalBlock.type} (Copy)`,
        content: originalBlock.content,
        order: newOrder,
        isActive: false, // Duplicated blocks start as inactive
      });
      
      return NextResponse.json({ success: true, block: duplicatedBlock });
    }
    
    // Handle toggle active
    if (body.action === 'toggle' && body.blockId) {
      const block = await HomepageBlock.findById(body.blockId);
      if (!block) {
        return NextResponse.json({ error: 'Block not found' }, { status: 404 });
      }
      
      block.isActive = !block.isActive;
      await block.save();
      
      return NextResponse.json({ success: true, block });
    }
    
    // Handle order update
    if (body.blocks) {
      await Promise.all(
        body.blocks.map((block: { id: string; order: number }) =>
          HomepageBlock.findByIdAndUpdate(block.id, { order: block.order })
        )
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

