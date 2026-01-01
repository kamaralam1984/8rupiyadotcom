import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Visitor from '@/models/Visitor';
import PageView from '@/models/PageView';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const data = await req.json();
    const {
      visitorId,
      sessionId,
      path,
      title,
      referrer,
      deviceType,
      browser,
      os,
      screenResolution,
      utmSource,
      utmMedium,
      utmCampaign,
    } = data;

    if (!visitorId || !sessionId || !path) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find or create visitor
    let visitor = await Visitor.findOne({ visitorId });

    if (!visitor) {
      // New visitor
      visitor = await Visitor.create({
        visitorId,
        deviceType,
        browser,
        os,
        screenResolution,
        firstVisit: new Date(),
        lastVisit: new Date(),
        totalVisits: 1,
        pagesVisited: [path],
        entryPage: path,
        utmSource,
        utmMedium,
        utmCampaign,
        referrer,
      });
    } else {
      // Existing visitor - update stats
      visitor.lastVisit = new Date();
      visitor.totalVisits += 1;
      
      if (!visitor.pagesVisited.includes(path)) {
        visitor.pagesVisited.push(path);
      }
      
      await visitor.save();
    }

    // Create page view record
    await PageView.create({
      visitorId,
      sessionId,
      path,
      title,
      referrer,
      deviceType,
      country: visitor.country,
      city: visitor.city,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Analytics pageview error:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}

