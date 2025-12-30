import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Reminder, { ReminderStatus } from '@/models/Reminder';
import { withAuth, AuthRequest } from '@/middleware/auth';

// GET /api/golu/reminders/check - Check for due reminders (for notification system)
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    const now = new Date();

    // Find reminders that are due (scheduled time has passed or within notification window)
    const dueReminders = await Reminder.find({
      userId: user.userId,
      status: ReminderStatus.ACTIVE,
      scheduledTime: { $lte: new Date(now.getTime() + 5 * 60 * 1000) }, // Due within 5 minutes
    })
      .sort({ scheduledTime: 1 })
      .limit(10)
      .lean();

    // Filter based on notifyBeforeMinutes
    const remindersToNotify = dueReminders.filter((reminder: any) => {
      const notifyTime = new Date(reminder.scheduledTime.getTime() - (reminder.notifyBeforeMinutes || 5) * 60 * 1000);
      return notifyTime <= now;
    });

    return NextResponse.json({
      success: true,
      reminders: remindersToNotify,
      count: remindersToNotify.length,
    });
  } catch (error: any) {
    console.error('Check reminders error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// POST /api/golu/reminders/check - Mark reminder as notified
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    const { reminderId, action } = await req.json();

    if (!reminderId) {
      return NextResponse.json({ error: 'Reminder ID required' }, { status: 400 });
    }

    const reminder = await Reminder.findOne({ _id: reminderId, userId: user.userId });

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    if (action === 'notified') {
      reminder.notifiedAt = new Date();
      reminder.status = ReminderStatus.COMPLETED;
    } else if (action === 'snooze') {
      reminder.status = ReminderStatus.SNOOZED;
      reminder.snoozedUntil = new Date(Date.now() + 10 * 60 * 1000); // Snooze for 10 minutes
      reminder.scheduledTime = new Date(Date.now() + 10 * 60 * 1000);
    }

    await reminder.save();

    return NextResponse.json({
      success: true,
      reminder,
    });
  } catch (error: any) {
    console.error('Update reminder status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

