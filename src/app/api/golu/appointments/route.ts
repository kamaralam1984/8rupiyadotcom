import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MedicalRecord from '@/models/MedicalRecord';
import Reminder, { ReminderType, ReminderStatus } from '@/models/Reminder';
import { withAuth, AuthRequest } from '@/middleware/auth';

// GET /api/golu/appointments - Get doctor appointments
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status'); // scheduled, completed, cancelled

    const medicalRecord = await MedicalRecord.findOne({ userId });

    if (!medicalRecord) {
      return NextResponse.json({
        success: true,
        appointments: [],
      });
    }

    let appointments = medicalRecord.appointments || [];

    // Filter by status if provided
    if (status) {
      appointments = appointments.filter((apt: any) => apt.status === status);
    }

    // Sort by date (most recent first)
    appointments = appointments.sort((a: any, b: any) => b.appointmentDate.getTime() - a.appointmentDate.getTime());

    return NextResponse.json({
      success: true,
      appointments: appointments.map((apt: any) => ({
        id: apt._id,
        doctorName: apt.doctorName,
        specialization: apt.specialization,
        appointmentDate: apt.appointmentDate,
        location: apt.location,
        phone: apt.phone,
        notes: apt.notes,
        status: apt.status,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// POST /api/golu/appointments - Add doctor appointment
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const userId = req.user?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { doctorName, specialization, appointmentDate, location, phone, notes, notifyBeforeMinutes } = await req.json();

    if (!doctorName || !appointmentDate) {
      return NextResponse.json(
        { error: 'Doctor name and appointment date are required' },
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

    // Add appointment
    medicalRecord.appointments.push({
      doctorName,
      specialization: specialization || 'General',
      appointmentDate: new Date(appointmentDate),
      location: location || '',
      phone: phone || '',
      notes: notes || '',
      status: 'scheduled',
    } as any);

    await medicalRecord.save();

    // Create reminder
    const scheduledTime = new Date(appointmentDate);
    const notifyMinutes = notifyBeforeMinutes || 60; // Default 1 hour before

    await Reminder.create({
      userId,
      type: ReminderType.APPOINTMENT,
      title: `👨‍⚕️ Doctor Appointment: Dr. ${doctorName}`,
      message: `Aapka doctor appointment hai Dr. ${doctorName} ke saath${location ? ` at ${location}` : ''}`,
      scheduledTime,
      notifyBeforeMinutes: notifyMinutes,
      isRecurring: false,
      status: ReminderStatus.ACTIVE,
      metadata: {
        location,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Doctor appointment added successfully',
      appointment: medicalRecord.appointments[medicalRecord.appointments.length - 1],
    });
  } catch (error: any) {
    console.error('Error adding appointment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// PATCH /api/golu/appointments/:id - Update appointment status
export async function PATCH(req: NextRequest) {
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

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Appointment ID and status required' }, { status: 400 });
    }

    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const medicalRecord = await MedicalRecord.findOne({ userId });
    if (!medicalRecord) {
      return NextResponse.json({ error: 'Medical record not found' }, { status: 404 });
    }

    // Update appointment status
    const appointment = medicalRecord.appointments.find((a: any) => a._id.toString() === id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    (appointment as any).status = status;
    await medicalRecord.save();

    // Cancel reminder if appointment is cancelled
    if (status === 'cancelled') {
      await Reminder.updateMany(
        {
          userId,
          type: ReminderType.APPOINTMENT,
          title: { $regex: appointment.doctorName, $options: 'i' },
        },
        { status: ReminderStatus.CANCELLED }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment,
    });
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

