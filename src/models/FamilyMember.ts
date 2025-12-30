import mongoose, { Schema, Document } from 'mongoose';

export interface IFamilyMember extends Document {
  userId: mongoose.Types.ObjectId; // Owner
  
  name: string;
  relation: string; // 'mother', 'father', 'spouse', 'child', 'sibling', 'other'
  phone?: string;
  dateOfBirth?: Date;
  
  // Medical info for family member
  medical?: {
    medicines?: Array<{
      name: string;
      time: string;
      reminderEnabled: boolean;
    }>;
    conditions?: string[];
  };
  
  // Reminders for this family member
  reminders?: Array<{
    message: string;
    time: string;
    notifyOnUserPhone: boolean; // Send to user's phone
    notifyOnMemberPhone: boolean; // Send to family member's phone
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

const FamilyMemberSchema = new Schema<IFamilyMember>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    
    name: { type: String, required: true },
    relation: { 
      type: String, 
      enum: ['mother', 'father', 'spouse', 'child', 'sibling', 'other'],
      required: true 
    },
    phone: { type: String },
    dateOfBirth: { type: Date },
    
    medical: {
      medicines: [{
        name: { type: String },
        time: { type: String },
        reminderEnabled: { type: Boolean, default: true },
      }],
      conditions: [{ type: String }],
    },
    
    reminders: [{
      message: { type: String },
      time: { type: String },
      notifyOnUserPhone: { type: Boolean, default: true },
      notifyOnMemberPhone: { type: Boolean, default: false },
    }],
  },
  { timestamps: true }
);

// Indexes
FamilyMemberSchema.index({ userId: 1 });
FamilyMemberSchema.index({ phone: 1 });

export default mongoose.models.FamilyMember || mongoose.model<IFamilyMember>('FamilyMember', FamilyMemberSchema);

