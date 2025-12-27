import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import HomepageLayout from '@/models/HomepageLayout';

// GET - Get active homepage layout (public)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    let layout = await HomepageLayout.findOne({ isActive: true });
    
    // If no active layout, get default
    if (!layout) {
      layout = await HomepageLayout.findOne({ isDefault: true });
    }
    
    // If still no layout, create default
    if (!layout) {
      layout = await HomepageLayout.create({
        name: 'Default',
        isActive: true,
        isDefault: true,
      });
    }

    return NextResponse.json({ success: true, layout });
  } catch (error: any) {
    console.error('Error fetching homepage layout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

