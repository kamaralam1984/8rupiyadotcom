import mongoose, { Schema, Document, Model } from 'mongoose';

// Summary Type
export enum SummaryType {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM',
}

// Summary Status
export enum SummaryStatus {
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface IWeeklySummary extends Document {
  userId: mongoose.Types.ObjectId;
  userName?: string;
  
  // Summary Period
  type: SummaryType;
  startDate: Date;
  endDate: Date;
  weekNumber?: number; // Week of the year (1-52)
  year: number;
  
  // Summary Content
  summary: string; // AI-generated summary
  keyInsights?: string[]; // Important points
  topCategories?: {
    category: string;
    count: number;
  }[];
  
  // Statistics
  totalConversations: number;
  totalRemindersSet: number;
  totalTasksCreated: number;
  totalShopsSearched: number;
  
  // Activity Breakdown
  activityBreakdown?: {
    shopping: number;
    reminders: number;
    medical: number;
    financial: number;
    family: number;
    astrology: number;
    travel: number;
    business: number;
    general: number;
  };
  
  // Important Events
  importantEvents?: {
    date: Date;
    event: string;
    category: string;
  }[];
  
  // User Preferences Learned
  preferencesLearned?: {
    preferredLanguage?: string;
    commonQueries?: string[];
    frequentCategories?: string[];
    activeHours?: string; // e.g., "Morning (6-10 AM)"
  };
  
  // Status
  status: SummaryStatus;
  generatedAt?: Date;
  errorMessage?: string;
  
  // Metadata
  conversationIds?: mongoose.Types.ObjectId[];
  processingTimeMs?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const WeeklySummarySchema: Schema<IWeeklySummary> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: {
      type: String,
    },
    
    // Summary Period
    type: {
      type: String,
      enum: Object.values(SummaryType),
      default: SummaryType.WEEKLY,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    weekNumber: {
      type: Number,
      min: 1,
      max: 52,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    
    // Summary Content
    summary: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    keyInsights: [{
      type: String,
      trim: true,
      maxlength: 500,
    }],
    topCategories: [{
      category: {
        type: String,
        required: true,
      },
      count: {
        type: Number,
        required: true,
        min: 0,
      },
    }],
    
    // Statistics
    totalConversations: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRemindersSet: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTasksCreated: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalShopsSearched: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Activity Breakdown
    activityBreakdown: {
      shopping: { type: Number, default: 0 },
      reminders: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      financial: { type: Number, default: 0 },
      family: { type: Number, default: 0 },
      astrology: { type: Number, default: 0 },
      travel: { type: Number, default: 0 },
      business: { type: Number, default: 0 },
      general: { type: Number, default: 0 },
    },
    
    // Important Events
    importantEvents: [{
      date: {
        type: Date,
        required: true,
      },
      event: {
        type: String,
        required: true,
        trim: true,
      },
      category: {
        type: String,
        required: true,
      },
    }],
    
    // User Preferences Learned
    preferencesLearned: {
      preferredLanguage: String,
      commonQueries: [String],
      frequentCategories: [String],
      activeHours: String,
    },
    
    // Status
    status: {
      type: String,
      enum: Object.values(SummaryStatus),
      default: SummaryStatus.GENERATING,
      index: true,
    },
    generatedAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    
    // Metadata
    conversationIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GoluConversation',
    }],
    processingTimeMs: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
WeeklySummarySchema.index({ userId: 1, type: 1, year: -1, weekNumber: -1 });
WeeklySummarySchema.index({ userId: 1, startDate: -1 });
WeeklySummarySchema.index({ userId: 1, status: 1 });

// Pre-save: Set generatedAt when status changes to COMPLETED
WeeklySummarySchema.pre('save', async function () {
  if (this.isModified('status') && this.status === SummaryStatus.COMPLETED && !this.generatedAt) {
    this.generatedAt = new Date();
  }
});

// Static Methods
WeeklySummarySchema.statics = {
  // Get latest summary for user
  async getLatestSummary(userId: mongoose.Types.ObjectId) {
    return this.findOne({
      userId,
      status: SummaryStatus.COMPLETED,
    })
      .sort({ endDate: -1 })
      .lean();
  },
  
  // Get all summaries for user
  async getUserSummaries(userId: mongoose.Types.ObjectId, limit: number = 10) {
    return this.find({
      userId,
      status: SummaryStatus.COMPLETED,
    })
      .sort({ endDate: -1 })
      .limit(limit)
      .lean();
  },
  
  // Check if summary exists for period
  async summaryExistsForPeriod(
    userId: mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date
  ) {
    const summary = await this.findOne({
      userId,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });
    return !!summary;
  },
  
  // Get summary for specific week
  async getWeeklySummary(userId: mongoose.Types.ObjectId, year: number, weekNumber: number) {
    return this.findOne({
      userId,
      type: SummaryType.WEEKLY,
      year,
      weekNumber,
      status: SummaryStatus.COMPLETED,
    }).lean();
  },
  
  // Get summary statistics
  async getSummaryStats(userId: mongoose.Types.ObjectId) {
    const summaries = await this.find({
      userId,
      status: SummaryStatus.COMPLETED,
    })
      .sort({ endDate: -1 })
      .limit(4) // Last 4 weeks
      .lean();
    
    if (summaries.length === 0) {
      return null;
    }
    
    const totalConversations = summaries.reduce((sum: number, s: any) => sum + s.totalConversations, 0);
    const totalReminders = summaries.reduce((sum: number, s: any) => sum + s.totalRemindersSet, 0);
    const totalTasks = summaries.reduce((sum: number, s: any) => sum + s.totalTasksCreated, 0);
    
    return {
      totalWeeks: summaries.length,
      avgConversationsPerWeek: Math.round(totalConversations / summaries.length),
      avgRemindersPerWeek: Math.round(totalReminders / summaries.length),
      avgTasksPerWeek: Math.round(totalTasks / summaries.length),
      lastSummary: summaries[0],
    };
  },
};

// Instance Methods
WeeklySummarySchema.methods = {
  // Mark as completed
  async markCompleted() {
    this.status = SummaryStatus.COMPLETED;
    this.generatedAt = new Date();
    return this.save();
  },
  
  // Mark as failed
  async markFailed(errorMessage: string) {
    this.status = SummaryStatus.FAILED;
    this.errorMessage = errorMessage;
    return this.save();
  },
};

// Prevent model recompilation in development
const WeeklySummary: Model<IWeeklySummary> =
  mongoose.models.WeeklySummary || mongoose.model<IWeeklySummary>('WeeklySummary', WeeklySummarySchema);

export default WeeklySummary;

