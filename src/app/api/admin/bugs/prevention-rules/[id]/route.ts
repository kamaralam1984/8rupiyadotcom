import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BugPreventionRule from '@/models/BugPreventionRule';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';

// GET - Fetch a single prevention rule
export async function GET(
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const rule = await BugPreventionRule.findById(id).lean();

    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    return NextResponse.json({ rule });
  } catch (error: any) {
    console.error('Error fetching prevention rule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rule', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a prevention rule
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const body = await req.json();
    const allowedFields = [
      'name',
      'description',
      'pattern',
      'category',
      'priority',
      'action',
      'enabled',
      'conditions',
      'preventionCode',
      'examples',
    ];

    const updateData: any = {};
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const rule = await BugPreventionRule.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, rule });
  } catch (error: any) {
    console.error('Error updating prevention rule:', error);
    return NextResponse.json(
      { error: 'Failed to update rule', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a prevention rule
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const rule = await BugPreventionRule.findByIdAndDelete(id);

    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Rule deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting prevention rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete rule', details: error.message },
      { status: 500 }
    );
  }
}

