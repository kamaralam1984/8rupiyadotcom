import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BugPreventionRule from '@/models/BugPreventionRule';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';

// GET - Fetch all prevention rules
export async function GET(req: NextRequest) {
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

    const enabled = req.nextUrl.searchParams.get('enabled');
    const category = req.nextUrl.searchParams.get('category');

    const query: any = {};
    if (enabled !== null) {
      query.enabled = enabled === 'true';
    }
    if (category) {
      query.category = category;
    }

    const rules = await BugPreventionRule.find(query)
      .sort({ category: 1, priority: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ rules });
  } catch (error: any) {
    console.error('Error fetching prevention rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prevention rules', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new prevention rule
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const {
      name,
      description,
      pattern,
      category,
      priority,
      action = 'warn',
      enabled = true,
      conditions = {},
      preventionCode,
      examples = [],
    } = body;

    if (!name || !description || !pattern || !category) {
      return NextResponse.json(
        { error: 'Name, description, pattern, and category are required' },
        { status: 400 }
      );
    }

    const rule = new BugPreventionRule({
      name,
      description,
      pattern,
      category,
      priority,
      action,
      enabled,
      conditions,
      preventionCode,
      examples,
    });

    await rule.save();

    return NextResponse.json({ success: true, rule });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A rule with this name already exists' },
        { status: 400 }
      );
    }
    console.error('Error creating prevention rule:', error);
    return NextResponse.json(
      { error: 'Failed to create prevention rule', details: error.message },
      { status: 500 }
    );
  }
}

