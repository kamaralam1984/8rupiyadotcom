import mongoose, { Schema, Document, Model } from 'mongoose';

// Task Status
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Task Category
export enum TaskCategory {
  WORK = 'WORK',
  PERSONAL = 'PERSONAL',
  SHOPPING = 'SHOPPING',
  HEALTH = 'HEALTH',
  FAMILY = 'FAMILY',
  FINANCE = 'FINANCE',
  OTHER = 'OTHER',
}

export interface IUnprioritizedTask extends Document {
  userId: mongoose.Types.ObjectId;
  userName?: string;
  
  // Task Details
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  
  // Links and References
  links?: string[];
  relatedShops?: mongoose.Types.ObjectId[];
  relatedReminders?: mongoose.Types.ObjectId[];
  
  // Metadata
  notes?: string;
  tags?: string[];
  estimatedTime?: number; // in minutes
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  
  // Soft Delete
  isDeleted: boolean;
}

const UnprioritizedTaskSchema: Schema<IUnprioritizedTask> = new Schema(
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
    
    // Task Details
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      enum: Object.values(TaskCategory),
      default: TaskCategory.OTHER,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING,
      index: true,
    },
    
    // Links and References
    links: [{
      type: String,
      trim: true,
    }],
    relatedShops: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
    }],
    relatedReminders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reminder',
    }],
    
    // Metadata
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    estimatedTime: {
      type: Number, // in minutes
      min: 0,
    },
    
    // Dates
    completedAt: {
      type: Date,
    },
    
    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
UnprioritizedTaskSchema.index({ userId: 1, status: 1, isDeleted: 1 });
UnprioritizedTaskSchema.index({ userId: 1, category: 1, isDeleted: 1 });
UnprioritizedTaskSchema.index({ userId: 1, createdAt: -1 });

// Pre-save: Auto-set completedAt when status changes to COMPLETED
UnprioritizedTaskSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === TaskStatus.COMPLETED && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

// Static Methods
UnprioritizedTaskSchema.statics = {
  // Get all active tasks for a user
  async getActiveTasks(userId: mongoose.Types.ObjectId) {
    return this.find({
      userId,
      status: { $in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .lean();
  },
  
  // Get tasks by category
  async getTasksByCategory(userId: mongoose.Types.ObjectId, category: TaskCategory) {
    return this.find({
      userId,
      category,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .lean();
  },
  
  // Get completed tasks
  async getCompletedTasks(userId: mongoose.Types.ObjectId, limit: number = 10) {
    return this.find({
      userId,
      status: TaskStatus.COMPLETED,
      isDeleted: false,
    })
      .sort({ completedAt: -1 })
      .limit(limit)
      .lean();
  },
  
  // Get task statistics
  async getTaskStats(userId: mongoose.Types.ObjectId) {
    const stats = await this.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    
    const result: any = {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
    };
    
    stats.forEach((stat) => {
      result.total += stat.count;
      if (stat._id === TaskStatus.PENDING) result.pending = stat.count;
      if (stat._id === TaskStatus.IN_PROGRESS) result.inProgress = stat.count;
      if (stat._id === TaskStatus.COMPLETED) result.completed = stat.count;
      if (stat._id === TaskStatus.CANCELLED) result.cancelled = stat.count;
    });
    
    return result;
  },
};

// Instance Methods
UnprioritizedTaskSchema.methods = {
  // Mark task as completed
  async markComplete() {
    this.status = TaskStatus.COMPLETED;
    this.completedAt = new Date();
    return this.save();
  },
  
  // Mark task as cancelled
  async markCancelled() {
    this.status = TaskStatus.CANCELLED;
    return this.save();
  },
  
  // Soft delete task
  async softDelete() {
    this.isDeleted = true;
    return this.save();
  },
};

// Prevent model recompilation in development
const UnprioritizedTask: Model<IUnprioritizedTask> =
  mongoose.models.UnprioritizedTask || mongoose.model<IUnprioritizedTask>('UnprioritizedTask', UnprioritizedTaskSchema);

export default UnprioritizedTask;

