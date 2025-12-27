import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Plan from '@/models/Plan';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { UserRole } from '@/models/User';

export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const plans = [
      {
        name: 'Basic Plan',
        price: 100,
        duration: 365,
        expiryDays: 365,
        maxPhotos: 1,
        maxOffers: 0,
        pageLimit: 0,
        pageHosting: 0,
        slotType: undefined,
        seoEnabled: false,
        priority: 1,
        listingPriority: 1,
        rank: 1,
        homepageVisibility: false,
        featuredTag: false,
        position: 'normal' as const,
        photos: 1,
        slots: 0,
        seo: false,
        offers: 0,
        isActive: true,
      },
      {
        name: 'Standard Plan',
        price: 200,
        duration: 365,
        expiryDays: 365,
        maxPhotos: 2,
        maxOffers: 1,
        pageLimit: 0,
        pageHosting: 0,
        slotType: undefined,
        seoEnabled: false,
        priority: 2,
        listingPriority: 2,
        rank: 2,
        homepageVisibility: false,
        featuredTag: false,
        position: 'normal' as const,
        photos: 2,
        slots: 0,
        seo: false,
        offers: 1,
        isActive: true,
      },
      {
        name: 'Premium Plan',
        price: 2000,
        duration: 365,
        expiryDays: 365,
        maxPhotos: 5,
        maxOffers: 3,
        pageLimit: 1,
        pageHosting: 1,
        slotType: undefined,
        seoEnabled: true,
        priority: 3,
        listingPriority: 3,
        rank: 3,
        homepageVisibility: true,
        featuredTag: false,
        position: 'right' as const,
        photos: 5,
        slots: 0,
        seo: true,
        offers: 3,
        isActive: true,
      },
      {
        name: 'Gold Plan',
        price: 3000,
        duration: 365,
        expiryDays: 365,
        maxPhotos: 8,
        maxOffers: 5,
        pageLimit: 2,
        pageHosting: 2,
        slotType: undefined,
        seoEnabled: true,
        priority: 4,
        listingPriority: 4,
        rank: 4,
        homepageVisibility: true,
        featuredTag: true,
        position: 'hero' as const,
        photos: 8,
        slots: 0,
        seo: true,
        offers: 5,
        isActive: true,
      },
      {
        name: 'Platinum Plan',
        price: 4000,
        duration: 365,
        expiryDays: 365,
        maxPhotos: 12,
        maxOffers: 8,
        pageLimit: 3,
        pageHosting: 3,
        slotType: undefined,
        seoEnabled: true,
        priority: 5,
        listingPriority: 5,
        rank: 5,
        homepageVisibility: true,
        featuredTag: true,
        position: 'hero' as const,
        photos: 12,
        slots: 0,
        seo: true,
        offers: 8,
        isActive: true,
      },
      {
        name: 'Diamond Plan',
        price: 5000,
        duration: 365,
        expiryDays: 365,
        maxPhotos: 20,
        maxOffers: 10,
        pageLimit: 5,
        pageHosting: 5,
        slotType: 'Banner',
        seoEnabled: true,
        priority: 6,
        listingPriority: 6,
        rank: 6,
        homepageVisibility: true,
        featuredTag: true,
        position: 'banner' as const,
        photos: 20,
        slots: 0,
        seo: true,
        offers: 10,
        isActive: true,
      },
    ];

    // Clear existing plans
    await Plan.deleteMany({});

    // Create new plans
    const createdPlans = await Plan.insertMany(plans);

    return NextResponse.json({ success: true, plans: createdPlans });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN]);

