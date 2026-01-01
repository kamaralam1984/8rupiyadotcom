import mongoose, { Schema, Document } from 'mongoose';

export interface IShopAnalytics extends Document {
  shopId: mongoose.Types.ObjectId;
  date: Date; // Daily aggregation
  
  // View Stats
  totalViews: number;
  uniqueVisitors: number;
  
  // Click Stats
  totalClicks: number;
  phoneClicks: number;
  whatsappClicks: number;
  emailClicks: number;
  directionClicks: number;
  websiteClicks: number;
  
  // Engagement
  avgTimeSpent: number; // seconds
  bounceRate: number; // percentage
  
  // Device Breakdown
  mobileViews: number;
  desktopViews: number;
  tabletViews: number;
  
  // Location Breakdown (top 5)
  topCities: Array<{ city: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
  
  // Traffic Source
  directTraffic: number;
  searchTraffic: number;
  socialTraffic: number;
  referralTraffic: number;
  
  // Conversion
  inquiries: number;
  conversions: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const ShopAnalyticsSchema = new Schema<IShopAnalytics>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    date: { type: Date, required: true, index: true },
    
    // View Stats
    totalViews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    
    // Click Stats
    totalClicks: { type: Number, default: 0 },
    phoneClicks: { type: Number, default: 0 },
    whatsappClicks: { type: Number, default: 0 },
    emailClicks: { type: Number, default: 0 },
    directionClicks: { type: Number, default: 0 },
    websiteClicks: { type: Number, default: 0 },
    
    // Engagement
    avgTimeSpent: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
    
    // Device Breakdown
    mobileViews: { type: Number, default: 0 },
    desktopViews: { type: Number, default: 0 },
    tabletViews: { type: Number, default: 0 },
    
    // Location Breakdown
    topCities: [{
      city: String,
      count: Number
    }],
    topCountries: [{
      country: String,
      count: Number
    }],
    
    // Traffic Source
    directTraffic: { type: Number, default: 0 },
    searchTraffic: { type: Number, default: 0 },
    socialTraffic: { type: Number, default: 0 },
    referralTraffic: { type: Number, default: 0 },
    
    // Conversion
    inquiries: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Unique constraint: one record per shop per day
ShopAnalyticsSchema.index({ shopId: 1, date: 1 }, { unique: true });
ShopAnalyticsSchema.index({ date: -1, totalViews: -1 });

export default mongoose.models.ShopAnalytics || mongoose.model<IShopAnalytics>('ShopAnalytics', ShopAnalyticsSchema);

