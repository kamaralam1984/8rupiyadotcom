import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import HeroSettings from '@/models/HeroSettings';

// GET - Get public hero settings (for frontend)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    let settings = await HeroSettings.findOne();
    if (!settings) {
      // Return default settings if none exist
      settings = {
        backgroundImage: '',
        centerEffect: 'card',
        leftEffect: '3d',
        rightEffect: 'glass',
        rotationSpeed: 5000,
        animationSpeed: 0.5,
        transitionDuration: 0.5,
        primaryColor: '#3B82F6',
        secondaryColor: '#8B5CF6',
        accentColor: '#EC4899',
        showLeftShop: true,
        showRightShop: true,
        showSearchBar: true,
      };
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error fetching hero settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

