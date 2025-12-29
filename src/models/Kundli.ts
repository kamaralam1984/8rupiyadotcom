import mongoose, { Schema, Document } from 'mongoose';

export interface IKundli extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  dateOfBirth: Date;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: number;
  longitude: number;
  
  // Calculated Data
  rashi: string;
  lagna: string;
  nakshatra: string;
  moonSign: string;
  sunSign: string;
  
  // Planetary Positions
  planets: {
    sun: { rashi: string; degree: number };
    moon: { rashi: string; degree: number };
    mars: { rashi: string; degree: number };
    mercury: { rashi: string; degree: number };
    jupiter: { rashi: string; degree: number };
    venus: { rashi: string; degree: number };
    saturn: { rashi: string; degree: number };
    rahu: { rashi: string; degree: number };
    ketu: { rashi: string; degree: number };
  };
  
  // Dasha
  currentDasha: {
    mahadasha: string;
    antardasha: string;
    pratyantardasha: string;
  };
  
  // Chart Data
  chartData: any; // Detailed chart information
  
  pdfUrl?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const KundliSchema = new Schema<IKundli>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    timeOfBirth: { type: String, required: true },
    placeOfBirth: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    
    rashi: { type: String },
    lagna: { type: String },
    nakshatra: { type: String },
    moonSign: { type: String },
    sunSign: { type: String },
    
    planets: {
      sun: { rashi: String, degree: Number },
      moon: { rashi: String, degree: Number },
      mars: { rashi: String, degree: Number },
      mercury: { rashi: String, degree: Number },
      jupiter: { rashi: String, degree: Number },
      venus: { rashi: String, degree: Number },
      saturn: { rashi: String, degree: Number },
      rahu: { rashi: String, degree: Number },
      ketu: { rashi: String, degree: Number },
    },
    
    currentDasha: {
      mahadasha: String,
      antardasha: String,
      pratyantardasha: String,
    },
    
    chartData: { type: Schema.Types.Mixed },
    pdfUrl: { type: String },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

KundliSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Kundli || mongoose.model<IKundli>('Kundli', KundliSchema);

