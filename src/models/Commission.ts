import mongoose, { Schema, Document } from 'mongoose';

export interface ICommission extends Document {
  paymentId: mongoose.Types.ObjectId;
  shopId: mongoose.Types.ObjectId;
  agentId?: mongoose.Types.ObjectId;
  operatorId?: mongoose.Types.ObjectId;
  agentAmount: number; // 20% of payment
  operatorAmount: number; // 10% of remaining (80%)
  companyAmount: number; // Rest
  totalAmount: number;
  status: 'pending' | 'paid' | 'withdrawn';
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionSchema = new Schema<ICommission>(
  {
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'User' },
    operatorId: { type: Schema.Types.ObjectId, ref: 'User' },
    agentAmount: { type: Number, default: 0 },
    operatorAmount: { type: Number, default: 0 },
    companyAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'withdrawn'], default: 'pending' },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

CommissionSchema.index({ paymentId: 1 });
CommissionSchema.index({ agentId: 1 });
CommissionSchema.index({ operatorId: 1 });
CommissionSchema.index({ status: 1 });

export default mongoose.models.Commission || mongoose.model<ICommission>('Commission', CommissionSchema);

