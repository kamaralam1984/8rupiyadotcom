import mongoose, { Schema, Document } from 'mongoose';

export enum ClickType {
  SHOP_CARD = 'shop_card',           // Shop card clicked on homepage
  SHOP_DETAIL = 'shop_detail',       // Shop detail page opened
  PHONE_CLICK = 'phone_click',       // Phone number clicked
  WHATSAPP_CLICK = 'whatsapp_click', // WhatsApp clicked
  EMAIL_CLICK = 'email_click',       // Email clicked
  DIRECTION_CLICK = 'direction_click', // Map/Direction clicked
  WEBSITE_CLICK = 'website_click',   // Website link clicked
  CATEGORY_CLICK = 'category_click', // Category clicked
  SEARCH_CLICK = 'search_click',     // Search performed
}

export interface IClickEvent extends Document {
  visitorId: string;
  userId?: mongoose.Types.ObjectId;
  
  // Click Info
  clickType: ClickType;
  shopId?: mongoose.Types.ObjectId;
  category?: string;
  searchQuery?: string;
  
  // Context
  sourcePage: string; // Where click happened
  targetUrl?: string; // Where it led
  
  // Device & Location (denormalized)
  deviceType: 'mobile' | 'desktop' | 'tablet';
  country?: string;
  city?: string;
  
  // Time
  timestamp: Date;
  
  createdAt: Date;
}

const ClickEventSchema = new Schema<IClickEvent>(
  {
    visitorId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    
    clickType: { 
      type: String, 
      enum: Object.values(ClickType), 
      required: true,
      index: true 
    },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', index: true },
    category: { type: String, index: true },
    searchQuery: { type: String },
    
    sourcePage: { type: String, required: true },
    targetUrl: { type: String },
    
    deviceType: { type: String, enum: ['mobile', 'desktop', 'tablet'] },
    country: { type: String },
    city: { type: String },
    
    timestamp: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound indexes for analytics
ClickEventSchema.index({ shopId: 1, timestamp: -1 });
ClickEventSchema.index({ clickType: 1, timestamp: -1 });
ClickEventSchema.index({ timestamp: -1, clickType: 1 });
ClickEventSchema.index({ category: 1, timestamp: -1 });

export default mongoose.models.ClickEvent || mongoose.model<IClickEvent>('ClickEvent', ClickEventSchema);

