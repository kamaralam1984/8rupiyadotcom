import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import JyotishPandit from '@/models/JyotishPandit';

// PUT /api/admin/jyotish/pandits/[id] - Update pandit
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const pandit = await JyotishPandit.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!pandit) {
      return NextResponse.json({ error: 'Pandit not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Pandit updated successfully',
      pandit,
    });
  } catch (error: any) {
    console.error('Error updating pandit:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/jyotish/pandits/[id] - Delete pandit
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    
    const pandit = await JyotishPandit.findByIdAndDelete(id);

    if (!pandit) {
      return NextResponse.json({ error: 'Pandit not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Pandit deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting pandit:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


