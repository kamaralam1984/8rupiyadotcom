import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Bug from '@/models/Bug';
import { BugStatus, BugPriority, BugSeverity, BugCategory } from '@/types/bug';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';

// GET - Fetch all bugs with filters
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

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const severity = searchParams.get('severity');
    const category = searchParams.get('category');
    const assignedTo = searchParams.get('assignedTo');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const query: any = {};

    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (severity) {
      query.severity = severity;
    }
    if (category) {
      query.category = category;
    }
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const bugs = await Bug.find(query)
      .populate('assignedTo', 'name email')
      .populate('reportedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('errorId', 'message errorType')
      .sort({ priority: 1, severity: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Bug.countDocuments(query);

    // Get bug stats
    const stats = {
      total: await Bug.countDocuments({}),
      byStatus: {
        [BugStatus.NEW]: await Bug.countDocuments({ status: BugStatus.NEW }),
        [BugStatus.ASSIGNED]: await Bug.countDocuments({ status: BugStatus.ASSIGNED }),
        [BugStatus.IN_PROGRESS]: await Bug.countDocuments({ status: BugStatus.IN_PROGRESS }),
        [BugStatus.TESTING]: await Bug.countDocuments({ status: BugStatus.TESTING }),
        [BugStatus.FIXED]: await Bug.countDocuments({ status: BugStatus.FIXED }),
        [BugStatus.CLOSED]: await Bug.countDocuments({ status: BugStatus.CLOSED }),
        [BugStatus.REOPENED]: await Bug.countDocuments({ status: BugStatus.REOPENED }),
        [BugStatus.IGNORED]: await Bug.countDocuments({ status: BugStatus.IGNORED }),
      },
      byPriority: {
        [BugPriority.LOW]: await Bug.countDocuments({ priority: BugPriority.LOW }),
        [BugPriority.MEDIUM]: await Bug.countDocuments({ priority: BugPriority.MEDIUM }),
        [BugPriority.HIGH]: await Bug.countDocuments({ priority: BugPriority.HIGH }),
        [BugPriority.CRITICAL]: await Bug.countDocuments({ priority: BugPriority.CRITICAL }),
      },
      bySeverity: {
        [BugSeverity.MINOR]: await Bug.countDocuments({ severity: BugSeverity.MINOR }),
        [BugSeverity.MODERATE]: await Bug.countDocuments({ severity: BugSeverity.MODERATE }),
        [BugSeverity.MAJOR]: await Bug.countDocuments({ severity: BugSeverity.MAJOR }),
        [BugSeverity.SEVERE]: await Bug.countDocuments({ severity: BugSeverity.SEVERE }),
      },
      byCategory: {
        [BugCategory.UI_UX]: await Bug.countDocuments({ category: BugCategory.UI_UX }),
        [BugCategory.FUNCTIONALITY]: await Bug.countDocuments({ category: BugCategory.FUNCTIONALITY }),
        [BugCategory.PERFORMANCE]: await Bug.countDocuments({ category: BugCategory.PERFORMANCE }),
        [BugCategory.SECURITY]: await Bug.countDocuments({ category: BugCategory.SECURITY }),
        [BugCategory.DATA]: await Bug.countDocuments({ category: BugCategory.DATA }),
        [BugCategory.API]: await Bug.countDocuments({ category: BugCategory.API }),
        [BugCategory.INTEGRATION]: await Bug.countDocuments({ category: BugCategory.INTEGRATION }),
        [BugCategory.OTHER]: await Bug.countDocuments({ category: BugCategory.OTHER }),
      },
      recent: await Bug.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      fixed: await Bug.countDocuments({
        status: BugStatus.FIXED,
        resolvedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    };

    // Calculate average resolution time
    const fixedBugs = await Bug.find({
      status: BugStatus.FIXED,
      resolvedAt: { $exists: true },
      createdAt: { $exists: true },
    })
      .select('createdAt resolvedAt')
      .lean();

    let totalResolutionTime = 0;
    let count = 0;
    fixedBugs.forEach((bug: any) => {
      if (bug.createdAt && bug.resolvedAt) {
        const hours = (new Date(bug.resolvedAt).getTime() - new Date(bug.createdAt).getTime()) / (1000 * 60 * 60);
        totalResolutionTime += hours;
        count++;
      }
    });

    const avgResolutionTime = count > 0 ? totalResolutionTime / count : 0;

    return NextResponse.json({
      bugs,
      stats: {
        ...stats,
        avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching bugs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bugs', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new bug
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
      title,
      description,
      priority = BugPriority.MEDIUM,
      severity = BugSeverity.MODERATE,
      category,
      errorId,
      assignedTo,
      tags = [],
      stepsToReproduce = [],
      expectedBehavior,
      actualBehavior,
      environment,
      browser,
      device,
      screenshots = [],
      relatedBugs = [],
      metadata = {},
    } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    const bug = new Bug({
      title,
      description,
      priority,
      severity,
      category,
      status: BugStatus.NEW,
      errorId,
      assignedTo,
      reportedBy: payload.userId,
      tags,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      environment,
      browser,
      device,
      screenshots,
      relatedBugs,
      metadata,
    });

    await bug.save();

    return NextResponse.json({
      success: true,
      bug: await Bug.findById(bug._id)
        .populate('assignedTo', 'name email')
        .populate('reportedBy', 'name email')
        .populate('errorId', 'message errorType')
        .lean(),
    });
  } catch (error: any) {
    console.error('Error creating bug:', error);
    return NextResponse.json(
      { error: 'Failed to create bug', details: error.message },
      { status: 500 }
    );
  }
}

