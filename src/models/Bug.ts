import mongoose, { Schema, Document } from 'mongoose';
import { BugPriority, BugSeverity, BugStatus, BugCategory } from '@/types/bug';

export interface IBug extends Document {
  title: string;
  description: string;
  priority: BugPriority;
  severity: BugSeverity;
  status: BugStatus;
  category: BugCategory;
  errorId?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  reportedBy?: mongoose.Types.ObjectId;
  tags?: string[];
  stepsToReproduce?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  environment?: string;
  browser?: string;
  device?: string;
  screenshots?: string[];
  relatedBugs?: mongoose.Types.ObjectId[];
  preventionRules?: mongoose.Types.ObjectId[];
  fixDetails?: string;
  fixCode?: string;
  testResults?: string;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const BugSchema = new Schema<IBug>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(BugPriority),
      default: BugPriority.MEDIUM,
      index: true,
    },
    severity: {
      type: String,
      enum: Object.values(BugSeverity),
      default: BugSeverity.MODERATE,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(BugStatus),
      default: BugStatus.NEW,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(BugCategory),
      required: true,
      index: true,
    },
    errorId: {
      type: Schema.Types.ObjectId,
      ref: 'Error',
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    stepsToReproduce: [{
      type: String,
    }],
    expectedBehavior: {
      type: String,
    },
    actualBehavior: {
      type: String,
    },
    environment: {
      type: String,
    },
    browser: {
      type: String,
    },
    device: {
      type: String,
    },
    screenshots: [{
      type: String,
    }],
    relatedBugs: [{
      type: Schema.Types.ObjectId,
      ref: 'Bug',
    }],
    preventionRules: [{
      type: Schema.Types.ObjectId,
      ref: 'BugPreventionRule',
    }],
    fixDetails: {
      type: String,
    },
    fixCode: {
      type: String,
    },
    testResults: {
      type: String,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
BugSchema.index({ status: 1, priority: -1, createdAt: -1 });
BugSchema.index({ category: 1, status: 1 });
BugSchema.index({ assignedTo: 1, status: 1 });
BugSchema.index({ priority: 1, severity: 1 });
BugSchema.index({ createdAt: -1 });
BugSchema.index({ title: 'text', description: 'text' }); // Text search

const Bug = mongoose.models.Bug || mongoose.model<IBug>('Bug', BugSchema);

export default Bug;

