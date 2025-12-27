import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import HeroSettings from '@/models/HeroSettings';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { UserRole } from '@/models/User';

// GET - Get hero settings
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();
    
    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let settings = await HeroSettings.findOne();
    if (!settings) {
      settings = await HeroSettings.create({});
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error fetching hero settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

// POST - Update hero settings
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();
    
    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    
    let settings = await HeroSettings.findOne();
    if (!settings) {
      settings = await HeroSettings.create(body);
    } else {
      Object.assign(settings, body);
      await settings.save();
    }

    return NextResponse.json({ success: true, message: 'Hero settings updated successfully', settings });
  } catch (error: any) {
    console.error('Error updating hero settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

