import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';
import GoogleBusinessAccount, { GoogleBusinessStatus } from '@/models/GoogleBusinessAccount';
import { refreshAccessToken, getBusinessProfile, checkVerificationStatus } from '@/lib/google-business-api';

/**
 * POST /api/admin/google-business/[id]/sync
 * Sync Google Business account data
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const account = await GoogleBusinessAccount.findById(id);

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (!account.accessToken || !account.refreshToken) {
      return NextResponse.json(
        { error: 'Account not connected. Please complete OAuth flow.' },
        { status: 400 }
      );
    }

    // Check if token needs refresh
    let accessToken = account.accessToken;
    if (account.tokenExpiry && new Date() >= account.tokenExpiry) {
      try {
        const tokenData = await refreshAccessToken(account.refreshToken);
        accessToken = tokenData.accessToken;
        account.accessToken = accessToken;
        account.tokenExpiry = new Date(Date.now() + tokenData.expiresIn * 1000);
        await account.save();
      } catch (error: any) {
        account.status = GoogleBusinessStatus.FAILED;
        account.lastError = `Token refresh failed: ${error.message}`;
        account.errorCount += 1;
        await account.save();
        return NextResponse.json(
          { error: 'Failed to refresh token. Please reconnect account.' },
          { status: 401 }
        );
      }
    }

    if (!account.locationId) {
      return NextResponse.json(
        { error: 'Location ID not found. Account may not be fully set up.' },
        { status: 400 }
      );
    }

    try {
      // Fetch business profile data
      const profile = await getBusinessProfile(accessToken, account.locationId);
      
      // Check verification status
      const verification = await checkVerificationStatus(accessToken, account.locationId);

      // Update account
      account.googleRating = profile.rating;
      account.googleReviewCount = profile.reviewCount;
      account.googlePhotos = profile.photos;
      account.verificationStatus = verification.verified ? 'verified' : 'unverified';
      account.lastSynced = new Date();
      account.errorCount = 0;
      account.lastError = undefined;

      if (verification.verified && account.status !== GoogleBusinessStatus.VERIFIED) {
        account.status = GoogleBusinessStatus.VERIFIED;
      }

      await account.save();

      return NextResponse.json({
        success: true,
        message: 'Sync completed successfully',
        data: {
          rating: profile.rating,
          reviewCount: profile.reviewCount,
          verified: verification.verified,
        },
      });
    } catch (error: any) {
      account.lastError = error.message;
      account.errorCount += 1;
      if (account.errorCount >= 5) {
        account.status = GoogleBusinessStatus.FAILED;
      }
      await account.save();

      return NextResponse.json(
        { error: `Sync failed: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error syncing Google Business account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

