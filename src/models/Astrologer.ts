import mongoose, { Schema, Document } from 'mongoose';

export interface IAstrologer extends Document {
  name: string;
  email: string;
  phone: string;
  photo: string;
  city: string;
  state: string;
  
  expertise: string[]; // ['Vedic Astrology', 'Numerology', 'Vastu', etc.]
  languages: string[]; // ['Hindi', 'English', etc.]
  experience: number; // years
  
  fees: {
    chat: number;
    call: number;
    video: number;
  };
  
  availability: {
    days: string[]; // ['Monday', 'Tuesday', etc.]
    timeSlots: string[]; // ['9:00-12:00', '14:00-18:00']
  };
  
  ratings: {
    average: number;
    count: number;
  };
  
  planType: 'free' | 'silver' | 'gold' | 'premium';
  
  whatsappNumber: string;
  isVerified: boolean;
  isActive: boolean;
  
  bio: string;
  qualification: string;
  
  totalConsultations: number;
  earnings: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const AstrologerSchema = new Schema<IAstrologer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    photo: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    
    expertise: [{ type: String }],
    languages: [{ type: String }],
    experience: { type: Number, default: 0 },
    
    fees: {
      chat: { type: Number, default: 0 },
      call: { type: Number, default: 0 },
      video: { type: Number, default: 0 },
    },
    
    availability: {
      days: [{ type: String }],
      timeSlots: [{ type: String }],
    },
    
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    
    planType: { 
      type: String, 
      enum: ['free', 'silver', 'gold', 'premium'],
      default: 'free'
    },
    
    whatsappNumber: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    
    bio: { type: String },
    qualification: { type: String },
    
    totalConsultations: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

AstrologerSchema.index({ city: 1, isActive: 1 });
AstrologerSchema.index({ planType: 1 });

export default mongoose.models.Astrologer || mongoose.model<IAstrologer>('Astrologer', AstrologerSchema);

