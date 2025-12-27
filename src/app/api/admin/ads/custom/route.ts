import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AdSettings from '@/models/AdSettings';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { UserRole } from '@/models/User';

// POST /api/admin/ads/custom - Add custom ad to a slot
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { slot, name, code } = body;

    if (!slot || !name || !code) {
      return NextResponse.json({ error: 'Slot, name, and code are required' }, { status: 400 });
    }

    const validSlots = ['homepage', 'category', 'search', 'shop'];
    if (!validSlots.includes(slot)) {
      return NextResponse.json({ error: 'Invalid slot' }, { status: 400 });
    }

    let settings = await (AdSettings as any).getSettings();
    if (!settings.customAds) {
      settings.customAds = {
        homepage: [],
        category: [],
        search: [],
        shop: [],
      };
    }

    const newAd = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      code,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    settings.customAds[slot].push(newAd);
    await settings.save();

    return NextResponse.json({
      success: true,
      message: 'Ad added successfully',
      ad: newAd,
    });
  } catch (error: any) {
    console.error('Error adding custom ad:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

// PUT /api/admin/ads/custom - Update custom ad
export const PUT = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { slot, adId, name, code, enabled } = body;

    if (!slot || !adId) {
      return NextResponse.json({ error: 'Slot and adId are required' }, { status: 400 });
    }

    const validSlots = ['homepage', 'category', 'search', 'shop'];
    if (!validSlots.includes(slot)) {
      return NextResponse.json({ error: 'Invalid slot' }, { status: 400 });
    }

    let settings = await (AdSettings as any).getSettings();
    if (!settings.customAds || !settings.customAds[slot]) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    const adIndex = settings.customAds[slot].findIndex((ad: any) => ad.id === adId);
    if (adIndex === -1) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    if (name !== undefined) settings.customAds[slot][adIndex].name = name;
    if (code !== undefined) settings.customAds[slot][adIndex].code = code;
    if (enabled !== undefined) settings.customAds[slot][adIndex].enabled = enabled;
    settings.customAds[slot][adIndex].updatedAt = new Date();

    await settings.save();

    return NextResponse.json({
      success: true,
      message: 'Ad updated successfully',
      ad: settings.customAds[slot][adIndex],
    });
  } catch (error: any) {
    console.error('Error updating custom ad:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

// DELETE /api/admin/ads/custom - Delete custom ad
export const DELETE = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const slot = searchParams.get('slot');
    const adId = searchParams.get('adId');

    if (!slot || !adId) {
      return NextResponse.json({ error: 'Slot and adId are required' }, { status: 400 });
    }

    const validSlots = ['homepage', 'category', 'search', 'shop'];
    if (!validSlots.includes(slot)) {
      return NextResponse.json({ error: 'Invalid slot' }, { status: 400 });
    }

    let settings = await (AdSettings as any).getSettings();
    if (!settings.customAds || !settings.customAds[slot]) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    settings.customAds[slot] = settings.customAds[slot].filter((ad: any) => ad.id !== adId);
    await settings.save();

    return NextResponse.json({
      success: true,
      message: 'Ad deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting custom ad:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

