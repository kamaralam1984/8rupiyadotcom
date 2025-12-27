import mongoose, { Schema, Document } from 'mongoose';

export interface IAdvertisement extends Document {
  title: string;
  description?: string;
  image: string; // URL or base64
  link: string; // Target website URL
  slot: 'homepage' | 'category' | 'search' | 'shop' | 'sidebar' | 'sidebar-left' | 'sidebar-right' | 'header' | 'footer';
  position: number; // Order/priority
  status: 'active' | 'inactive' | 'expired';
  startDate?: Date;
  endDate?: Date;
  clicks: number;
  impressions: number;
  advertiserName?: string;
  advertiserEmail?: string;
  advertiserPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdvertisementSchema = new Schema<IAdvertisement>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, required: true },
    link: { type: String, required: true },
    slot: {
      type: String,
      enum: ['homepage', 'category', 'search', 'shop', 'sidebar', 'sidebar-left', 'sidebar-right', 'header', 'footer'],
      required: true,
    },
    position: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
    },
    startDate: { type: Date },
    endDate: { type: Date },
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    advertiserName: { type: String },
    advertiserEmail: { type: String },
    advertiserPhone: { type: String },
  },
  { timestamps: true }
);

// Indexes for better query performance
AdvertisementSchema.index({ slot: 1, status: 1, position: 1 });
AdvertisementSchema.index({ startDate: 1, endDate: 1 });

// Clear the model if it exists to force recompilation with new enum values
if (mongoose.models.Advertisement) {
  delete mongoose.models.Advertisement;
}

export default mongoose.model<IAdvertisement>('Advertisement', AdvertisementSchema);

