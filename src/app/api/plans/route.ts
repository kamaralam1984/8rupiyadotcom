import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Plan from '@/models/Plan';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const plans = await Plan.find({ isActive: true })
      .select('_id name price listingPriority rank homepageVisibility featuredTag expiryDays maxPhotos maxOffers pageLimit position seoEnabled photos slots seo offers pageHosting slotType')
      .sort({ listingPriority: 1 });

    return NextResponse.json({
      success: true,
      plans: plans.map(plan => ({
        _id: plan._id.toString(),
        name: plan.name,
        price: plan.price,
        listingPriority: plan.listingPriority,
        rank: plan.rank,
        homepageVisibility: plan.homepageVisibility,
        featuredTag: plan.featuredTag,
        expiryDays: plan.expiryDays,
        // New plan system fields
        maxPhotos: plan.maxPhotos,
        maxOffers: plan.maxOffers,
        pageLimit: plan.pageLimit,
        position: plan.position,
        seoEnabled: plan.seoEnabled,
        // Legacy fields
        photos: plan.photos,
        slots: plan.slots,
        seo: plan.seo,
        offers: plan.offers,
        pageHosting: plan.pageHosting,
        slotType: plan.slotType,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

