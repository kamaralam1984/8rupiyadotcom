import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Visitor from '@/models/Visitor';
import PageView from '@/models/PageView';
import User from '@/models/User';
import { getClientIP, getLocationFromIPAlternative } from '@/lib/geolocation';
import { verifyToken } from '@/lib/auth';
import crypto from 'crypto';

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

    // Get IP address
    const clientIP = getClientIP(req.headers);
    const ipHash = crypto.createHash('sha256').update(clientIP).digest('hex');

    // Get location from IP
    const location = await getLocationFromIPAlternative(clientIP);

    // Check if user is logged in
    let userId = null;
    let userName = null;
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;
    
    if (token) {
      try {
        const payload = verifyToken(token);
        if (payload && payload.userId) {
          userId = payload.userId;
          // Get user name from database
          const user = await User.findById(payload.userId).select('name');
          if (user) {
            userName = user.name;
          }
        }
      } catch (err) {
        // Token invalid, continue as anonymous
      }
    }

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
        userId: userId || undefined,
        deviceType,
        browser,
        os,
        screenResolution,
        ipAddress: ipHash, // Store hashed IP for privacy
        country: location.country,
        state: location.state,
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude,
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
      
      // Update userId if user just logged in
      if (userId && !visitor.userId) {
        visitor.userId = userId;
      }
      
      // Update location if not set or changed
      if (!visitor.country || visitor.country === 'Unknown') {
        visitor.country = location.country;
        visitor.state = location.state;
        visitor.city = location.city;
        visitor.latitude = location.latitude;
        visitor.longitude = location.longitude;
      }
      
      if (!visitor.pagesVisited.includes(path)) {
        visitor.pagesVisited.push(path);
      }
      
      await visitor.save();
    }

    // Create page view record
    await PageView.create({
      visitorId,
      userId: userId || undefined,
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

