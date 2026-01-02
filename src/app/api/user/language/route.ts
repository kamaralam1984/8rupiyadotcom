import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserProfile from '@/models/UserProfile';
import { verifyToken } from '@/lib/auth';
import { isValidLocale, Locale } from '@/i18n/config';

// GET - Fetch user language preference
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ language: 'en' }, { status: 200 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ language: 'en' }, { status: 200 });
    }

    await connectDB();

    const profile = await UserProfile.findOne({ userId: decoded.userId });
    const language = (profile?.preferences?.language as Locale) || 'en';
    
    return NextResponse.json({ language: isValidLocale(language) ? language : 'en' });
  } catch (error) {
    console.error('Error fetching user language:', error);
    return NextResponse.json({ language: 'en' }, { status: 200 });
  }
}

// POST - Update user language preference
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { language } = await req.json();
    
    if (!isValidLocale(language)) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
    }

    await connectDB();

    // Update or create user profile with language preference
    await UserProfile.findOneAndUpdate(
      { userId: decoded.userId },
      {
        $set: {
          'preferences.language': language,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, language });
  } catch (error) {
    console.error('Error updating user language:', error);
    return NextResponse.json(
      { error: 'Failed to update language' },
      { status: 500 }
    );
  }
}

