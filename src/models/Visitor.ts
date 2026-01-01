import mongoose, { Schema, Document } from 'mongoose';

export interface IVisitor extends Document {
  visitorId: string; // Unique anonymous ID
  userId?: mongoose.Types.ObjectId; // If logged in
  
  // Device Info
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  screenResolution?: string;
  
  // Location (IP-based)
  ipAddress?: string; // Hashed for privacy
  country?: string;
  state?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  
  // Visit Stats
  firstVisit: Date;
  lastVisit: Date;
  totalVisits: number;
  totalTimeSpent: number; // in seconds
  
  // Pages
  pagesVisited: string[];
  entryPage?: string;
  exitPage?: string;
  
  // Tracking
  utmSource?: string; // Google, Facebook, etc.
  utmMedium?: string; // organic, cpc, etc.
  utmCampaign?: string;
  referrer?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema = new Schema<IVisitor>(
  {
    visitorId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    
    // Device Info
    deviceType: { type: String, enum: ['mobile', 'desktop', 'tablet'], required: true },
    browser: { type: String, required: true },
    os: { type: String, required: true },
    screenResolution: { type: String },
    
    // Location
    ipAddress: { type: String }, // Hashed
    country: { type: String, index: true },
    state: { type: String, index: true },
    city: { type: String, index: true },
    latitude: { type: Number },
    longitude: { type: Number },
    
    // Visit Stats
    firstVisit: { type: Date, required: true, default: Date.now },
    lastVisit: { type: Date, required: true, default: Date.now },
    totalVisits: { type: Number, default: 1 },
    totalTimeSpent: { type: Number, default: 0 },
    
    // Pages
    pagesVisited: [{ type: String }],
    entryPage: { type: String },
    exitPage: { type: String },
    
    // Tracking
    utmSource: { type: String, index: true },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    referrer: { type: String },
  },
  { timestamps: true }
);

// Indexes for analytics queries
VisitorSchema.index({ createdAt: -1 });
VisitorSchema.index({ country: 1, state: 1, city: 1 });
VisitorSchema.index({ utmSource: 1, createdAt: -1 });
VisitorSchema.index({ deviceType: 1, createdAt: -1 });

export default mongoose.models.Visitor || mongoose.model<IVisitor>('Visitor', VisitorSchema);

