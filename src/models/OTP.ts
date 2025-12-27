import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  purpose: 'signup' | 'login' | 'reset-password';
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    purpose: { 
      type: String, 
      enum: ['signup', 'login', 'reset-password'], 
      required: true,
      default: 'signup'
    },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Create TTL index for automatic expiration
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);

