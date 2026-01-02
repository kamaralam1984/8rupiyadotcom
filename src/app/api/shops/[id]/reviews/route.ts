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

    // Create review (userId is optional for anonymous reviews)
    const review = await Review.create({
      shopId: id,
      rating: parseInt(rating),
      comment: comment.trim(),
      isVerified: false,
      // userId can be added later for authenticated users
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

