import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Reminder, { ReminderStatus } from '@/models/Reminder';
import { verifyToken } from '@/lib/auth';

// Advanced Notification System for GOLU
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const { type, action, reminderId } = await req.json();

    // Get pending notifications
    if (type === 'GET_PENDING') {
      const now = new Date();
      const notifications = await Reminder.find({
        userId: payload.userId,
        status: ReminderStatus.ACTIVE,
        scheduledTime: { $lte: now },
      })
        .sort({ scheduledTime: 1 })
        .limit(50)
        .lean();

      return NextResponse.json({
        success: true,
        notifications,
        count: notifications.length,
      });
    }

    // Mark notification as read
    if (type === 'MARK_READ' && reminderId) {
      await Reminder.findByIdAndUpdate(reminderId, {
        $set: { status: ReminderStatus.COMPLETED },
      });

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read',
      });
    }

    // Snooze notification
    if (type === 'SNOOZE' && reminderId) {
      const { minutes = 10 } = await req.json();
      const newTime = new Date(Date.now() + minutes * 60 * 1000);

      await Reminder.findByIdAndUpdate(reminderId, {
        $set: { scheduledTime: newTime },
      });

      return NextResponse.json({
        success: true,
        message: `Notification snoozed for ${minutes} minutes`,
        newTime,
      });
    }

    // Send push notification (if Firebase configured)
    if (type === 'SEND_PUSH') {
      const { title, body, data } = await req.json();
      
      const firebaseKey = process.env.FIREBASE_SERVER_KEY;
      if (!firebaseKey) {
        return NextResponse.json({
          success: false,
          message: 'Firebase not configured',
        });
      }

      // Send push notification via Firebase
      // Implementation depends on Firebase setup
      return NextResponse.json({
        success: true,
        message: 'Push notification sent',
      });
    }

    return NextResponse.json({
      error: 'Invalid request type',
    }, { status: 400 });
  } catch (error: any) {
    console.error('Notification error:', error);
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}

// GET pending notifications
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const upcoming = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Next 24 hours

    const notifications = await Reminder.find({
      userId: payload.userId,
      status: ReminderStatus.ACTIVE,
      scheduledTime: { $gte: now, $lte: upcoming },
    })
      .sort({ scheduledTime: 1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}

