import Shop, { IShop } from '@/models/Shop';
import Plan from '@/models/Plan';

export interface RankingFactors {
  planPriority: number;
  rankScore: number;
  distance: number; // in km
  rating: number;
  freshness: number; // days since created
  manualRank?: number;
  isFeatured: boolean;
  homepagePriority: number;
}

export function calculateRankScore(shop: IShop, distance: number = 0): number {
  const factors: RankingFactors = {
    planPriority: 0,
    rankScore: shop.rankScore || 0,
    distance: distance,
    rating: shop.rating || 0,
    freshness: Math.max(0, 30 - Math.floor((Date.now() - shop.createdAt.getTime()) / (1000 * 60 * 60 * 24))),
    manualRank: shop.manualRank,
    isFeatured: shop.isFeatured,
    homepagePriority: shop.homepagePriority || 0,
  };

  // Weighted scoring
  let score = 0;

  // Plan priority (40% weight)
  if (shop.planId) {
    // This should be populated from Plan model
    score += factors.planPriority * 0.4;
  }

  // Manual rank override (highest priority if set)
  if (factors.manualRank !== undefined) {
    return factors.manualRank * 1000; // High multiplier for manual ranking
  }

  // Featured boost (30% weight)
  if (factors.isFeatured) {
    score += 30;
  }

  // Homepage priority (20% weight)
  score += factors.homepagePriority * 0.2;

  // Rating (15% weight)
  score += factors.rating * 3; // 5 stars = 15 points

  // Rank score (10% weight)
  score += factors.rankScore * 0.1;

  // Distance penalty (closer = better)
  if (distance > 0) {
    score -= Math.min(distance / 10, 5); // Max 5 point penalty
  }

  // Freshness bonus (5% weight)
  score += factors.freshness * 0.05;

  return Math.max(0, score);
}

export async function getPlanPriority(planId: any): Promise<number> {
  if (!planId) return 0;
  const plan = await Plan.findById(planId);
  return plan?.listingPriority || 0;
}

