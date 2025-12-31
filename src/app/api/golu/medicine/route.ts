import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MedicalRecord from '@/models/MedicalRecord';
import Reminder, { ReminderType, ReminderStatus } from '@/models/Reminder';
import { withAuth, AuthRequest } from '@/middleware/auth';

// GET /api/golu/medicine - Get user's medicine schedule
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const medicalRecord = await MedicalRecord.findOne({ userId });

    if (!medicalRecord) {
      return NextResponse.json({
        success: true,
        medicines: [],
        appointments: [],
        healthChecks: [],
      });
    }

    // Get active medicine reminders
    const reminders = await Reminder.find({
      userId,
      type: ReminderType.MEDICINE,
      status: ReminderStatus.ACTIVE,
    }).sort({ scheduledTime: 1 });

    return NextResponse.json({
      success: true,
      medicines: medicalRecord.medicines || [],
      appointments: medicalRecord.appointments || [],
      healthChecks: medicalRecord.healthChecks || [],
      reminders: reminders.map(r => ({
        id: r._id,
        medicine: r.metadata?.medicineName,
        time: r.scheduledTime,
        isRecurring: r.isRecurring,
        frequency: r.recurringPattern?.frequency,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching medicine schedule:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// POST /api/golu/medicine - Add new medicine
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, dosage, frequency, timings, withFood, startDate, endDate, reminderEnabled } = await req.json();

    if (!name || !dosage || !frequency || !timings || timings.length === 0) {
      return NextResponse.json(
        { error: 'Medicine name, dosage, frequency, and timings are required' },
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

    // Add medicine
    medicalRecord.medicines.push({
      name,
      dosage,
      frequency,
      timings,
      withFood: withFood || false,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      reminderEnabled: reminderEnabled !== false,
    } as any);

    await medicalRecord.save();

    // Create reminders for each timing
    if (reminderEnabled !== false) {
      for (const timing of timings) {
        const [hours, minutes] = timing.split(':').map(Number);
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);

        // If time has passed today, set for tomorrow
        if (scheduledTime <= new Date()) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        let recurringPattern: any = undefined;
        if (frequency === 'daily') {
          recurringPattern = { frequency: 'daily' };
        } else if (frequency === 'weekly') {
          recurringPattern = { frequency: 'weekly' };
        }

        await Reminder.create({
          userId,
          type: ReminderType.MEDICINE,
          title: `💊 Medicine: ${name}`,
          message: `${name} lene ka time ho gaya hai (${dosage})${withFood ? ' - Khane ke baad lena hai' : ''}`,
          scheduledTime,
          notifyBeforeMinutes: 5,
          isRecurring: frequency === 'daily' || frequency === 'weekly',
          recurringPattern,
          status: ReminderStatus.ACTIVE,
          metadata: {
            medicineName: name,
            dosage,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Medicine added successfully',
      medicine: medicalRecord.medicines[medicalRecord.medicines.length - 1],
    });
  } catch (error: any) {
    console.error('Error adding medicine:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// DELETE /api/golu/medicine/:id - Remove medicine
export async function DELETE(req: NextRequest) {
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

    // Get medicine ID from URL
    const url = new URL(req.url);
    const medicineId = url.searchParams.get('id');

    if (!medicineId) {
      return NextResponse.json({ error: 'Medicine ID required' }, { status: 400 });
    }

    const medicalRecord = await MedicalRecord.findOne({ userId });
    if (!medicalRecord) {
      return NextResponse.json({ error: 'Medical record not found' }, { status: 404 });
    }

    // Remove medicine
    medicalRecord.medicines = medicalRecord.medicines.filter((m: any) => m._id.toString() !== medicineId);
    await medicalRecord.save();

    // Cancel associated reminders
    await Reminder.updateMany(
      {
        userId,
        type: ReminderType.MEDICINE,
        'metadata.medicineName': medicalRecord.medicines.find((m: any) => m._id.toString() === medicineId)?.name,
      },
      { status: ReminderStatus.CANCELLED }
    );

    return NextResponse.json({
      success: true,
      message: 'Medicine removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing medicine:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

