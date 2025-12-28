import mongoose, { Schema, Document } from 'mongoose';

export enum ShopStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  APPROVED = 'approved', // Keep for backward compatibility
  REJECTED = 'rejected',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export interface IShop extends Document {
  name: string;
  description: string;
  category: string;
  address: string;
  area?: string;
  city: string;
  state: string;
  pincode: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  phone: string;
  email: string;
  website?: string;
  images: string[];
  status: ShopStatus;
  shopperId: mongoose.Types.ObjectId;
  agentId?: mongoose.Types.ObjectId;
  operatorId?: mongoose.Types.ObjectId;
  planId?: mongoose.Types.ObjectId;
  planExpiry?: Date;
  rankScore: number; // Calculated rank
  manualRank?: number; // Admin set rank
  isFeatured: boolean;
  homepagePriority: number;
  rating: number;
  reviewCount: number;
  visitorCount: number; // Total visitors/views
  // Plan-based fields
  photos: string[]; // Array of photo URLs
  offers: Array<{
    title: string;
    description: string;
    validUntil?: Date;
  }>;
  pages: Array<{
    title: string;
    content: string;
    slug: string;
  }>;
  paymentStatus: PaymentStatus; // Payment status
  paymentMode?: 'cash' | 'online'; // Payment mode (cash or online)
  // SEO Fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema = new Schema<IShop>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    address: { type: String, required: true },
    area: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String },
    images: [{ type: String }],
    status: { type: String, enum: Object.values(ShopStatus), default: ShopStatus.PENDING },
    shopperId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'User' },
    operatorId: { type: Schema.Types.ObjectId, ref: 'User' },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan' },
    planExpiry: { type: Date },
    rankScore: { type: Number, default: 0 },
    manualRank: { type: Number },
    isFeatured: { type: Boolean, default: false },
    homepagePriority: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    visitorCount: { type: Number, default: 0 },
    // Plan-based fields
    photos: [{ type: String }],
    offers: [{
      title: { type: String, required: true },
      description: { type: String, required: true },
      validUntil: { type: Date },
    }],
    pages: [{
      title: { type: String, required: true },
      content: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
    }],
    paymentStatus: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
    paymentMode: { type: String, enum: ['cash', 'online'] },
    // SEO Fields
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: { type: String },
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
ShopSchema.index({ location: '2dsphere' });
ShopSchema.index({ status: 1, planId: 1 });
ShopSchema.index({ rankScore: -1 });
ShopSchema.index({ homepagePriority: -1 });
ShopSchema.index({ city: 1, status: 1 });
ShopSchema.index({ shopperId: 1 });
ShopSchema.index({ agentId: 1 });
ShopSchema.index({ operatorId: 1 });

export default mongoose.models.Shop || mongoose.model<IShop>('Shop', ShopSchema);

