import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  astrologerId: mongoose.Types.ObjectId;
  serviceType: 'chat' | 'call' | 'video';
  
  date: Date;
  time: string;
  duration: number; // in minutes
  
  amount: number;
  paymentId?: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  
  userDetails: {
    name: string;
    dob?: Date;
    birthTime?: string;
    birthPlace?: string;
  };
  
  notes?: string;
  rating?: number;
  review?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    astrologerId: { type: Schema.Types.ObjectId, ref: 'Astrologer', required: true },
    serviceType: { 
      type: String, 
      enum: ['chat', 'call', 'video'],
      required: true 
    },
    
    date: { type: Date, required: true },
    time: { type: String, required: true },
    duration: { type: Number, default: 30 },
    
    amount: { type: Number, required: true },
    paymentId: { type: String },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    },
    
    userDetails: {
      name: { type: String, required: true },
      dob: Date,
      birthTime: String,
      birthPlace: String,
    },
    
    notes: String,
    rating: { type: Number, min: 1, max: 5 },
    review: String,
  },
  { timestamps: true }
);

BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ astrologerId: 1, date: 1 });

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

