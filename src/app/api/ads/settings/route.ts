import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AdSettings from '@/models/AdSettings';

// GET /api/ads/settings - Get ad settings (public endpoint)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const settings = await (AdSettings as any).getSettings();

    return NextResponse.json({
      success: true,
      settings: {
        homepageAds: settings.homepageAds,
        categoryAds: settings.categoryAds,
        searchAds: settings.searchAds,
        shopPageAds: settings.shopPageAds,
        adsenseCode: settings.adsenseCode,
        adsenseId: settings.adsenseId || process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '',
        customAds: settings.customAds || {
          homepage: [],
          category: [],
          search: [],
          shop: [],
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching ad settings:', error);
    // Return default settings if error
    return NextResponse.json({
      success: true,
      settings: {
        homepageAds: true,
        categoryAds: true,
        searchAds: false,
        shopPageAds: true,
        adsenseCode: '',
        adsenseId: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || '',
        customAds: {
          homepage: [],
          category: [],
          search: [],
          shop: [],
        },
      },
    });
  }
}

