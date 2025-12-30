import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FamilyMember from '@/models/FamilyMember';
import { verifyToken } from '@/lib/auth';

// GET - Fetch family members
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const family = await FamilyMember.find({ userId: decoded.userId });

    return NextResponse.json({ success: true, family });
  } catch (error) {
    console.error('Error fetching family members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family members' },
      { status: 500 }
    );
  }
}

// POST - Add family member
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    const familyMember = await FamilyMember.create({
      userId: decoded.userId,
      ...body,
    });

    return NextResponse.json({ success: true, familyMember });
  } catch (error) {
    console.error('Error adding family member:', error);
    return NextResponse.json(
      { error: 'Failed to add family member' },
      { status: 500 }
    );
  }
}

