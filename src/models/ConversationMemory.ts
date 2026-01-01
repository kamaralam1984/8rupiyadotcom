/**
 * GOLU 7-DAY MEMORY SYSTEM
 * Stores recent conversations for context continuity
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IConversationMemory extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  userName: string;
  userRole: 'admin' | 'agent' | 'shopper' | 'operator' | 'accountant' | 'user';
  conversations: Array<{
    query: string;
    response: string;
    category: string;
    timestamp: Date;
  }>;
  summary: string; // AI-generated summary of conversation
  importantInfo: string[]; // Key facts extracted
  createdAt: Date;
  lastAccessedAt: Date;
  expiresAt: Date; // Auto-delete after 7 days
}

const ConversationMemorySchema = new Schema<IConversationMemory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  userName: {
    type: String,
    default: 'Dost',
  },
  userRole: {
    type: String,
    enum: ['admin', 'agent', 'shopper', 'operator', 'accountant', 'user'],
    default: 'user',
  },
  conversations: [{
    query: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'GENERAL',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  summary: {
    type: String,
    default: '',
  },
  importantInfo: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    index: true,
  },
});

// Compound index for efficient queries
ConversationMemorySchema.index({ userId: 1, createdAt: -1 });
ConversationMemorySchema.index({ sessionId: 1, createdAt: -1 });

// Auto-delete expired memories
ConversationMemorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Limit conversations array to last 20 entries
ConversationMemorySchema.pre('save', function(this: IConversationMemory) {
  if (this.conversations && this.conversations.length > 20) {
    this.conversations = this.conversations.slice(-20);
  }
});

export default mongoose.models.ConversationMemory || 
  mongoose.model<IConversationMemory>('ConversationMemory', ConversationMemorySchema);

