import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Plan from '@/models/Plan';

// Public endpoint to initialize plans (for development/testing)
// In production, you should use /api/admin/plans/init with admin auth
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Check if plans already exist
    const existingPlans = await Plan.countDocuments({ isActive: true });
    if (existingPlans > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Plans already initialized',
        count: existingPlans 
      });
    }

    const plans = [
      {
        name: 'Basic Plan',
        price: 100,
        duration: 365,
        maxPhotos: 1,
        maxOffers: 0,
        slotType: undefined,
        seoEnabled: false,
        pageHosting: 0,
        priority: 1,
        isActive: true,
      },
      {
        name: 'Left Bar Plan',
        price: 100,
        duration: 365,
        maxPhotos: 1,
        maxOffers: 0,
        slotType: 'Left Bar',
        seoEnabled: false,
        pageHosting: 0,
        priority: 2,
        isActive: true,
      },
      {
        name: 'Bottom Rail Plan',
        price: 200,
        duration: 365,
        maxPhotos: 1,
        maxOffers: 0,
        slotType: 'Bottom Rail',
        seoEnabled: false,
        pageHosting: 0,
        priority: 3,
        isActive: true,
      },
      {
        name: 'Right Side Plan',
        price: 300,
        duration: 365,
        maxPhotos: 1,
        maxOffers: 0,
        slotType: 'Right Side',
        seoEnabled: true,
        pageHosting: 0,
        priority: 4,
        isActive: true,
      },
      {
        name: 'Hero Plan',
        price: 500,
        duration: 365,
        maxPhotos: 3,
        maxOffers: 0,
        slotType: 'Hero Section',
        seoEnabled: true,
        pageHosting: 0,
        priority: 5,
        isActive: true,
      },
      {
        name: 'Featured Plan',
        price: 2388,
        duration: 365,
        maxPhotos: 8,
        maxOffers: 4,
        slotType: undefined,
        seoEnabled: false,
        pageHosting: 1,
        priority: 6,
        isActive: true,
      },
      {
        name: 'Premium Plan',
        price: 2999,
        duration: 365,
        maxPhotos: 12,
        maxOffers: 8,
        slotType: undefined,
        seoEnabled: false,
        pageHosting: 2,
        priority: 7,
        isActive: true,
      },
      {
        name: 'Banner Plan',
        price: 4788,
        duration: 365,
        maxPhotos: 20,
        maxOffers: 10,
        slotType: 'Banner',
        seoEnabled: false,
        pageHosting: 3,
        priority: 8,
        isActive: true,
      },
    ];

    // Create new plans
    const createdPlans = await Plan.insertMany(plans);

    return NextResponse.json({ 
      success: true, 
      message: 'Plans initialized successfully',
      plans: createdPlans,
      count: createdPlans.length 
    });
  } catch (error: any) {
    console.error('Error initializing plans:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error 
    }, { status: 500 });
  }
}

