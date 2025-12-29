import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  topic: string; // career, marriage, health, finance, general
  messages: IMessage[];
  userDetails?: {
    name?: string;
    dob?: Date;
    time?: string;
    place?: string;
  };
  isActive: boolean;
  tokensUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String, required: true, unique: true },
    topic: { 
      type: String, 
      enum: ['career', 'marriage', 'health', 'finance', 'general', 'remedies'],
      default: 'general'
    },
    messages: [{
      role: { type: String, enum: ['user', 'assistant'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }],
    userDetails: {
      name: String,
      dob: Date,
      time: String,
      place: String,
    },
    isActive: { type: Boolean, default: true },
    tokensUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ChatSchema.index({ userId: 1, createdAt: -1 });
ChatSchema.index({ sessionId: 1 });

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);

