import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  shopId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // Optional for anonymous reviews
  rating: number; // 1-5
  comment: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false }, // Optional for anonymous reviews
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReviewSchema.index({ shopId: 1 });
ReviewSchema.index({ userId: 1 });
// Sparse unique index: Only enforce uniqueness when userId exists
// This allows multiple anonymous reviews per shop, but logged-in users can only review once
ReviewSchema.index({ shopId: 1, userId: 1 }, { unique: true, sparse: true });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

