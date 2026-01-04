import mongoose, { Schema, Document } from 'mongoose';
import { ErrorStatus, ErrorType } from '@/types/error';

// Re-export for backward compatibility
export { ErrorStatus, ErrorType };

export interface IError extends Document {
  errorType: ErrorType;
  status: ErrorStatus;
  message: string;
  stack?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  userId?: mongoose.Types.ObjectId;
  sessionId?: string;
  metadata?: Record<string, any>;
  fixAttempts: number;
  lastFixAttempt?: Date;
  autoFixed?: boolean;
  fixDetails?: string;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ErrorSchema = new Schema<IError>(
  {
    errorType: {
      type: String,
      enum: Object.values(ErrorType),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ErrorStatus),
      default: ErrorStatus.PENDING,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    stack: {
      type: String,
    },
    endpoint: {
      type: String,
      index: true,
    },
    method: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    sessionId: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    fixAttempts: {
      type: Number,
      default: 0,
    },
    lastFixAttempt: {
      type: Date,
    },
    autoFixed: {
      type: Boolean,
      default: false,
    },
    fixDetails: {
      type: String,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
ErrorSchema.index({ status: 1, createdAt: -1 });
ErrorSchema.index({ errorType: 1, status: 1 });
ErrorSchema.index({ endpoint: 1, status: 1 });
ErrorSchema.index({ createdAt: -1 });

const Error = mongoose.models.Error || mongoose.model<IError>('Error', ErrorSchema);

export default Error;

