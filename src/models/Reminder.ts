import mongoose, { Schema, Document } from 'mongoose';

export enum ReminderType {
  GENERAL = 'GENERAL',
  MEETING = 'MEETING',
  MEDICINE = 'MEDICINE',
  ALARM = 'ALARM',
  BILL = 'BILL',
  SALARY = 'SALARY',
  RENT = 'RENT',
  BIRTHDAY = 'BIRTHDAY',
  APPOINTMENT = 'APPOINTMENT',
  CUSTOM = 'CUSTOM',
}

export enum ReminderStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  SNOOZED = 'SNOOZED',
}

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  type: ReminderType;
  title: string;
  message: string;
  scheduledTime: Date;
  notifyBeforeMinutes?: number;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    customInterval?: number; // for custom frequency in minutes
  };
  status: ReminderStatus;
  notifiedAt?: Date;
  snoozedUntil?: Date;
  metadata?: {
    medicineName?: string;
    dosage?: string;
    meetingTitle?: string;
    location?: string;
    billName?: string;
    amount?: number;
    category?: string;
    familyMemberId?: mongoose.Types.ObjectId;
    familyMemberName?: string;
  };
  voiceCommand?: string; // Original voice command from user
  alertCount?: number; // Number of times alerted (for bill reminders)
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(ReminderType),
      default: ReminderType.GENERAL,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    scheduledTime: {
      type: Date,
      required: true,
      index: true,
    },
    notifyBeforeMinutes: {
      type: Number,
      default: 5,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'custom'],
      },
      daysOfWeek: [Number],
      customInterval: Number,
    },
    status: {
      type: String,
      enum: Object.values(ReminderStatus),
      default: ReminderStatus.ACTIVE,
      index: true,
    },
    notifiedAt: Date,
    snoozedUntil: Date,
    metadata: {
      medicineName: String,
      dosage: String,
      meetingTitle: String,
      location: String,
      billName: String,
      amount: Number,
      category: String,
      familyMemberId: { type: Schema.Types.ObjectId, ref: 'FamilyMember' },
      familyMemberName: String,
    },
    voiceCommand: String,
    alertCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying of pending reminders
ReminderSchema.index({ userId: 1, scheduledTime: 1, status: 1 });
ReminderSchema.index({ scheduledTime: 1, status: 1 });

export default mongoose.models.Reminder || mongoose.model<IReminder>('Reminder', ReminderSchema);

