import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MedicalRecord from '@/models/MedicalRecord';
import { verifyToken } from '@/lib/auth';

// GET - Fetch medical records
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

    let medical = await MedicalRecord.findOne({ userId: decoded.userId });
    
    if (!medical) {
      medical = await MedicalRecord.create({
        userId: decoded.userId,
        medicines: [],
        appointments: [],
        healthChecks: [],
      });
    }

    return NextResponse.json({ success: true, medical });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical records' },
      { status: 500 }
    );
  }
}

// POST - Add/Update medical record
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
    const { action, data } = body;

    await connectDB();

    let medical = await MedicalRecord.findOne({ userId: decoded.userId });
    
    if (!medical) {
      medical = await MedicalRecord.create({
        userId: decoded.userId,
        medicines: [],
        appointments: [],
        healthChecks: [],
      });
    }

    switch (action) {
      case 'add_medicine':
        medical.medicines.push(data);
        break;
      case 'add_appointment':
        medical.appointments.push(data);
        break;
      case 'add_health_check':
        medical.healthChecks.push(data);
        break;
      case 'add_diet_reminder':
        if (!medical.dietReminders) medical.dietReminders = [];
        medical.dietReminders.push(data);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await medical.save();

    return NextResponse.json({ success: true, medical });
  } catch (error) {
    console.error('Error updating medical record:', error);
    return NextResponse.json(
      { error: 'Failed to update medical record' },
      { status: 500 }
    );
  }
}

