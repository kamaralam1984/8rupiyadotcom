import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId;
  
  // Personal Information
  fullName: string;
  nickName?: string;
  dateOfBirth?: Date;
  location?: {
    city: string;
    state: string;
    pincode?: string;
  };
  
  // Financial Information
  financial?: {
    salaryDate?: number; // 1-31 (day of month)
    salaryAmount?: number;
    rentDate?: number;
    rentAmount?: number;
    electricityBillDate?: number;
    electricityBillAmount?: number;
    otherBills?: Array<{
      name: string;
      amount: number;
      dueDate: number; // day of month
      category: string;
    }>;
  };
  
  // Medical Information
  medical?: {
    bloodGroup?: string;
    conditions?: string[]; // ['diabetes', 'BP', 'thyroid']
    allergies?: string[];
    primaryDoctor?: {
      name: string;
      phone?: string;
      specialization?: string;
    };
  };
  
  // Preferences
  preferences?: {
    language?: string;
    luckyColor?: string;
    notifications?: boolean;
    voiceEnabled?: boolean;
  };
  
  // Memory AI - Important Dates
  importantDates?: Array<{
    name: string;
    date: Date;
    type: 'birthday' | 'anniversary' | 'appointment' | 'other';
    recurringYearly?: boolean;
  }>;
  
  // Business Info (for shop owners)
  businessInfo?: {
    shopId?: mongoose.Types.ObjectId;
    shopName?: string;
    role?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      unique: true,
      index: true 
    },
    
    fullName: { type: String, required: true },
    nickName: { type: String },
    dateOfBirth: { type: Date },
    
    location: {
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    
    financial: {
      salaryDate: { type: Number, min: 1, max: 31 },
      salaryAmount: { type: Number },
      rentDate: { type: Number, min: 1, max: 31 },
      rentAmount: { type: Number },
      electricityBillDate: { type: Number, min: 1, max: 31 },
      electricityBillAmount: { type: Number },
      otherBills: [{
        name: { type: String },
        amount: { type: Number },
        dueDate: { type: Number, min: 1, max: 31 },
        category: { type: String },
      }],
    },
    
    medical: {
      bloodGroup: { type: String },
      conditions: [{ type: String }],
      allergies: [{ type: String }],
      primaryDoctor: {
        name: { type: String },
        phone: { type: String },
        specialization: { type: String },
      },
    },
    
    preferences: {
      language: { type: String, default: 'hi' },
      luckyColor: { type: String },
      notifications: { type: Boolean, default: true },
      voiceEnabled: { type: Boolean, default: true },
    },
    
    importantDates: [{
      name: { type: String },
      date: { type: Date },
      type: { 
        type: String, 
        enum: ['birthday', 'anniversary', 'appointment', 'other'],
        default: 'other' 
      },
      recurringYearly: { type: Boolean, default: false },
    }],
    
    businessInfo: {
      shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
      shopName: { type: String },
      role: { type: String },
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
UserProfileSchema.index({ 'location.city': 1 });
UserProfileSchema.index({ 'financial.salaryDate': 1 });
UserProfileSchema.index({ 'importantDates.date': 1 });

export default mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);

