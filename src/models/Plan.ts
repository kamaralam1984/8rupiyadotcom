import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  price: number;
  duration: number; // Duration in days (365 for 1 year)
  maxPhotos: number; // Maximum number of photos allowed
  maxOffers: number; // Maximum number of offers allowed
  slotType?: string; // Type of slot (e.g., "Left Bar", "Bottom Rail", "Right Side", "Hero Section", "Banner")
  seoEnabled: boolean; // Whether SEO is enabled for this plan
  pageHosting: number; // Number of pages allowed for hosting
  priority: number; // Priority for display (higher = more priority)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Legacy fields (kept for backward compatibility)
  listingPriority?: number;
  rank?: number;
  homepageVisibility?: boolean;
  featuredTag?: boolean;
  expiryDays?: number;
  pageLimit?: number;
  position?: 'normal' | 'left' | 'right' | 'hero' | 'banner';
  photos?: number;
  slots?: number;
  seo?: boolean;
  offers?: number;
}

const PlanSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true, default: 365 }, // 1 year = 365 days
    maxPhotos: { type: Number, required: true, default: 1 },
    maxOffers: { type: Number, required: true, default: 0 },
    slotType: { type: String }, // "Left Bar", "Bottom Rail", "Right Side", "Hero Section", "Banner", etc.
    seoEnabled: { type: Boolean, required: true, default: false },
    pageHosting: { type: Number, required: true, default: 0 },
    priority: { type: Number, required: true, default: 0 }, // Higher = more priority
    isActive: { type: Boolean, default: true },
    // Legacy fields (kept for backward compatibility)
    listingPriority: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    homepageVisibility: { type: Boolean, default: false },
    featuredTag: { type: Boolean, default: false },
    expiryDays: { type: Number, default: 365 },
    pageLimit: { type: Number, default: 0 },
    position: { 
      type: String, 
      enum: ['normal', 'left', 'right', 'hero', 'banner'], 
      default: 'normal' 
    },
    photos: { type: Number, default: 1 },
    slots: { type: Number, default: 0 },
    seo: { type: Boolean, default: false },
    offers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);

