import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Bug from '@/models/Bug';
import { BugStatus } from '@/types/bug';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';

// GET - Fetch a single bug
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
    const bug = await Bug.findById(id)
      .populate('assignedTo', 'name email')
      .populate('reportedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('errorId', 'message errorType stack')
      .populate('relatedBugs', 'title status priority')
      .populate('preventionRules', 'name description')
      .lean();

    if (!bug) {
      return NextResponse.json({ error: 'Bug not found' }, { status: 404 });
    }

    return NextResponse.json({ bug });
  } catch (error: any) {
    console.error('Error fetching bug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bug', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a bug
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
      'title',
      'description',
      'priority',
      'severity',
      'status',
      'category',
      'assignedTo',
      'tags',
      'stepsToReproduce',
      'expectedBehavior',
      'actualBehavior',
      'environment',
      'browser',
      'device',
      'screenshots',
      'relatedBugs',
      'preventionRules',
      'fixDetails',
      'fixCode',
      'testResults',
      'metadata',
    ];

    const updateData: any = {};
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Handle status changes
    if (body.status === BugStatus.FIXED || body.status === BugStatus.CLOSED) {
      if (!updateData.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
      if (!updateData.resolvedBy) {
        updateData.resolvedBy = payload.userId;
      }
    }

    const bug = await Bug.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('reportedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('errorId', 'message errorType')
      .lean();

    if (!bug) {
      return NextResponse.json({ error: 'Bug not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, bug });
  } catch (error: any) {
    console.error('Error updating bug:', error);
    return NextResponse.json(
      { error: 'Failed to update bug', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a bug
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
    const bug = await Bug.findByIdAndDelete(id);

    if (!bug) {
      return NextResponse.json({ error: 'Bug not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Bug deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting bug:', error);
    return NextResponse.json(
      { error: 'Failed to delete bug', details: error.message },
      { status: 500 }
    );
  }
}

