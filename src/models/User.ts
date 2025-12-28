import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@/types/user';

// Re-export UserRole for backward compatibility
export { UserRole };

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  agentId?: mongoose.Types.ObjectId; // For operators
  operatorId?: mongoose.Types.ObjectId; // For shoppers
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true, default: UserRole.USER },
    agentId: { type: Schema.Types.ObjectId, ref: 'User' },
    operatorId: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Note: email and phone indexes are automatically created by unique: true
UserSchema.index({ role: 1 });
UserSchema.index({ agentId: 1 });
UserSchema.index({ operatorId: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

