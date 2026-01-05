import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GoogleBusinessAccount, { GoogleBusinessStatus } from '@/models/GoogleBusinessAccount';
import { exchangeCodeForToken, getLocations, createLocation } from '@/lib/google-business-api';

/**
 * GET /api/admin/google-business/oauth/callback
 * Handle OAuth callback from Google
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Account ID
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/google-business?error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/google-business?error=missing_params`
      );
    }

    // Find account
    const account = await GoogleBusinessAccount.findById(state);
    if (!account) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/google-business?error=account_not_found`
      );
    }

    // Exchange code for tokens
    const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/google-business/oauth/callback`;
    const tokenData = await exchangeCodeForToken(code, redirectUri);

    // Update account with tokens
    account.accessToken = tokenData.accessToken;
    account.refreshToken = tokenData.refreshToken;
    account.tokenExpiry = new Date(Date.now() + tokenData.expiresIn * 1000);
    account.status = GoogleBusinessStatus.CONNECTED;

    // Get account locations
    try {
      const locations = await getLocations(tokenData.accessToken);
      
      // Try to find existing location or create new one
      if (locations.length > 0) {
        // Use first location
        account.locationId = locations[0].locationId;
      } else {
        // Create new location
        const locationData = await createLocation(
          tokenData.accessToken,
          'primary', // Default account
          {
            name: account.businessName,
            address: account.businessAddress,
            phone: account.businessPhone,
            website: account.businessWebsite,
            category: account.businessCategory,
            latitude: account.latitude,
            longitude: account.longitude,
          }
        );
        account.locationId = locationData.locationId;
        account.placeId = locationData.placeId;
      }
    } catch (locationError: any) {
      console.error('Error creating/fetching location:', locationError);
      account.lastError = `Location setup failed: ${locationError.message}`;
    }

    await account.save();

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/google-business?success=connected`
    );
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/google-business?error=${encodeURIComponent(error.message)}`
    );
  }
}

