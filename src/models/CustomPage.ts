import mongoose, { Schema, Document } from 'mongoose';
import { PageComponentType, PageComponent, AnimationEffect } from '@/types/CustomPage';

// Re-export types for backward compatibility (server-side only)
export type { PageComponent, AnimationEffect } from '@/types/CustomPage';
export { PageComponentType } from '@/types/CustomPage';

export interface ICustomPage extends Document {
  title: string;
  slug: string; // URL-friendly identifier
  description?: string;
  isPublished: boolean;
  components: PageComponent[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PageComponentSchema = new Schema<PageComponent>(
  {
    type: { type: String, enum: Object.values(PageComponentType), required: true },
    order: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
    content: { type: Schema.Types.Mixed, required: true },
    animation: {
      type: {
        type: String,
        enum: ['fade', 'slide', 'zoom', 'bounce', 'rotate', 'none'],
        default: 'none',
      },
      duration: { type: Number, default: 500 },
      delay: { type: Number, default: 0 },
      direction: { type: String, enum: ['up', 'down', 'left', 'right'] },
    },
  },
  { _id: true }
);

const CustomPageSchema = new Schema<ICustomPage>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    isPublished: { type: Boolean, default: false },
    components: [PageComponentSchema],
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
  },
  { timestamps: true }
);

// Indexes
CustomPageSchema.index({ slug: 1 });
CustomPageSchema.index({ isPublished: 1 });
CustomPageSchema.index({ createdAt: -1 });

export default mongoose.models.CustomPage || mongoose.model<ICustomPage>('CustomPage', CustomPageSchema);

