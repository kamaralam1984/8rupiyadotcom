import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import HomepageLayout from '@/models/HomepageLayout';

// GET - Get active homepage layout (public)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    let layout = await HomepageLayout.findOne({ isActive: true });
    
    // If no active layout, get default
    if (!layout) {
      layout = await HomepageLayout.findOne({ isDefault: true });
    }
    
    // If still no layout, create default
    if (!layout) {
      layout = await HomepageLayout.create({
        name: 'Default',
        isActive: true,
        isDefault: true,
      });
    }

    // Ensure all sections exist with defaults (for backward compatibility)
    if (layout && layout.sections) {
      const defaultSections = {
        topCTA: { enabled: true, order: 1 },
        hero: { enabled: true, order: 2 },
        connectionStatus: { enabled: true, order: 3 },
        aboutSection: { enabled: true, order: 4 },
        seoTextSection: { enabled: true, order: 5 },
        leftRail: { enabled: true, order: 6 },
        rightRail: { enabled: true, order: 7 },
        featuredShops: { enabled: true, order: 8, title: 'Featured Shops', limit: 12 },
        paidShops: { enabled: true, order: 9, title: 'Premium Shops', limit: 12 },
        topRated: { enabled: true, order: 10, title: 'Top Rated Shops', limit: 6 },
        nearbyShops: { enabled: true, order: 11, title: 'All Shops', limit: 20 },
        mixedContent1: { enabled: true, order: 12, variant: 'text-left' },
        mixedContent2: { enabled: true, order: 13, variant: 'text-right' },
        mixedContent3: { enabled: true, order: 14, variant: 'text-center' },
        mixedContent4: { enabled: true, order: 15, variant: 'text-only' },
        displayAd1: { enabled: true, order: 16 },
        displayAd2: { enabled: true, order: 17 },
        inFeedAds: { enabled: true, order: 18 },
        stats: { enabled: true, order: 19 },
        footer: { enabled: true, order: 20 },
      };

      // Merge existing sections with defaults
      layout.sections = {
        ...defaultSections,
        ...layout.sections,
        // Preserve existing section properties while adding missing ones
        featuredShops: { ...defaultSections.featuredShops, ...(layout.sections.featuredShops || {}) },
        paidShops: { ...defaultSections.paidShops, ...(layout.sections.paidShops || {}) },
        topRated: { ...defaultSections.topRated, ...(layout.sections.topRated || {}) },
        nearbyShops: { ...defaultSections.nearbyShops, ...(layout.sections.nearbyShops || {}) },
        mixedContent1: { ...defaultSections.mixedContent1, ...(layout.sections.mixedContent1 || {}) },
        mixedContent2: { ...defaultSections.mixedContent2, ...(layout.sections.mixedContent2 || {}) },
        mixedContent3: { ...defaultSections.mixedContent3, ...(layout.sections.mixedContent3 || {}) },
        mixedContent4: { ...defaultSections.mixedContent4, ...(layout.sections.mixedContent4 || {}) },
      };
    }

    return NextResponse.json({ success: true, layout });
  } catch (error: any) {
    console.error('Error fetching homepage layout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

