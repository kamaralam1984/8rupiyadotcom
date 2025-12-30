import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Reminder, { ReminderStatus } from '@/models/Reminder';
import { withAuth, AuthRequest } from '@/middleware/auth';

// GET /api/golu/reminders - Get user's reminders
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || ReminderStatus.ACTIVE;
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');

    const query: any = { userId: user.userId };
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }

    const reminders = await Reminder.find(query)
      .sort({ scheduledTime: 1 })
      .limit(limit)
      .lean();

    // Get pending reminders (due soon)
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const pendingReminders = await Reminder.countDocuments({
      userId: user.userId,
      status: ReminderStatus.ACTIVE,
      scheduledTime: { $gte: now, $lte: next24Hours },
    });

    return NextResponse.json({
      success: true,
      reminders,
      count: reminders.length,
      pendingIn24Hours: pendingReminders,
    });
  } catch (error: any) {
    console.error('Get reminders error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// POST /api/golu/reminders - Create reminder manually
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    const { type, title, message, scheduledTime, notifyBeforeMinutes, isRecurring, recurringPattern, metadata } = await req.json();

    if (!title || !message || !scheduledTime) {
      return NextResponse.json({ error: 'Title, message, and scheduledTime required' }, { status: 400 });
    }

    const reminder = await Reminder.create({
      userId: user.userId,
      type,
      title,
      message,
      scheduledTime: new Date(scheduledTime),
      notifyBeforeMinutes,
      isRecurring,
      recurringPattern,
      metadata,
      status: ReminderStatus.ACTIVE,
    });

    return NextResponse.json({
      success: true,
      reminder,
    });
  } catch (error: any) {
    console.error('Create reminder error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// PUT /api/golu/reminders/:id - Update reminder
export const PUT = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Reminder ID required' }, { status: 400 });
    }

    const { status, snoozedUntil, scheduledTime } = await req.json();

    const reminder = await Reminder.findOne({ _id: id, userId: user.userId });

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    if (status) reminder.status = status;
    if (snoozedUntil) reminder.snoozedUntil = new Date(snoozedUntil);
    if (scheduledTime) reminder.scheduledTime = new Date(scheduledTime);

    await reminder.save();

    return NextResponse.json({
      success: true,
      reminder,
    });
  } catch (error: any) {
    console.error('Update reminder error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// DELETE /api/golu/reminders/:id - Delete reminder
export const DELETE = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Reminder ID required' }, { status: 400 });
    }

    const reminder = await Reminder.findOneAndDelete({ _id: id, userId: user.userId });

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Reminder deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete reminder error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

