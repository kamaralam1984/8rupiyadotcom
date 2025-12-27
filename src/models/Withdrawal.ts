import mongoose, { Schema, Document } from 'mongoose';

export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
}

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  accountDetails: {
    accountNumber: string;
    ifsc: string;
    accountHolderName: string;
    bankName: string;
  };
  status: WithdrawalStatus;
  approvedBy?: mongoose.Types.ObjectId;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    accountDetails: {
      accountNumber: { type: String, required: true },
      ifsc: { type: String, required: true },
      accountHolderName: { type: String, required: true },
      bankName: { type: String, required: true },
    },
    status: { type: String, enum: Object.values(WithdrawalStatus), default: WithdrawalStatus.PENDING },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

WithdrawalSchema.index({ userId: 1 });
WithdrawalSchema.index({ status: 1 });

export default mongoose.models.Withdrawal || mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);

