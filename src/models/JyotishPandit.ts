import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJyotishPandit extends Document {
  name: string;
  email: string;
  phone: string;
  image?: string;
  expertise: string[];
  experience: string;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  languages: string[];
  specialties: string[];
  plan: 'free' | 'silver' | 'gold' | 'premium';
  price: number;
  available: boolean;
  bio?: string;
  education?: string[];
  certifications?: string[];
  workingHours?: {
    start: string;
    end: string;
    days: string[];
  };
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JyotishPanditSchema = new Schema<IJyotishPandit>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    expertise: [{
      type: String,
      trim: true,
    }],
    experience: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    languages: [{
      type: String,
      trim: true,
    }],
    specialties: [{
      type: String,
      trim: true,
    }],
    plan: {
      type: String,
      enum: ['free', 'silver', 'gold', 'premium'],
      default: 'free',
      index: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    available: {
      type: Boolean,
      default: true,
      index: true,
    },
    bio: {
      type: String,
    },
    education: [{
      type: String,
    }],
    certifications: [{
      type: String,
    }],
    workingHours: {
      start: String,
      end: String,
      days: [String],
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
JyotishPanditSchema.index({ rating: -1 });
JyotishPanditSchema.index({ plan: 1, available: 1 });
JyotishPanditSchema.index({ isActive: 1, isVerified: 1 });

const JyotishPandit: Model<IJyotishPandit> =
  mongoose.models.JyotishPandit || mongoose.model<IJyotishPandit>('JyotishPandit', JyotishPanditSchema);

export default JyotishPandit;

