import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Visitor from '@/models/Visitor';

/**
 * POST /api/analytics/exit
 * Track page exit
 * Called via sendBeacon when user leaves page
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Parse request body (sendBeacon sends as string, not JSON)
    let data;
    try {
      const body = await req.text();
      if (!body || body.trim() === '') {
        return NextResponse.json({ success: false, error: 'Empty request body' }, { status: 400 });
      }
      data = JSON.parse(body);
    } catch (parseError) {
      // Silently fail for analytics - don't break user experience
      console.error('Failed to parse exit data:', parseError);
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    const { visitorId, sessionId, exitPage } = data;

    if (!visitorId || !sessionId || !exitPage) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update visitor's exit page (optional - for analytics)
    const visitor = await Visitor.findOne({ visitorId });
    if (visitor) {
      visitor.exitPage = exitPage;
      visitor.lastVisit = new Date(); // Update last visit time
      await visitor.save();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Analytics exit error:', error);
    // Don't fail - this is a background operation
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

