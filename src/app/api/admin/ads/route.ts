import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AdSettings from '@/models/AdSettings';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { UserRole } from '@/models/User';

// GET /api/admin/ads - Get ad settings
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    
    // Only admin can access
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const settings = await (AdSettings as any).getSettings();

    return NextResponse.json({
      success: true,
      settings: {
        homepageAds: settings.homepageAds,
        categoryAds: settings.categoryAds,
        searchAds: settings.searchAds,
        shopPageAds: settings.shopPageAds,
        adsenseCode: settings.adsenseCode,
        adsenseId: settings.adsenseId,
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

// POST /api/admin/ads - Update ad settings
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    
    // Only admin can update
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { homepageAds, categoryAds, searchAds, shopPageAds, adsenseCode, customAds } = body;

    // Get or create settings
    let settings = await AdSettings.findOne();
    if (!settings) {
      settings = await AdSettings.create({
        homepageAds: homepageAds ?? true,
        categoryAds: categoryAds ?? true,
        searchAds: searchAds ?? false,
        shopPageAds: shopPageAds ?? true,
        adsenseCode: adsenseCode || '',
        adsenseId: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || '',
        customAds: {
          homepage: [],
          category: [],
          search: [],
          shop: [],
        },
      });
    } else {
      // Update existing settings
      if (homepageAds !== undefined) settings.homepageAds = homepageAds;
      if (categoryAds !== undefined) settings.categoryAds = categoryAds;
      if (searchAds !== undefined) settings.searchAds = searchAds;
      if (shopPageAds !== undefined) settings.shopPageAds = shopPageAds;
      if (adsenseCode !== undefined) settings.adsenseCode = adsenseCode;
      if (customAds !== undefined) {
        settings.customAds = customAds;
      }
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Ad settings updated successfully',
      settings: {
        homepageAds: settings.homepageAds,
        categoryAds: settings.categoryAds,
        searchAds: settings.searchAds,
        shopPageAds: settings.shopPageAds,
        adsenseCode: settings.adsenseCode,
        adsenseId: settings.adsenseId,
        customAds: settings.customAds,
      },
    });
  } catch (error: any) {
    console.error('Error updating ad settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

