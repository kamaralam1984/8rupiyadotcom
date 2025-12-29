import mongoose, { Schema, Document } from 'mongoose';

export interface IJyotishPlan extends Document {
  name: string;
  type: 'free' | 'silver' | 'gold' | 'premium';
  price: number;
  duration: number; // days
  
  features: {
    aiChatMessages: number; // -1 for unlimited
    kundliGeneration: number;
    detailedPdf: boolean;
    matchMaking: boolean;
    personalPrediction: boolean;
    priority Support: boolean;
    freeConsultation: number; // minutes
  };
  
  isActive: boolean;
  displayOrder: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const JyotishPlanSchema = new Schema<IJyotishPlan>(
  {
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['free', 'silver', 'gold', 'premium'],
      required: true,
      unique: true
    },
    price: { type: Number, required: true },
    duration: { type: Number, default: 30 }, // days
    
    features: {
      aiChatMessages: { type: Number, default: 10 },
      kundliGeneration: { type: Number, default: 1 },
      detailedPdf: { type: Boolean, default: false },
      matchMaking: { type: Boolean, default: false },
      personalPrediction: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      freeConsultation: { type: Number, default: 0 },
    },
    
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.JyotishPlan || mongoose.model<IJyotishPlan>('JyotishPlan', JyotishPlanSchema);

