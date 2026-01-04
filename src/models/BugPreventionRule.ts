import mongoose, { Schema, Document } from 'mongoose';
import { BugPriority, BugCategory } from '@/types/bug';

export interface IBugPreventionRule extends Document {
  name: string;
  description: string;
  pattern: string; // Regex or pattern to match
  category: BugCategory;
  priority: BugPriority;
  action: 'block' | 'warn' | 'log';
  enabled: boolean;
  conditions?: Record<string, any>;
  preventionCode?: string; // Code snippet that prevents the bug
  examples?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BugPreventionRuleSchema = new Schema<IBugPreventionRule>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    pattern: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(BugCategory),
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(BugPriority),
      default: BugPriority.MEDIUM,
    },
    action: {
      type: String,
      enum: ['block', 'warn', 'log'],
      default: 'warn',
    },
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    conditions: {
      type: Schema.Types.Mixed,
      default: {},
    },
    preventionCode: {
      type: String,
    },
    examples: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
BugPreventionRuleSchema.index({ enabled: 1, category: 1 });
BugPreventionRuleSchema.index({ name: 1 });

const BugPreventionRule = mongoose.models.BugPreventionRule || mongoose.model<IBugPreventionRule>('BugPreventionRule', BugPreventionRuleSchema);

export default BugPreventionRule;

