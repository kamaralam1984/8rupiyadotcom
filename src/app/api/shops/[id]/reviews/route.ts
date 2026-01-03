import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import Review from '@/models/Review';

// POST /api/shops/[id]/reviews - Create a review for a shop
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { rating, comment } = await req.json();

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json(
        { error: 'Review comment must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Check if shop exists
    const shop = await Shop.findById(id);
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Get user ID from token if available
    let userId = null;
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;
    
    if (token) {
      try {
        const { verifyToken } = await import('@/lib/auth');
        const payload = verifyToken(token);
        if (payload && payload.userId) {
          userId = payload.userId;
          
          // Check if user already reviewed this shop (only for logged-in users)
          const existingReview = await Review.findOne({ shopId: id, userId });
          if (existingReview) {
            return NextResponse.json(
              { error: 'You have already reviewed this shop' },
              { status: 400 }
            );
          }
        }
      } catch (err) {
        // Token invalid, continue as anonymous
      }
    }

    // Create review (userId is optional for anonymous reviews)
    const review = await Review.create({
      shopId: id,
      userId: userId || undefined, // Only set if user is logged in
      rating: parseInt(rating),
      comment: comment.trim(),
      isVerified: false,
    });

    // Calculate new average rating and update shop
    const allReviews = await Review.find({ shopId: id });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;
    const reviewCount = allReviews.length;

    await Shop.findByIdAndUpdate(id, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewCount: reviewCount,
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
      },
      shop: {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: reviewCount,
      },
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000 || error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { 
          error: 'Database index issue detected. Please contact support or try again later. The database administrator needs to run: db.reviews.dropIndex("shopId_1_userId_1")' 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}

// GET /api/shops/[id]/reviews - Get all reviews for a shop
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const reviews = await Review.find({ shopId: id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

