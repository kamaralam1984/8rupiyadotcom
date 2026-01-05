import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import GoogleBusinessAccount, { GoogleBusinessStatus } from '@/models/GoogleBusinessAccount';
import Shop from '@/models/Shop';
import User from '@/models/User';
import { getGoogleBusinessOAuthUrl, exchangeCodeForToken, createLocation } from '@/lib/google-business-api';

/**
 * GET /api/admin/google-business
 * Get all Google Business accounts with filters
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const verificationStatus = searchParams.get('verificationStatus') || '';

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (verificationStatus) {
      query.verificationStatus = verificationStatus;
    }

    let accounts = await GoogleBusinessAccount.find(query)
      .populate('shopId', 'name address city')
      .populate('shopperId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    // Search filtering
    if (search) {
      const searchLower = search.toLowerCase();
      accounts = accounts.filter((account: any) =>
        account.shopId?.name?.toLowerCase().includes(searchLower) ||
        account.shopperId?.name?.toLowerCase().includes(searchLower) ||
        account.shopperId?.email?.toLowerCase().includes(searchLower) ||
        account.businessName?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      accounts,
    });
  } catch (error: any) {
    console.error('Error fetching Google Business accounts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/google-business
 * Create a new Google Business account
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const {
      shopId,
      businessName,
      businessAddress,
      businessPhone,
      businessEmail,
      businessWebsite,
      businessCategory,
      businessDescription,
      latitude,
      longitude,
    } = await req.json();

    if (!shopId || !businessName || !businessAddress || !businessPhone) {
      return NextResponse.json(
        { error: 'Shop ID, business name, address, and phone are required' },
        { status: 400 }
      );
    }

    // Verify shop exists
    const shop = await Shop.findById(shopId).populate('shopperId');
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Check if account already exists
    const existingAccount = await GoogleBusinessAccount.findOne({ shopId });
    if (existingAccount) {
      return NextResponse.json(
        { error: 'Google Business account already exists for this shop' },
        { status: 400 }
      );
    }

    // Create account record
    const account = await GoogleBusinessAccount.create({
      shopId: shop._id,
      shopperId: shop.shopperId,
      businessName,
      businessAddress,
      businessPhone,
      businessEmail,
      businessWebsite,
      businessCategory,
      businessDescription,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      status: GoogleBusinessStatus.PENDING,
      syncEnabled: true,
      autoSync: false,
      errorCount: 0,
    });

    // Generate OAuth URL
    const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/google-business/oauth/callback`;
    const oauthUrl = getGoogleBusinessOAuthUrl(redirectUri, account._id.toString());

    return NextResponse.json({
      success: true,
      account,
      oauthUrl,
      message: 'Account created. Please complete OAuth authorization.',
    });
  } catch (error: any) {
    console.error('Error creating Google Business account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

