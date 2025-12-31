import mongoose, { Schema, Document } from 'mongoose';

export enum ConversationType {
  VOICE = 'VOICE',
  TEXT = 'TEXT',
}

export enum CommandCategory {
  GENERAL = 'GENERAL',
  REMINDER = 'REMINDER',
  ALARM = 'ALARM',
  MEDICINE = 'MEDICINE',
  MEETING = 'MEETING',
  SEARCH = 'SEARCH',
  LOCATION = 'LOCATION',
  TRANSLATION = 'TRANSLATION',
  WEATHER = 'WEATHER',
  SHOPPING = 'SHOPPING',
  CALCULATION = 'CALCULATION',
  TIME_DATE = 'TIME_DATE',
  NEWS = 'NEWS',
  MUSIC = 'MUSIC',
  PROFILE = 'PROFILE',
  FINANCIAL = 'FINANCIAL',
  MEDICAL = 'MEDICAL',
  FAMILY = 'FAMILY',
  BUSINESS = 'BUSINESS',
  ASTROLOGY = 'ASTROLOGY',
  CATEGORY = 'CATEGORY',
  TRAVEL = 'TRAVEL',
  OTHER = 'OTHER',
}

export interface IGoluConversation extends Document {
  userId?: mongoose.Types.ObjectId;
  sessionId: string;
  type: ConversationType;
  userQuery: string;
  detectedLanguage: string;
  translatedQuery?: string; // If not Hindi/English
  category: CommandCategory;
  goluResponse: string;
  responseInUserLanguage?: string;
  audioUrl?: string; // TTS audio file URL
  metadata?: {
    searchResults?: any[];
    locationData?: any;
    weatherData?: any;
    translationData?: any;
    calculationResult?: any;
    shopResults?: any[];
  };
  wasSuccessful: boolean;
  errorMessage?: string;
  processingTimeMs: number;
  createdAt: Date;
}

const GoluConversationSchema = new Schema<IGoluConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(ConversationType),
      default: ConversationType.TEXT,
      required: true,
    },
    userQuery: {
      type: String,
      required: true,
      trim: true,
    },
    detectedLanguage: {
      type: String,
      default: 'hi',
    },
    translatedQuery: String,
    category: {
      type: String,
      enum: Object.values(CommandCategory),
      default: CommandCategory.GENERAL,
      index: true,
    },
    goluResponse: {
      type: String,
      required: true,
    },
    responseInUserLanguage: String,
    audioUrl: String,
    metadata: {
      searchResults: [Schema.Types.Mixed],
      locationData: Schema.Types.Mixed,
      weatherData: Schema.Types.Mixed,
      translationData: Schema.Types.Mixed,
      calculationResult: Schema.Types.Mixed,
      shopResults: [Schema.Types.Mixed],
    },
    wasSuccessful: {
      type: Boolean,
      default: true,
    },
    errorMessage: String,
    processingTimeMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics
GoluConversationSchema.index({ userId: 1, createdAt: -1 });
GoluConversationSchema.index({ category: 1, createdAt: -1 });
GoluConversationSchema.index({ sessionId: 1, createdAt: -1 });

export default mongoose.models.GoluConversation || mongoose.model<IGoluConversation>('GoluConversation', GoluConversationSchema);

