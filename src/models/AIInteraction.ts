import mongoose, { Schema, Document } from 'mongoose';

export enum InteractionType {
  QUERY = 'query',
  CLICK = 'click',
  CALL = 'call',
  WHATSAPP = 'whatsapp',
  SELECTION = 'selection',
  IGNORE = 'ignore',
}

export interface IAIInteraction extends Document {
  userId?: string; // Optional - can track anonymous users
  sessionId: string; // Session identifier for anonymous users
  query: string; // User's query/question
  queryLanguage: 'hi' | 'en' | 'hinglish'; // Detected language
  category?: string; // Detected or inferred category
  location?: {
    lat: number;
    lng: number;
  };
  recommendedShops: Array<{
    shopId: string;
    shopName: string;
    rank: number; // Position in recommendation
    reason: string; // Why this shop was recommended
  }>;
  selectedShopId?: string; // Shop user clicked/called
  interactionType: InteractionType;
  conversion: boolean; // Did this lead to a call/booking?
  createdAt: Date;
  updatedAt: Date;
}

const AIInteractionSchema = new Schema<IAIInteraction>(
  {
    userId: { type: String },
    sessionId: { type: String, required: true, index: true },
    query: { type: String, required: true },
    queryLanguage: { type: String, enum: ['hi', 'en', 'hinglish'], default: 'hinglish' },
    category: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    recommendedShops: [{
      shopId: { type: String, required: true },
      shopName: { type: String, required: true },
      rank: { type: Number, required: true },
      reason: { type: String },
    }],
    selectedShopId: { type: String },
    interactionType: { 
      type: String, 
      enum: Object.values(InteractionType), 
      required: true,
      default: InteractionType.QUERY,
    },
    conversion: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for analytics
AIInteractionSchema.index({ sessionId: 1, createdAt: -1 });
AIInteractionSchema.index({ selectedShopId: 1, createdAt: -1 });
AIInteractionSchema.index({ category: 1, createdAt: -1 });
AIInteractionSchema.index({ conversion: 1, createdAt: -1 });
AIInteractionSchema.index({ interactionType: 1, createdAt: -1 });

export default mongoose.models.AIInteraction || mongoose.model<IAIInteraction>('AIInteraction', AIInteractionSchema);

