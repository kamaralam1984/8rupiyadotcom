import mongoose, { Schema, Document } from 'mongoose';

export enum GoogleBusinessStatus {
  PENDING = 'pending',
  CONNECTED = 'connected',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
  FAILED = 'failed',
}

export interface IGoogleBusinessAccount extends Document {
  shopId: mongoose.Types.ObjectId;
  shopperId: mongoose.Types.ObjectId;
  
  // Google Business Profile Details
  accountName?: string;
  locationId?: string; // Google Business Profile Location ID
  placeId?: string; // Google Places ID
  
  // OAuth Credentials (encrypted)
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  
  // Business Information
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail?: string;
  businessWebsite?: string;
  businessCategory?: string;
  businessDescription?: string;
  
  // Location Details
  latitude?: number;
  longitude?: number;
  
  // Status & Verification
  status: GoogleBusinessStatus;
  verificationStatus?: 'verified' | 'unverified' | 'pending';
  verificationMethod?: 'phone' | 'email' | 'postcard' | 'instant';
  
  // Google Business Profile Data
  googleRating?: number;
  googleReviewCount?: number;
  googlePhotos?: string[];
  googleHours?: {
    [key: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  
  // Sync Information
  lastSynced?: Date;
  syncEnabled: boolean;
  autoSync: boolean;
  
  // Error Tracking
  lastError?: string;
  errorCount: number;
  
  // Admin Notes
  adminNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const GoogleBusinessAccountSchema = new Schema<IGoogleBusinessAccount>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    shopperId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    
    accountName: { type: String },
    locationId: { type: String, index: true },
    placeId: { type: String, index: true },
    
    accessToken: { type: String }, // Should be encrypted in production
    refreshToken: { type: String }, // Should be encrypted in production
    tokenExpiry: { type: Date },
    
    businessName: { type: String, required: true },
    businessAddress: { type: String, required: true },
    businessPhone: { type: String, required: true },
    businessEmail: { type: String },
    businessWebsite: { type: String },
    businessCategory: { type: String },
    businessDescription: { type: String },
    
    latitude: { type: Number },
    longitude: { type: Number },
    
    status: {
      type: String,
      enum: Object.values(GoogleBusinessStatus),
      default: GoogleBusinessStatus.PENDING,
      index: true,
    },
    verificationStatus: { type: String, enum: ['verified', 'unverified', 'pending'] },
    verificationMethod: { type: String, enum: ['phone', 'email', 'postcard', 'instant'] },
    
    googleRating: { type: Number },
    googleReviewCount: { type: Number },
    googlePhotos: [{ type: String }],
    googleHours: {
      type: Map,
      of: {
        open: String,
        close: String,
        closed: Boolean,
      },
    },
    
    lastSynced: { type: Date },
    syncEnabled: { type: Boolean, default: true },
    autoSync: { type: Boolean, default: false },
    
    lastError: { type: String },
    errorCount: { type: Number, default: 0 },
    
    adminNotes: { type: String },
  },
  { timestamps: true }
);

// Indexes for efficient queries
GoogleBusinessAccountSchema.index({ shopId: 1, status: 1 });
GoogleBusinessAccountSchema.index({ shopperId: 1 });
GoogleBusinessAccountSchema.index({ locationId: 1 });
GoogleBusinessAccountSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.GoogleBusinessAccount || 
  mongoose.model<IGoogleBusinessAccount>('GoogleBusinessAccount', GoogleBusinessAccountSchema);

