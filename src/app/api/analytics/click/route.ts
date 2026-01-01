import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ClickEvent from '@/models/ClickEvent';
import ShopAnalytics from '@/models/ShopAnalytics';
import Visitor from '@/models/Visitor';
import { ClickType } from '@/models/ClickEvent';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const data = await req.json();
    const {
      visitorId,
      sessionId,
      clickType,
      shopId,
      category,
      searchQuery,
      sourcePage,
      targetUrl,
      deviceType,
    } = data;

    // Get location from visitor record
    let country, city;
    if (visitorId) {
      const visitor = await Visitor.findOne({ visitorId }).select('country city');
      if (visitor) {
        country = visitor.country;
        city = visitor.city;
      }
    }

    if (!visitorId || !clickType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create click event
    await ClickEvent.create({
      visitorId,
      clickType,
      shopId: shopId || undefined,
      category: category || undefined,
      searchQuery: searchQuery || undefined,
      sourcePage,
      targetUrl,
      deviceType,
      country,
      city,
      timestamp: new Date(),
    });

    // Update shop analytics if shopId present
    if (shopId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let analytics = await ShopAnalytics.findOne({
        shopId,
        date: today,
      });

      if (!analytics) {
        analytics = await ShopAnalytics.create({
          shopId,
          date: today,
        });
      }

      // Update relevant click counter
      analytics.totalClicks += 1;
      
      switch (clickType) {
        case ClickType.PHONE_CLICK:
          analytics.phoneClicks += 1;
          break;
        case ClickType.WHATSAPP_CLICK:
          analytics.whatsappClicks += 1;
          break;
        case ClickType.EMAIL_CLICK:
          analytics.emailClicks += 1;
          break;
        case ClickType.DIRECTION_CLICK:
          analytics.directionClicks += 1;
          break;
        case ClickType.WEBSITE_CLICK:
          analytics.websiteClicks += 1;
          break;
      }

      await analytics.save();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Analytics click error:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}

