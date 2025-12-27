import mongoose, { Schema, Document } from 'mongoose';

export enum BlockType {
  BANNER = 'banner',
  CATEGORIES = 'categories',
  FEATURED_SHOPS = 'featured_shops',
  ADS = 'ads',
  GOOGLE_ADSENSE = 'google_adsense',
}

export interface IHomepageBlock extends Document {
  type: BlockType;
  title?: string;
  content: Record<string, any>; // Flexible content based on type
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HomepageBlockSchema = new Schema<IHomepageBlock>(
  {
    type: { type: String, enum: Object.values(BlockType), required: true },
    title: { type: String },
    content: { type: Schema.Types.Mixed, required: true },
    order: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

HomepageBlockSchema.index({ order: 1 });
HomepageBlockSchema.index({ isActive: 1 });

export default mongoose.models.HomepageBlock || mongoose.model<IHomepageBlock>('HomepageBlock', HomepageBlockSchema);

