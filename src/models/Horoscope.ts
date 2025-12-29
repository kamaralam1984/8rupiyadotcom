import mongoose, { Schema, Document } from 'mongoose';

export interface IHoroscope extends Document {
  rashi: string; // Mesh, Vrishabha, etc.
  type: 'daily' | 'weekly' | 'monthly';
  date: Date;
  content: {
    general: string;
    career: string;
    love: string;
    health: string;
    finance: string;
    luckyNumber: number;
    luckyColor: string;
    luckyTime: string;
  };
  generatedBy: 'ai' | 'manual';
  createdAt: Date;
  updatedAt: Date;
}

const HoroscopeSchema = new Schema<IHoroscope>(
  {
    rashi: { 
      type: String, 
      required: true,
      enum: ['Mesh', 'Vrishabha', 'Mithun', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchik', 'Dhanu', 'Makar', 'Kumbh', 'Meen']
    },
    type: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly'],
      required: true 
    },
    date: { type: Date, required: true },
    content: {
      general: { type: String, required: true },
      career: { type: String },
      love: { type: String },
      health: { type: String },
      finance: { type: String },
      luckyNumber: { type: Number },
      luckyColor: { type: String },
      luckyTime: { type: String },
    },
    generatedBy: { 
      type: String, 
      enum: ['ai', 'manual'],
      default: 'ai'
    },
  },
  { timestamps: true }
);

HoroscopeSchema.index({ rashi: 1, type: 1, date: -1 });

export default mongoose.models.Horoscope || mongoose.model<IHoroscope>('Horoscope', HoroscopeSchema);

