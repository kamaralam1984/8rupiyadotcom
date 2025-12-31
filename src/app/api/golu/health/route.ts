import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MedicalRecord from '@/models/MedicalRecord';
import Reminder, { ReminderType, ReminderStatus } from '@/models/Reminder';
import { withAuth, AuthRequest } from '@/middleware/auth';

// POST /api/golu/health - Add health check (sugar, BP, weight, etc.)
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, value, notes, date } = await req.json();

    if (!type || !value) {
      return NextResponse.json(
        { error: 'Type and value are required' },
        { status: 400 }
      );
    }

    if (!['sugar', 'bp', 'weight', 'other'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be sugar, bp, weight, or other' },
        { status: 400 }
      );
    }

    // Get or create medical record
    let medicalRecord = await MedicalRecord.findOne({ userId });
    if (!medicalRecord) {
      medicalRecord = await MedicalRecord.create({
        userId,
        medicines: [],
        appointments: [],
        healthChecks: [],
      });
    }

    // Add health check
    medicalRecord.healthChecks.push({
      type,
      value,
      date: date ? new Date(date) : new Date(),
      notes,
    } as any);

    await medicalRecord.save();

    return NextResponse.json({
      success: true,
      message: 'Health check added successfully',
      healthCheck: medicalRecord.healthChecks[medicalRecord.healthChecks.length - 1],
    });
  } catch (error: any) {
    console.error('Error adding health check:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// GET /api/golu/health - Get health check history
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get('type'); // Optional filter by type

    const medicalRecord = await MedicalRecord.findOne({ userId });

    if (!medicalRecord) {
      return NextResponse.json({
        success: true,
        healthChecks: [],
      });
    }

    let healthChecks = medicalRecord.healthChecks || [];

    // Filter by type if provided
    if (type) {
      healthChecks = healthChecks.filter((hc: any) => hc.type === type);
    }

    // Sort by date (most recent first)
    healthChecks = healthChecks.sort((a: any, b: any) => b.date.getTime() - a.date.getTime());

    return NextResponse.json({
      success: true,
      healthChecks: healthChecks.map((hc: any) => ({
        id: hc._id,
        type: hc.type,
        value: hc.value,
        date: hc.date,
        notes: hc.notes,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching health checks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// POST /api/golu/health/reminder - Set health check reminder
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    // Extract user from auth
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { verifyToken } = await import('@/lib/auth');
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId;

    const { type, frequency, time, message } = await req.json();

    if (!type || !frequency || !time) {
      return NextResponse.json(
        { error: 'Type, frequency, and time are required' },
        { status: 400 }
      );
    }

    // Parse time (HH:MM format)
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, set for tomorrow
    if (scheduledTime <= new Date()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    // Create reminder
    let recurringPattern: any = undefined;
    if (frequency === 'daily') {
      recurringPattern = { frequency: 'daily' };
    } else if (frequency === 'weekly') {
      recurringPattern = { frequency: 'weekly' };
    }

    await Reminder.create({
      userId,
      type: ReminderType.APPOINTMENT,
      title: `🏥 Health Check: ${type.toUpperCase()}`,
      message: message || `${type.toUpperCase()} check karne ka time ho gaya hai`,
      scheduledTime,
      notifyBeforeMinutes: 10,
      isRecurring: frequency === 'daily' || frequency === 'weekly',
      recurringPattern,
      status: ReminderStatus.ACTIVE,
      metadata: {
        category: 'health-check',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Health check reminder set successfully',
    });
  } catch (error: any) {
    console.error('Error setting health check reminder:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

