import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PageView from '@/models/PageView';

/**
 * POST /api/analytics/timespent
 * Track time spent on a page
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
      console.error('Failed to parse timespent data:', parseError);
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    const { visitorId, sessionId, path, timeSpent } = data;

    if (!visitorId || !sessionId || !path || !timeSpent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the most recent page view for this session with time spent
    const pageView = await PageView.findOne({
      visitorId,
      sessionId,
      path,
    }).sort({ timestamp: -1 });

    if (pageView) {
      pageView.timeSpent = timeSpent;
      await pageView.save();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Analytics timespent error:', error);
    // Don't fail - this is a background operation
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

