import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJyotishBooking extends Document {
  userId?: mongoose.Types.ObjectId;
  panditId: string;
  panditName: string;
  serviceType: 'call' | 'video';
  customerName: string;
  phone: string;
  email?: string;
  query: string;
  plan: 'free' | 'silver' | 'gold' | 'premium';
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  scheduledAt?: Date;
  completedAt?: Date;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JyotishBookingSchema = new Schema<IJyotishBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    panditId: {
      type: String,
      required: true,
      index: true,
    },
    panditName: {
      type: String,
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['call', 'video'],
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    query: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ['free', 'silver', 'gold', 'premium'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    scheduledAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentId: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
JyotishBookingSchema.index({ createdAt: -1 });
JyotishBookingSchema.index({ status: 1, createdAt: -1 });
JyotishBookingSchema.index({ panditId: 1, status: 1 });
JyotishBookingSchema.index({ userId: 1, status: 1 });

const JyotishBooking: Model<IJyotishBooking> =
  mongoose.models.JyotishBooking || mongoose.model<IJyotishBooking>('JyotishBooking', JyotishBookingSchema);

export default JyotishBooking;

