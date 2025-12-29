import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AIInteraction, { InteractionType } from '@/models/AIInteraction';
import Shop from '@/models/Shop';

// POST /api/ai/interaction - Track user interactions (clicks, calls, etc.)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { sessionId, shopId, interactionType, userId } = body;

    if (!sessionId || !shopId || !interactionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!Object.values(InteractionType).includes(interactionType)) {
      return NextResponse.json({ error: 'Invalid interaction type' }, { status: 400 });
    }

    // Find the most recent query for this session
    const lastQuery = await AIInteraction.findOne({
      sessionId,
      interactionType: InteractionType.QUERY,
    }).sort({ createdAt: -1 });

    if (lastQuery) {
      // Check if this shop was in the recommendations
      const wasRecommended = lastQuery.recommendedShops.some(
        (rec: any) => rec.shopId === shopId
      );

      // Update the interaction
      await AIInteraction.create({
        sessionId,
        userId: userId || undefined,
        query: lastQuery.query,
        queryLanguage: lastQuery.queryLanguage,
        category: lastQuery.category,
        location: lastQuery.location,
        recommendedShops: lastQuery.recommendedShops,
        selectedShopId: shopId,
        interactionType,
        conversion: interactionType === InteractionType.CALL || interactionType === InteractionType.WHATSAPP,
      });

      // Boost shop ranking if it was selected (learning system)
      if (wasRecommended) {
        const shop = await Shop.findById(shopId);
        if (shop) {
          // Increase rank score for positive interactions
          shop.rankScore = (shop.rankScore || 0) + 1;
          if (interactionType === InteractionType.CALL || interactionType === InteractionType.WHATSAPP) {
            shop.rankScore += 2; // Extra boost for conversions
          }
          await shop.save();
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Interaction tracking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

