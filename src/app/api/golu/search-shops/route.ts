import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { verifyToken } from '@/lib/auth';

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

    const body = await req.json();
    const { query, city, category, sortBy = 'price' } = body;

    await connectDB();

    // Build search query
    const searchQuery: any = {
      status: 'active',
    };

    // Text search in name, description, keywords
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { keywords: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ];
    }

    // Filter by city
    if (city) {
      searchQuery['location.city'] = { $regex: city, $options: 'i' };
    }

    // Filter by category
    if (category) {
      searchQuery.category = { $regex: category, $options: 'i' };
    }

    // Execute search
    let shops = await Shop.find(searchQuery)
      .populate('ownerId', 'name phone email')
      .limit(20);

    // Sort by price if available
    if (sortBy === 'price') {
      shops = shops.sort((a, b) => {
        const priceA = parseFloat(a.pricing?.basePrice || '999999');
        const priceB = parseFloat(b.pricing?.basePrice || '999999');
        return priceA - priceB;
      });
    }

    // Calculate distance if user location provided (future enhancement)
    // For now, just return shops

    // Format response
    const results = shops.map((shop) => ({
      id: shop._id,
      name: shop.name,
      description: shop.description,
      category: shop.category,
      location: shop.location,
      contact: shop.contact,
      pricing: shop.pricing,
      rating: shop.rating,
      owner: shop.ownerId,
      images: shop.images,
    }));

    return NextResponse.json({
      success: true,
      count: results.length,
      shops: results,
      message: results.length > 0 
        ? `${results.length} shops found${city ? ` in ${city}` : ''}` 
        : 'No shops found',
    });
  } catch (error) {
    console.error('Error searching shops:', error);
    return NextResponse.json(
      { error: 'Failed to search shops' },
      { status: 500 }
    );
  }
}

