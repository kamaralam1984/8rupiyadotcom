import mongoose, { Schema, Document } from 'mongoose';

export interface IPageView extends Document {
  visitorId: string;
  userId?: mongoose.Types.ObjectId;
  
  // Page Info
  path: string;
  title?: string;
  referrer?: string;
  searchKeyword?: string; // Extracted from search engine referrer
  searchEngine?: string; // google, bing, yahoo, etc.
  
  // Session
  sessionId: string;
  
  // Time
  timestamp: Date;
  timeSpent: number; // seconds on page
  
  // Device & Location (denormalized for fast queries)
  deviceType: 'mobile' | 'desktop' | 'tablet';
  country?: string;
  city?: string;
  
  // Exit
  isExit: boolean;
  nextPage?: string;
  
  createdAt: Date;
}

const PageViewSchema = new Schema<IPageView>(
  {
    visitorId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    
    path: { type: String, required: true, index: true },
    title: { type: String },
    referrer: { type: String },
    searchKeyword: { type: String, index: true },
    searchEngine: { type: String, index: true },
    
    sessionId: { type: String, required: true, index: true },
    
    timestamp: { type: Date, required: true, default: Date.now, index: true },
    timeSpent: { type: Number, default: 0 },
    
    deviceType: { type: String, enum: ['mobile', 'desktop', 'tablet'] },
    country: { type: String, index: true },
    city: { type: String },
    
    isExit: { type: Boolean, default: false },
    nextPage: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound indexes for analytics
PageViewSchema.index({ path: 1, timestamp: -1 });
PageViewSchema.index({ visitorId: 1, timestamp: -1 });
PageViewSchema.index({ timestamp: -1, deviceType: 1 });
PageViewSchema.index({ searchKeyword: 1, timestamp: -1 });
PageViewSchema.index({ searchEngine: 1, timestamp: -1 });
PageViewSchema.index({ country: 1, timestamp: -1 });

export default mongoose.models.PageView || mongoose.model<IPageView>('PageView', PageViewSchema);

